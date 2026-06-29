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
