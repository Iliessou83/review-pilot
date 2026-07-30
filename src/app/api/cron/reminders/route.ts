export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { cronAutorise, avecSignalement } from "@/lib/cronSignal";
import { db } from "@/lib/db";
import { pendingResponses, reviews, businesses } from "@/db/schema";
import { eq, and, lt, gt } from "drizzle-orm";
import { envoyer, EXPEDITEUR } from "@/lib/email";
import { escapeHtml } from "@/lib/escape-html";


// Sends ONE reminder per pending — only items in the 24h-48h window are picked up.
// Items < 24h: too fresh. Items > 48h: already reminded, skip.
async function handler(request: Request) {
  if (!cronAutorise(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const twentyFourHours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const fortyEightHours = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const stale = await db
      .select({
        pending: pendingResponses,
        review: reviews,
        businessName: businesses.name,
        ownerEmail: businesses.ownerEmail,
      })
      .from(pendingResponses)
      .innerJoin(reviews, eq(pendingResponses.reviewId, reviews.id))
      .leftJoin(businesses, eq(reviews.businessId, businesses.id))
      .where(
        and(
          eq(pendingResponses.status, "pending"),
          lt(pendingResponses.notifiedAt, twentyFourHours),
          gt(pendingResponses.notifiedAt, fortyEightHours)
        )
      );

    let sent = 0;
    for (const item of stale) {
      try {
        const rating = Math.max(0, Math.min(5, item.review.rating));
        const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
        const clientEmail = item.ownerEmail || process.env.CLIENT_NOTIFICATION_EMAIL || "contact@caela.fr";
        const safeText = escapeHtml(item.review.text?.slice(0, 200) || "Avis sans texte");
        const safeBusiness = escapeHtml(item.businessName || "–");

        await envoyer({
          from: EXPEDITEUR,
          to: clientEmail,
          subject: `⏰ Rappel : avis ${rating}★ en attente de réponse`,
          html: `
            <div style="font-family:'Google Sans',system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#fff;">
              <h2 style="font-size:20px;font-weight:700;color:#202124;margin:0 0 8px;">Rappel : un avis attend votre réponse</h2>
              <p style="color:#5F6368;font-size:14px;margin:0 0 24px;">Cet avis n'a pas reçu de réponse depuis plus de 24h.</p>
              <div style="background:#F8F9FA;border-radius:12px;padding:20px;margin-bottom:24px;border:1px solid #DADCE0;">
                <div style="font-size:18px;margin-bottom:8px;color:#FBBC04;">${stars}</div>
                <p style="margin:0;font-size:14px;color:#202124;font-style:italic;">&ldquo;${safeText}&hellip;&rdquo;</p>
                <p style="margin:8px 0 0;font-size:12px;color:#80868B;">Établissement : ${safeBusiness}</p>
              </div>
              <p style="color:#5F6368;font-size:13px;">Connectez-vous à votre dashboard pour répondre.</p>
              <div style="margin-top:24px;padding-top:16px;border-top:1px solid #DADCE0;font-size:11px;color:#80868B;">
                Caela Réputation by Caela Agency · <a href="mailto:contact@caela.fr" style="color:#1A73E8;">contact@caela.fr</a>
              </div>
            </div>
          `,
        });
        sent++;
      } catch (itemErr) {
        console.error(`Reminder failed for pending ${item.pending.id}:`, itemErr);
      }
    }

    return NextResponse.json({ ok: true, reminders_sent: sent });
  } catch (err) {
    console.error("Reminder cron error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export const GET = avecSignalement("/api/cron/reminders", handler);
