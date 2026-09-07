import { NextRequest, NextResponse } from "next/server";
import { getStripe, priceIdFor, ensureReferralCoupon } from "@/lib/stripe";
import { planById, billing, trialDisclosure } from "@/config/legal.config";
import { db } from "@/lib/db";
import { subscriptions } from "@/db/schema";
import { pendingReferralDiscount } from "@/lib/referral";
import { getClientIp, limitePartagee } from "@/lib/rate-limit";
import { requireAuth } from "@/lib/auth";

/**
 * Crée une session Stripe Checkout en mode abonnement avec :
 *  - essai gratuit de `billing.trialDays` jours
 *  - CB OBLIGATOIRE (payment_method_collection: "always")
 *  - prélèvement automatique à la fin de l'essai, sauf résiliation
 *
 * Conformité : Stripe affiche le récap (prix + date de prélèvement) avant
 * validation, ce qui satisfait l'information précontractuelle (L221-5 C. conso).
 * On stocke aussi la divulgation envoyée dans les métadonnées (preuve).
 */
export async function POST(request: NextRequest) {
  try {
    const authSession = await requireAuth(request);
    if (!authSession) return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
    if (!(await limitePartagee(`checkout:${getClientIp(request)}`, 10, 60 * 60 * 1000))) {
      return NextResponse.json({ error: "Trop de demandes. Réessayez plus tard." }, { status: 429 });
    }
    const { planId, email, billingCycle } = await request.json();

    const plan = planById(planId);
    if (!plan) {
      return NextResponse.json({ error: "Plan inconnu" }, { status: 400 });
    }
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email requis" }, { status: 400 });
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail !== authSession.email.toLowerCase()) {
      return NextResponse.json({ error: "Email du compte invalide" }, { status: 403 });
    }
    const cycle = billingCycle === "annual" ? "annual" : "monthly";
    const annualMonthlyPrice = Math.round(plan.priceMonthly * 0.8);
    const chargeLabel = cycle === "annual"
      ? `${annualMonthlyPrice * 12}€/an (équivalent ${annualMonthlyPrice}€/mois)`
      : `${plan.priceMonthly}€/mois`;

    const stripe = getStripe();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "";

    // Filleul parrainé (voir src/lib/referral.ts) : -15% sur le premier mois,
    // via un coupon Stripe "once" (s'applique à la première facture réelle,
    // donc après l'essai). Best-effort : une erreur Stripe sur le coupon ne
    // doit jamais empêcher quelqu'un de payer.
    let discounts: { coupon: string }[] | undefined;
    try {
      if (await pendingReferralDiscount(normalizedEmail)) {
        discounts = [{ coupon: await ensureReferralCoupon(stripe) }];
      }
    } catch (err) {
      console.error("[billing/checkout] coupon parrainage non appliqué", err);
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: normalizedEmail,
      line_items: [{ price: priceIdFor(cycle === "annual" ? plan.annualPriceEnv : plan.priceEnv), quantity: 1 }],
      ...(discounts ? { discounts } : {}),

      // CB obligatoire même pendant l'essai. Sans ça, Stripe peut sauter la
      // collecte de carte sur un trial -> on perdrait le prélèvement auto.
      payment_method_collection: "always",

      subscription_data: {
        trial_period_days: billing.trialDays,
        // Si jamais la CB échoue à la fin de l'essai, on annule proprement
        // au lieu de laisser un abonnement impayé qui traîne.
        trial_settings: {
          end_behavior: { missing_payment_method: "cancel" },
        },
        metadata: {
          planId: plan.id,
          disclosure: trialDisclosure(plan, cycle),
          billingCycle: cycle,
        },
      },

      // Cases légales obligatoires affichées dans le Checkout Stripe.
      consent_collection: { terms_of_service: "required" },
      custom_text: {
        terms_of_service_acceptance: {
          message:
            "J'accepte les CGV et je comprends qu'à la fin de l'essai de " +
            `${billing.trialDays} jours, mon abonnement ${plan.name} sera ` +
            `facturé ${chargeLabel} sauf résiliation avant la fin de l'essai.`,
        },
        submit: {
          message: `Aucun débit aujourd'hui. Premier prélèvement après ${billing.trialDays} jours d'essai.`,
        },
      },

      success_url: `${appUrl}/dashboard?checkout=success`,
      cancel_url: `${appUrl}/?checkout=cancelled`,
      metadata: { planId: plan.id, email: normalizedEmail, billingCycle: cycle },
    });

    // Pré-enregistre la souscription en "incomplete" (sera confirmée par webhook).
    await db
      .insert(subscriptions)
      .values({ email: normalizedEmail, planId: plan.id, billingCycle: cycle, status: "incomplete" })
      .onConflictDoUpdate({
        target: subscriptions.email,
        set: { planId: plan.id, billingCycle: cycle, updatedAt: new Date() },
      });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error("[billing/checkout]", err);
    return NextResponse.json({ error: "Erreur création session" }, { status: 500 });
  }
}

// Permet de relire les conditions d'essai côté client (affichage récap).
export async function GET() {
  return NextResponse.json({ trialDays: billing.trialDays });
}

export const dynamic = "force-dynamic";
