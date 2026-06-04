export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pendingResponses, reviews, businesses } from "@/db/schema";
import { eq, and, lt } from "drizzle-orm";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "placeholder");

// Runs every hour via Vercel cron
// Sends reminder if pending response not clicked after 24h
export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24h ago

    const stale = await db
      .select({
        pending: pendingResponses,
        review: reviews,
        businessName: businesses.name,
      })
      .from(pendingResponses)
      .innerJoin(reviews, eq(pendingResponses.reviewId, reviews.id))
      .leftJoin(businesses, eq(reviews.businessId, businesses.id))
      .where(
        and(
          eq(pendingResponses.status, "pending"),
          lt(pendingResponses.notifiedAt, cutoff)
        )
      );

    let sent = 0;
    for (const item of stale) {
      const clientEmail = process.env.CLIENT_NOTIFICATION_EMAIL || "contact@caela.fr";
      const stars = "★".repeat(item.review.rating) + "☆".repeat(5 - item.review.rating);

      await resend.emails.send({
        from: "Caela Réputation <noreply@caela.fr>",
        to: clientEmail,
        subject: `⏰ Rappel : avis ${item.review.rating}★ en attente de réponse`,
        html: `
          <div style="font-family:'Google Sans',system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#fff;">
            <div style="display:flex;gap:6px;margin-bottom:20px;">
              ${["#1A73E8","#EA4335","#FBBC04","#34A853"].map(c => `<div style="width:8px;height:8px;border-radius:50%;background:${c};display:inline-block;"></div>`).join("")}
              <span style="font-weight:700;font-size:14px;color:#202124;margin-left:4px;">Caela Réputation</span>
            </div>
            <h2 style="font-size:20px;font-weight:700;color:#202124;margin:0 0 8px;">Rappel : un avis attend votre réponse</h2>
            <p style="color:#5F6368;font-size:14px;margin:0 0 24px;">Cet avis n'a pas reçu de réponse depuis plus de 24h.</p>
            <div style="background:#F8F9FA;border-radius:12px;padding:20px;margin-bottom:24px;border:1px solid #DADCE0;">
              <div style="font-size:18px;margin-bottom:8px;color:#FBBC04;">${stars}</div>
              <p style="margin:0;font-size:14px;color:#202124;font-style:italic;">"${item.review.text?.slice(0, 200) || "Avis sans texte"}..."</p>
              <p style="margin:8px 0 0;font-size:12px;color:#80868B;">Établissement : ${item.businessName || "–"}</p>
            </div>
            <p style="color:#5F6368;font-size:13px;">Connectez-vous à votre dashboard pour répondre.</p>
            <div style="margin-top:24px;padding-top:16px;border-top:1px solid #DADCE0;font-size:11px;color:#80868B;">
              Caela Réputation by Caela Agency · <a href="mailto:contact@caela.fr" style="color:#1A73E8;">contact@caela.fr</a>
            </div>
          </div>
        `,
      });
      sent++;
    }

    return NextResponse.json({ ok: true, reminders_sent: sent });
  } catch (err) {
    console.error("Reminder cron error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
