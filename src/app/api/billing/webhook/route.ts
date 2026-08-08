import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe, getWebhookSecret } from "@/lib/stripe";
import { db } from "@/lib/db";
import { subscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { markFirstPayment } from "@/lib/referral";

/**
 * Webhook Stripe : seule source de vérité de l'état d'abonnement.
 * Vérifie la signature, puis met à jour la table `subscriptions`.
 *
 * À configurer dans Stripe Dashboard -> Webhooks, événements :
 *   checkout.session.completed, customer.subscription.created/updated/deleted,
 *   invoice.payment_failed
 */
export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig ?? "", getWebhookSecret());
  } catch (err) {
    console.error("[billing/webhook] signature invalide", err);
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        const email = s.customer_email || s.metadata?.email;
        if (email && s.subscription) {
          await upsertFromSubscription(
            stripe,
            email,
            String(s.subscription),
            s.customer ? String(s.customer) : null,
            s.metadata?.planId ?? null
          );
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const email = await emailForCustomer(stripe, String(sub.customer));
        if (email) await writeSubscription(email, sub);
        break;
      }
      case "invoice.payment_failed": {
        const inv = event.data.object as Stripe.Invoice;
        const email = inv.customer_email;
        if (email) {
          await db
            .update(subscriptions)
            .set({ status: "past_due", updatedAt: new Date() })
            .where(eq(subscriptions.email, email));
        }
        break;
      }
    }
  } catch (err) {
    console.error("[billing/webhook] traitement", err);
    return NextResponse.json({ error: "Erreur traitement" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function emailForCustomer(
  stripe: Stripe,
  customerId: string
): Promise<string | null> {
  try {
    const c = await stripe.customers.retrieve(customerId);
    if (c.deleted) return null;
    return c.email ?? null;
  } catch {
    return null;
  }
}

async function upsertFromSubscription(
  stripe: Stripe,
  email: string,
  subscriptionId: string,
  customerId: string | null,
  planId: string | null
) {
  const sub = await stripe.subscriptions.retrieve(subscriptionId);
  await writeSubscription(email, sub, customerId, planId);
}

async function writeSubscription(
  email: string,
  sub: Stripe.Subscription,
  customerId?: string | null,
  planId?: string | null
) {
  const item = sub.items.data[0];
  // periodEnd / trialEnd vivent sur l'item d'abonnement (API récente).
  const periodEnd =
    (item as { current_period_end?: number })?.current_period_end ?? null;

  await db
    .insert(subscriptions)
    .values({
      email,
      stripeSubscriptionId: sub.id,
      stripeCustomerId: customerId ?? String(sub.customer),
      planId: planId ?? (sub.metadata?.planId || null),
      status: sub.status,
      trialEndsAt: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
      currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: subscriptions.email,
      set: {
        stripeSubscriptionId: sub.id,
        stripeCustomerId: customerId ?? String(sub.customer),
        planId: planId ?? (sub.metadata?.planId || null),
        status: sub.status,
        trialEndsAt: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
        currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        updatedAt: new Date(),
      },
    });

  // Filleul (voir src/lib/referral.ts) : "active" = essai terminé et premier
  // prélèvement réussi. markFirstPayment est idempotent (IS NULL en garde),
  // donc rejouable sans risque à chaque webhook "updated" suivant.
  if (sub.status === "active") {
    await markFirstPayment(email).catch((err) => console.error("[billing/webhook] markFirstPayment", err));
  }
}

// Stripe envoie du raw body : pas de parsing automatique.
export const dynamic = "force-dynamic";
