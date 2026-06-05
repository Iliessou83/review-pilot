/**
 * Core review processing logic — called directly from the sync cron
 * instead of HTTP self-calls (eliminates SSRF + CRON_SECRET exfiltration risk).
 */
import { db } from "@/lib/db";
import { reviews, businesses, pendingResponses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateAutoResponse, generateResponseSuggestions } from "@/lib/claude";
import { escapeHtml } from "@/lib/escape-html";
import { Resend } from "resend";
import { SignJWT } from "jose";

type Review = typeof reviews.$inferSelect;
type Business = typeof businesses.$inferSelect;

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
  appUrl: string
) {
  const safe = {
    businessName: escapeHtml(businessName),
    authorName: escapeHtml(authorName),
    reviewText: escapeHtml(reviewText.slice(0, 500)),
    s0: escapeHtml(suggestions[0]),
    s1: escapeHtml(suggestions[1]),
    s2: escapeHtml(suggestions[2]),
  };

  return {
    from: "Caela Réputation <notifications@caela.fr>",
    to: ownerEmail,
    subject: `Avis ${rating}★ pour ${safe.businessName} — action requise`,
    html: `
<div style="font-family:'Google Sans',system-ui,sans-serif;max-width:600px;margin:0 auto;background:#fff;border:1px solid #DADCE0;border-radius:12px;overflow:hidden;">
  <div style="background:#1A73E8;padding:20px 28px;display:flex;align-items:center;gap:10px;">
    <span style="color:#fff;font-size:18px;font-weight:700;">Caela Réputation</span>
  </div>
  <div style="padding:24px 28px 0;">
    <div style="background:#FCE8E6;border-radius:8px;padding:14px 16px;margin-bottom:20px;">
      <div style="font-size:14px;font-weight:700;color:#EA4335;">Avis ${rating}★ — action requise</div>
      <div style="font-size:12px;color:#5F6368;">${safe.businessName} · ${safe.authorName}</div>
    </div>
    <div style="background:#F8F9FA;border-left:3px solid #DADCE0;border-radius:0 8px 8px 0;padding:12px 16px;margin-bottom:24px;">
      <div style="font-size:12px;color:#5F6368;margin-bottom:4px;">${safe.authorName} écrit :</div>
      <div style="font-size:14px;color:#202124;font-style:italic;">&ldquo;${safe.reviewText}&rdquo;</div>
    </div>
    <div style="font-size:14px;font-weight:600;color:#202124;margin-bottom:14px;">Choisissez votre réponse en 1 clic :</div>
  </div>
  <div style="padding:0 28px;">
    <a href="${appUrl}/api/quick-reply?t=${tokens[0]}" style="display:block;margin-bottom:10px;padding:14px 18px;background:#FCE8E6;border:1px solid rgba(234,67,53,0.3);border-radius:10px;text-decoration:none;">
      <div style="font-size:12px;font-weight:700;color:#EA4335;margin-bottom:5px;">💛 EMPATHIQUE</div>
      <div style="font-size:13px;color:#202124;">${safe.s0}</div>
    </a>
    <a href="${appUrl}/api/quick-reply?t=${tokens[1]}" style="display:block;margin-bottom:10px;padding:14px 18px;background:#E6F4EA;border:1px solid rgba(52,168,83,0.3);border-radius:10px;text-decoration:none;">
      <div style="font-size:12px;font-weight:700;color:#34A853;margin-bottom:5px;">🎯 SOLUTION</div>
      <div style="font-size:13px;color:#202124;">${safe.s1}</div>
    </a>
    <a href="${appUrl}/api/quick-reply?t=${tokens[2]}" style="display:block;margin-bottom:10px;padding:14px 18px;background:#E8F0FE;border:1px solid rgba(26,115,232,0.3);border-radius:10px;text-decoration:none;">
      <div style="font-size:12px;font-weight:700;color:#1A73E8;margin-bottom:5px;">🏆 PROFESSIONNEL</div>
      <div style="font-size:13px;color:#202124;">${safe.s2}</div>
    </a>
  </div>
  <div style="padding:20px 28px;border-top:1px solid #DADCE0;margin-top:20px;text-align:center;">
    <a href="${appUrl}/pending" style="color:#1A73E8;font-size:13px;font-weight:500;">Gérer depuis le dashboard →</a>
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

  let responseText: string;
  try {
    responseText = await generateAutoResponse(review.text, review.authorName, business.name, review.rating);
  } catch (err) {
    console.error(`Auto-response generation failed for review ${review.id}:`, err);
    return;
  }

  try {
    if (review.platform === "google") {
      await postGoogleReply(review.platformReviewId, responseText, business.platformToken);
    } else {
      await postTrustpilotReply(business.platformId, review.platformReviewId, responseText, business.platformToken);
    }
    await db.update(reviews)
      .set({ responded: true, responseText, respondedAt: new Date() })
      .where(eq(reviews.id, review.id));
  } catch (err) {
    console.error(`Platform post failed for review ${review.id}:`, err);
  }
}

/**
 * Generate suggestions + notify owner for a low-rated review (1-3★)
 * or a 4★ without auto-reply enabled.
 * Idempotent: skips if a pending response already exists.
 */
export async function processLowRatedReview(review: Review, business: Business): Promise<void> {
  const existing = await db
    .select({ id: pendingResponses.id })
    .from(pendingResponses)
    .where(eq(pendingResponses.reviewId, review.id))
    .limit(1);
  if (existing.length > 0) return;

  let suggestions: string[];
  try {
    suggestions = await generateResponseSuggestions(review.text, review.authorName, business.name, review.rating);
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

  try {
    const resend = new Resend(process.env.RESEND_API_KEY || "placeholder");
    await resend.emails.send(
      buildNotificationEmail(business.ownerEmail, business.name, review.authorName, review.rating, review.text, suggestions, tokens, appUrl)
    );
  } catch (err) {
    console.error(`Notification email failed for review ${review.id}:`, err);
  }
}
