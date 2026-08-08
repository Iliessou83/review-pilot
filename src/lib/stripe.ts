import Stripe from "stripe";

/**
 * Client Stripe partagé. La clé vit dans l'env Vercel (STRIPE_SECRET_KEY),
 * jamais dans le code. On laisse l'apiVersion par défaut du compte.
 */
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  // .trim() : un retour-ligne final dans l'env Vercel casse tout en silence.
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) throw new Error("STRIPE_SECRET_KEY not set");
  _stripe = new Stripe(key);
  return _stripe;
}

export function getWebhookSecret(): string {
  const s = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!s) throw new Error("STRIPE_WEBHOOK_SECRET not set");
  return s;
}

/** Résout le Price ID d'un plan depuis l'env (jamais hardcodé). */
export function priceIdFor(priceEnv: string): string {
  const id = process.env[priceEnv]?.trim();
  if (!id) throw new Error(`Price ID manquant: env ${priceEnv} non défini`);
  return id;
}

// -15% sur le premier mois d'un filleul (voir src/lib/referral.ts). Un seul
// coupon partagé par tout l'écosystème de parrainage, id fixe pour être
// idempotent (create-or-fetch, jamais recréé en double).
const REFERRAL_COUPON_ID = "referral-15-once";

export async function ensureReferralCoupon(stripe: Stripe): Promise<string> {
  try {
    await stripe.coupons.retrieve(REFERRAL_COUPON_ID);
  } catch {
    await stripe.coupons.create({
      id: REFERRAL_COUPON_ID,
      percent_off: 15,
      duration: "once",
      name: "Parrainage -15% premier mois",
    });
  }
  return REFERRAL_COUPON_ID;
}
