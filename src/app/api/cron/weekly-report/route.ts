export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { cronAutorise, avecSignalement } from "@/lib/cronSignal";
import { db } from "@/lib/db";
import { reviews, businesses, pendingResponses } from "@/db/schema";
import { eq, gte } from "drizzle-orm";
import { resend, EXPEDITEUR } from "@/lib/email";
import { entity } from "@/config/legal.config";
import { escapeHtml } from "@/lib/escape-html";


// Runs every Monday at 8h via Vercel cron
async function handler(request: Request) {
  if (!cronAutorise(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Reviews this week
    const weeklyReviews = await db
      .select({ review: reviews, businessName: businesses.name })
      .from(reviews)
      .leftJoin(businesses, eq(reviews.businessId, businesses.id))
      .where(gte(reviews.publishedAt, weekAgo));

    // Pending not answered
    const unanswered = await db
      .select({ pending: pendingResponses, businessName: businesses.name })
      .from(pendingResponses)
      .innerJoin(reviews, eq(pendingResponses.reviewId, reviews.id))
      .leftJoin(businesses, eq(reviews.businessId, businesses.id))
      .where(eq(pendingResponses.status, "pending"));

    const total = weeklyReviews.length;
    const positive = weeklyReviews.filter(r => r.review.rating >= 4).length;
    const negative = weeklyReviews.filter(r => r.review.rating <= 3).length;
    const avgRating = total > 0
      ? (weeklyReviews.reduce((sum, r) => sum + r.review.rating, 0) / total).toFixed(1)
      : "–";

    const clientEmail = process.env.CLIENT_NOTIFICATION_EMAIL || "contact@caela.fr";
    const dashboardUrl = process.env.NEXT_PUBLIC_APP_URL || entity.siteUrl;

    const stars = (n: number) => "★".repeat(n) + "☆".repeat(5 - n);

    // Le SDK Resend renvoie { data, error } et ne lève pas : sans cette
    // lecture, le cron répondait ok:true alors qu'aucun rapport n'était parti.
    const { error: erreurResend } = await resend().emails.send({
      from: EXPEDITEUR,
      to: clientEmail,
      subject: `📊 Votre rapport hebdomadaire — ${total} avis cette semaine`,
      html: `
        <div style="font-family:'Google Sans',system-ui,sans-serif;max-width:560px;margin:0 auto;background:#fff;">
          <!-- Header -->
          <div style="background:#1A73E8;padding:28px 32px;border-radius:16px 16px 0 0;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
              ${["rgba(255,255,255,0.9)","rgba(234,67,53,0.9)","rgba(251,188,4,0.9)","rgba(52,168,83,0.9)"].map(c => `<div style="width:8px;height:8px;border-radius:50%;background:${c};display:inline-block;"></div>`).join("")}
              <span style="color:rgba(255,255,255,0.9);font-weight:700;font-size:13px;margin-left:4px;">Caela Réputation</span>
            </div>
            <h1 style="margin:0;font-size:22px;font-weight:800;color:#fff;">Rapport de la semaine</h1>
            <p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.8);">
              ${new Date(weekAgo).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })} → ${new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>

          <!-- Stats -->
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:0;border:1px solid #DADCE0;border-top:none;">
            ${[
              { label: "Avis reçus", value: String(total), color: "#1A73E8" },
              { label: "Positifs 4-5★", value: String(positive), color: "#34A853" },
              { label: "Négatifs 1-3★", value: String(negative), color: "#EA4335" },
              { label: "Note moyenne", value: avgRating === "–" ? "–" : `${avgRating}★`, color: "#FBBC04" },
            ].map((s, i) => `
              <div style="padding:20px 16px;border-right:${i < 3 ? "1px solid #DADCE0" : "none"};text-align:center;">
                <div style="font-size:28px;font-weight:800;color:${s.color};">${s.value}</div>
                <div style="font-size:11px;color:#80868B;margin-top:4px;">${s.label}</div>
              </div>
            `).join("")}
          </div>

          <div style="padding:24px 28px;">
            ${unanswered.length > 0 ? `
              <div style="background:#FFF3E0;border:1px solid #FBBC04;border-radius:10px;padding:16px 18px;margin-bottom:20px;">
                <div style="font-weight:700;font-size:14px;color:#E65100;margin-bottom:4px;">⚠️ ${unanswered.length} avis sans réponse</div>
                <div style="font-size:13px;color:#5F6368;">Ces avis attendent votre action.</div>
              </div>
            ` : `
              <div style="background:#E6F4EA;border:1px solid #34A853;border-radius:10px;padding:16px 18px;margin-bottom:20px;">
                <div style="font-weight:700;font-size:14px;color:#1E6B38;">✅ Tous les avis ont reçu une réponse</div>
              </div>
            `}

            ${weeklyReviews.slice(0, 5).length > 0 ? `
              <h3 style="font-size:14px;font-weight:700;color:#202124;margin:0 0 12px;">Derniers avis de la semaine</h3>
              ${weeklyReviews.slice(0, 5).map(r => `
                <div style="border:1px solid #DADCE0;border-radius:10px;padding:14px 16px;margin-bottom:8px;">
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                    <span style="font-size:14px;color:#FBBC04;">${stars(r.review.rating)}</span>
                    <span style="font-size:11px;color:#80868B;">${escapeHtml(r.businessName || "–")}</span>
                  </div>
                  <p style="margin:0;font-size:13px;color:#5F6368;font-style:italic;">"${escapeHtml(r.review.text?.slice(0, 120) || "Avis sans texte")}..."</p>
                </div>
              `).join("")}
            ` : "<p style='color:#80868B;font-size:14px;'>Aucun avis cette semaine.</p>"}

            <a href="${dashboardUrl}/dashboard" style="display:block;text-align:center;margin-top:24px;padding:14px 24px;background:#1A73E8;color:#fff;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">
              Voir mon dashboard complet →
            </a>
          </div>

          <div style="padding:16px 28px;border-top:1px solid #DADCE0;font-size:11px;color:#80868B;text-align:center;">
            Caela Réputation by Caela Agency · <a href="mailto:contact@caela.fr" style="color:#1A73E8;text-decoration:none;">contact@caela.fr</a>
            · <a href="${dashboardUrl}/cgv" style="color:#80868B;text-decoration:none;">CGV</a>
          </div>
        </div>
      `,
    });
    if (erreurResend) {
      console.error("[email:cron/weekly-report] Resend a refusé l'envoi", erreurResend.message || erreurResend);
      return NextResponse.json({ ok: false, error: "email-non-envoye" }, { status: 502 });
    }

    return NextResponse.json({ ok: true, total_reviews: total, unanswered: unanswered.length });
  } catch (err) {
    console.error("Weekly report error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export const GET = avecSignalement("/api/cron/weekly-report", handler);
