export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { subscriptions } from "@/db/schema";
import { and, eq, gt, lt, isNull } from "drizzle-orm";
import { envoyer, EXPEDITEUR } from "@/lib/email";
import { billing } from "@/config/legal.config";


/**
 * Rappel J-3 avant la fin de l'essai (obligation de transparence + meilleur
 * rempart anti-chargeback). Sélectionne les essais en cours dont la fin tombe
 * dans la fenêtre [J+2, J+3] et qui n'ont pas encore reçu de rappel.
 * Tourne 1x/jour (voir vercel.json).
 */
export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const days = billing.guards.reminderEmailDaysBefore; // 3
  const now = Date.now();
  const windowStart = new Date(now + (days - 1) * 86400_000); // J+2
  const windowEnd = new Date(now + days * 86400_000); // J+3

  const due = await db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.status, "trialing"),
        eq(subscriptions.cancelAtPeriodEnd, false),
        isNull(subscriptions.reminderSentAt),
        gt(subscriptions.trialEndsAt, windowStart),
        lt(subscriptions.trialEndsAt, windowEnd)
      )
    );

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "";
  let sent = 0;

  for (const sub of due) {
    try {
      const dateStr = sub.trialEndsAt
        ? new Date(sub.trialEndsAt).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "bientôt";

      await envoyer({
        from: EXPEDITEUR,
        to: sub.email,
        subject: "Votre essai se termine dans 3 jours",
        html: `
          <div style="font-family:system-ui,-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#fff;">
            <h2 style="font-size:20px;font-weight:700;color:#202124;margin:0 0 12px;">Votre essai gratuit se termine bientôt</h2>
            <p style="color:#5F6368;font-size:14px;line-height:1.6;margin:0 0 16px;">
              Votre période d'essai Caela Réputation prend fin le <strong>${dateStr}</strong>.
              Sans action de votre part, votre abonnement démarrera automatiquement à cette date
              et votre carte sera débitée du montant de votre formule.
            </p>
            <p style="color:#5F6368;font-size:14px;line-height:1.6;margin:0 0 24px;">
              Vous souhaitez continuer ? Aucune action nécessaire.<br/>
              Vous ne souhaitez pas continuer ? Résiliez en 2 clics, sans frais, avant cette date :
            </p>
            <a href="${appUrl}/dashboard/billing" style="display:inline-block;padding:12px 24px;background:#1A73E8;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;">
              Gérer / résilier mon abonnement
            </a>
            <p style="color:#80868B;font-size:12px;line-height:1.6;margin:24px 0 0;">
              Cet email de rappel vous est envoyé conformément à notre engagement de transparence.
              Questions : ${"contact@caela.fr"}.
            </p>
          </div>
        `,
      });

      await db
        .update(subscriptions)
        .set({ reminderSentAt: new Date(), updatedAt: new Date() })
        .where(eq(subscriptions.id, sub.id));
      sent++;
    } catch (err) {
      console.error("[cron/trial-reminder] échec envoi", sub.email, err);
    }
  }

  return NextResponse.json({ checked: due.length, sent });
}
