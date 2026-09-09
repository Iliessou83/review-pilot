/**
 * Core review processing logic — called directly from the sync cron
 * instead of HTTP self-calls (eliminates SSRF + CRON_SECRET exfiltration risk).
 */
import { db } from "@/lib/db";
import { reviews, businesses, pendingResponses, reviewActivityEvents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateAutoResponse, generateResponseSuggestions, type FactContext, type BrandVoice } from "@/lib/claude";
import { assessReviewRisk } from "@/lib/risk-detection";
import { escapeHtml } from "@/lib/escape-html";
import { envoyer, EXPEDITEUR_NOTIF } from "@/lib/email";
import { SignJWT } from "jose";
import { googleAccessToken } from "@/lib/google-oauth";
import { decryptToken } from "@/lib/token-crypto";
import { smsConfigured, sendSms, normalizePhoneFR } from "@/lib/sms";
import { ADMIN_EMAILS } from "@/lib/auth";

type Review = typeof reviews.$inferSelect;
type Business = typeof businesses.$inferSelect;

function voiceOf(business: Business): BrandVoice {
  return {
    signatureName: business.signatureName,
    brandTone: business.brandTone as BrandVoice["brandTone"],
    tutoiement: business.tutoiement,
  };
}

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured");
  return new TextEncoder().encode(secret);
}

async function createQuickToken(pendingId: number, choice: number): Promise<string> {
  return new SignJWT({ pendingId, choice })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("48h")
    .sign(getJwtSecret());
}

async function postGoogleReply(reviewId: string, text: string, token: string): Promise<void> {
  const res = await fetch(`https://mybusiness.googleapis.com/v4/${reviewId}/reply`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ comment: text }),
  });
  if (!res.ok) throw new Error(`Google reply failed: ${res.status}`);
}

async function postTrustpilotReply(businessUnitId: string, reviewId: string, text: string, apiKey: string): Promise<void> {
  if (process.env.ENABLE_TRUSTPILOT_INTEGRATION !== "true") {
    throw new Error("Publication Trustpilot désactivée pendant la validation de la licence d’intégration");
  }
  const res = await fetch(
    `https://api.trustpilot.com/v1/private/business-units/${businessUnitId}/reviews/${reviewId}/reply`,
    {
      method: "POST",
      headers: { apikey: apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    }
  );
  if (!res.ok) throw new Error(`Trustpilot reply failed: ${res.status}`);
}

export function buildNotificationEmail(
  ownerEmail: string,
  businessName: string,
  authorName: string,
  rating: number,
  reviewText: string,
  suggestions: string[],
  tokens: string[],
  appUrl: string,
  riskReasons: string[] = [],
  managedByCaela = false
) {
  const safe = {
    businessName: escapeHtml(businessName),
    authorName: escapeHtml(authorName),
    reviewText: escapeHtml(reviewText.slice(0, 500)),
    s0: escapeHtml(suggestions[0]),
    s1: escapeHtml(suggestions[1]),
    s2: escapeHtml(suggestions[2]),
  };

  const riskBanner = riskReasons.length > 0 ? `
    <div style="background:#FEF7E0;border:1px solid rgba(224,161,26,0.4);border-radius:8px;padding:12px 16px;margin-bottom:16px;">
      <div style="font-size:13px;font-weight:700;color:#B06000;">🚩 Point à vérifier avant de valider</div>
      <div style="font-size:12px;color:#5F6368;margin-top:4px;">
        Sujet sensible détecté (${escapeHtml(riskReasons.join(", "))}). Relisez la réponse proposée : ne validez pas une excuse sur un fait que vous n'avez pas vous-même confirmé.
      </div>
    </div>` : "";

  return {
    from: EXPEDITEUR_NOTIF,
    to: ownerEmail,
    subject: `${managedByCaela ? "[Équipe Caela] " : ""}Avis ${rating}★ pour ${safe.businessName} — action requise`,
    html: `
<div style="font-family:'Inter',system-ui,sans-serif;max-width:600px;margin:0 auto;background:#fff;border:1px solid #DADCE0;border-radius:12px;overflow:hidden;">
  <div style="background:#2457C5;padding:20px 28px;display:flex;align-items:center;gap:10px;">
    <span style="color:#fff;font-size:18px;font-weight:700;">Caela Réputation</span>
  </div>
  <div style="padding:24px 28px 0;">
    <div style="background:#FCE8E6;border-radius:8px;padding:14px 16px;margin-bottom:20px;">
      <div style="font-size:14px;font-weight:700;color:#D6455D;">Avis ${rating}★ — action requise</div>
      <div style="font-size:12px;color:#5F6368;">${safe.businessName} · ${safe.authorName}</div>
    </div>
    ${riskBanner}
    <div style="background:#F8F9FA;border-left:3px solid #DADCE0;border-radius:0 8px 8px 0;padding:12px 16px;margin-bottom:24px;">
      <div style="font-size:12px;color:#5F6368;margin-bottom:4px;">${safe.authorName} écrit :</div>
      <div style="font-size:14px;color:#202124;font-style:italic;">&ldquo;${safe.reviewText}&rdquo;</div>
    </div>
    <div style="font-size:14px;font-weight:600;color:#202124;margin-bottom:14px;">${managedByCaela ? "Cet avis a été délégué à l’équipe Caela. Relisez une proposition avant de confirmer sa publication :" : "Ouvrez une proposition, vérifiez-la, puis confirmez sa publication :"}</div>
  </div>
  <div style="padding:0 28px;">
    <a href="${appUrl}/quick-reply?t=${tokens[0]}" style="display:block;margin-bottom:10px;padding:14px 18px;background:#FCE8E6;border:1px solid rgba(214,69,93,0.3);border-radius:10px;text-decoration:none;">
      <div style="font-size:12px;font-weight:700;color:#D6455D;margin-bottom:5px;">💛 EMPATHIQUE</div>
      <div style="font-size:13px;color:#202124;">${safe.s0}</div>
    </a>
    <a href="${appUrl}/quick-reply?t=${tokens[1]}" style="display:block;margin-bottom:10px;padding:14px 18px;background:#E6F4EA;border:1px solid rgba(22,133,107,0.3);border-radius:10px;text-decoration:none;">
      <div style="font-size:12px;font-weight:700;color:#16856B;margin-bottom:5px;">🎯 SOLUTION</div>
      <div style="font-size:13px;color:#202124;">${safe.s1}</div>
    </a>
    <a href="${appUrl}/quick-reply?t=${tokens[2]}" style="display:block;margin-bottom:10px;padding:14px 18px;background:#E8F0FE;border:1px solid rgba(36,87,197,0.3);border-radius:10px;text-decoration:none;">
      <div style="font-size:12px;font-weight:700;color:#2457C5;margin-bottom:5px;">🏆 PROFESSIONNEL</div>
      <div style="font-size:13px;color:#202124;">${safe.s2}</div>
    </a>
  </div>
  <div style="padding:20px 28px;border-top:1px solid #DADCE0;margin-top:20px;text-align:center;">
    <a href="${appUrl}/pending" style="color:#2457C5;font-size:13px;font-weight:500;">Gérer depuis le dashboard →</a>
    <p style="margin:12px 0 0;font-size:10px;color:#80868B;">Caela Réputation est un outil indépendant, non affilié à Google LLC.</p>
  </div>
</div>`,
  };
}

/**
 * Auto-respond to a high-rated review (4-5★).
 * Only marks `responded: true` if the platform API call succeeded.
 */
export async function processHighRatedReview(review: Review, business: Business): Promise<void> {
  if (review.responded) return;

  const risk = assessReviewRisk(review.text, business.productFacts, business.escalationKeywords);
  if (risk.escalate || business.regulatedSector) {
    // Sujet sensible malgré la bonne note (ex: 5★ qui évoque quand même un point santé/hygiène),
    // OU établissement en profession réglementée (santé, droit, funéraire...) : jamais
    // d'auto-publication, toujours repasser par la validation humaine. Voir manque #4 de
    // l'audit "Avant Commercialisation" 2026-08-27.
    await processLowRatedReview(review, business, risk);
    return;
  }

  const factContext: FactContext = {
    productFacts: business.productFacts,
    factCheckNotes: risk.factCheckNotes,
    compensationEnabled: business.compensationEnabled,
    compensationText: business.compensationText,
  };

  let responseText: string;
  try {
    responseText = await generateAutoResponse(review.text, review.authorName, business.name, review.rating, factContext, voiceOf(business));
  } catch (err) {
    console.error(`Auto-response generation failed for review ${review.id}:`, err);
    return;
  }

  try {
    if (review.platform === "google") {
      // platform_token = refresh_token OAuth chiffré → jeton d'accès frais pour publier.
      const access = await googleAccessToken(business);
      await postGoogleReply(review.platformReviewId, responseText, access);
    } else {
      await postTrustpilotReply(business.platformId, review.platformReviewId, responseText, decryptToken(business.platformToken));
    }
    const respondedAt = new Date();
    await db.update(reviews)
      .set({ responded: true, responseText, respondedAt: new Date() })
      .where(eq(reviews.id, review.id));
    await db.insert(reviewActivityEvents).values({
      businessId: business.id,
      platform: review.platform,
      eventType: "reply_published",
      handlingMode: "automated",
      latencySeconds: Math.max(0, Math.round((respondedAt.getTime() - review.publishedAt.getTime()) / 1000)),
      occurredAt: respondedAt,
    });
  } catch (err) {
    console.error(`Platform post failed for review ${review.id}:`, err);
  }
}

/**
 * Generate suggestions + notify owner for a low-rated review (1-3★)
 * or a 4★ without auto-reply enabled.
 * Idempotent: skips if a pending response already exists.
 */
export async function processLowRatedReview(
  review: Review,
  business: Business,
  precomputedRisk?: ReturnType<typeof assessReviewRisk>
): Promise<void> {
  if (review.responded) return;
  const existing = await db
    .select({ id: pendingResponses.id })
    .from(pendingResponses)
    .where(eq(pendingResponses.reviewId, review.id))
    .limit(1);
  if (existing.length > 0) return;

  const risk = precomputedRisk ?? assessReviewRisk(review.text, business.productFacts, business.escalationKeywords);
  const factContext: FactContext = {
    productFacts: business.productFacts,
    factCheckNotes: risk.factCheckNotes,
    compensationEnabled: business.compensationEnabled,
    compensationText: business.compensationText,
  };

  let suggestions: string[];
  try {
    suggestions = await generateResponseSuggestions(review.text, review.authorName, business.name, review.rating, factContext, voiceOf(business));
  } catch (err) {
    console.error(`Suggestion generation failed for review ${review.id}:`, err);
    return;
  }

  const [pending] = await db.insert(pendingResponses).values({
    reviewId: review.id, suggestions, status: "pending",
  }).returning();

  const tokens = await Promise.all([
    createQuickToken(pending.id, 0),
    createQuickToken(pending.id, 1),
    createQuickToken(pending.id, 2),
  ]);

  const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  // En délégation totale, l'équipe Caela reprend les avis négatifs mais aussi
  // tout avis signalé comme sensible, même si sa note est élevée.
  const managedByCaela = process.env.ENABLE_CAELA_HUMAN_DELEGATION === "true" && business.autoReplyNegative && (
    review.rating <= 3 || risk.escalate || business.regulatedSector
  );
  const notificationEmail = managedByCaela
    ? process.env.REVIEW_TEAM_EMAIL || ADMIN_EMAILS[0] || business.ownerEmail
    : business.ownerEmail;

  try {
    await envoyer(
      buildNotificationEmail(notificationEmail, business.name, review.authorName, review.rating, review.text, suggestions, tokens, appUrl, risk.reasons, managedByCaela)
    );
  } catch (err) {
    console.error(`Notification email failed for review ${review.id}:`, err);
  }

  // Alerte immédiate par SMS sur avis réellement négatif (1-3★), en plus de
  // l'email : dégrade proprement si aucun fournisseur SMS n'est configuré ou
  // si le commerçant n'a pas renseigné son numéro. Voir manque #5 de l'audit
  // "Avant Commercialisation" 2026-08-27 — un avis 1★ ne doit plus attendre
  // le prochain passage du cron pour être vu.
  const ownerPhoneE164 = business.ownerPhone ? normalizePhoneFR(business.ownerPhone) : null;
  if (review.rating <= 3 && smsConfigured() && ownerPhoneE164) {
    try {
      const res = await sendSms(
        ownerPhoneE164,
        `⚠️ Avis ${review.rating}★ chez ${business.name} : "${review.text.slice(0, 80)}${review.text.length > 80 ? "…" : ""}" — réponds vite: ${appUrl}/pending`
      );
      if (!res.ok) console.error(`SMS alert failed for review ${review.id}: ${res.error}`);
    } catch (err) {
      console.error(`SMS alert failed for review ${review.id}:`, err);
    }
  }
}
