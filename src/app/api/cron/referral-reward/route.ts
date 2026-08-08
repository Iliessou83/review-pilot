export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { cronAutorise, avecSignalement } from "@/lib/cronSignal";
import { db } from "@/lib/db";
import { subscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { envoyer, EXPEDITEUR } from "@/lib/email";
import { dueRewards, markRewarded } from "@/lib/referral";
import { getStripe } from "@/lib/stripe";
import { planById } from "@/config/legal.config";

/**
 * Crédite le mois offert au parrain, 21 jours après le premier paiement
 * réussi du filleul (voir src/lib/referral.ts + billing/webhook). Tourne
 * 1x/jour. N'ENVOIE RIEN tant que STRIPE_SECRET_KEY n'est pas posée en prod
 * (getStripe() lève) — capturé et journalisé par filleul, jamais silencieux.
 */
async function handler(request: Request) {
  if (!cronAutorise(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - 21 * 86400_000);
  const due = await dueRewards(cutoff);

  let rewarded = 0;
  let skipped = 0;

  for (const r of due) {
    try {
      const [referrerSub] = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.email, r.referrerEmail))
        .limit(1);

      if (!referrerSub?.stripeCustomerId) {
        // Le parrain n'a pas (ou plus) d'abonnement Stripe actif : rien à
        // créditer. On laisse la ligne non récompensée (retente le jour
        // suivant) plutôt que de la marquer faussement traitée.
        console.error(`[cron/referral-reward] parrain sans client Stripe: ${r.referrerEmail}`);
        skipped++;
        continue;
      }

      const plan = planById(referrerSub.planId || "");
      const amountCents = Math.round((plan?.priceMonthly ?? 0) * 100);
      if (amountCents <= 0) {
        skipped++;
        continue;
      }

      const stripe = getStripe();
      await stripe.customers.createBalanceTransaction(referrerSub.stripeCustomerId, {
        amount: -amountCents,
        currency: "eur",
        description: `Parrainage : 1 mois offert (filleul ${r.referredEmail})`,
      });

      await envoyer({
        from: EXPEDITEUR,
        to: r.referrerEmail,
        subject: "Votre mois offert a été crédité 🎁",
        html: `
          <div style="font-family:system-ui,-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#fff;">
            <h2 style="font-size:20px;font-weight:700;color:#202124;margin:0 0 12px;">Merci pour votre parrainage !</h2>
            <p style="color:#5F6368;font-size:14px;line-height:1.6;margin:0 0 16px;">
              La personne que vous avez parrainée est cliente depuis 21 jours.
              Un crédit de ${(amountCents / 100).toFixed(0)}€ vient d'être appliqué
              à votre compte — il s'imputera automatiquement sur votre prochaine facture.
            </p>
          </div>
        `,
      });

      await markRewarded(r.id);
      rewarded++;
    } catch (err) {
      console.error("[cron/referral-reward] échec", r.referrerEmail, err);
      skipped++;
    }
  }

  return NextResponse.json({ checked: due.length, rewarded, skipped });
}

export const GET = avecSignalement("/api/cron/referral-reward", handler);
