import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { subscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Résiliation en ligne (obligation Code conso art. L215-1-1, depuis juin 2023 :
 * résilier doit être aussi simple que souscrire). Un seul POST authentifié.
 *
 * On annule en fin de période (cancel_at_period_end) : le client garde l'accès
 * déjà payé jusqu'à la date d'échéance, sans nouveau prélèvement. Pendant
 * l'essai, ça stoppe le prélèvement automatique de fin d'essai.
 */
export async function POST(request: NextRequest) {
  const session = await requireAuth(request);
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const rows = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.email, session.email))
    .limit(1);
  const sub = rows[0];

  if (!sub?.stripeSubscriptionId) {
    return NextResponse.json({ error: "Aucun abonnement actif" }, { status: 404 });
  }

  try {
    const stripe = getStripe();
    const updated = await stripe.subscriptions.update(sub.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    await db
      .update(subscriptions)
      .set({ cancelAtPeriodEnd: true, updatedAt: new Date() })
      .where(eq(subscriptions.email, session.email));

    const endsAt = sub.trialEndsAt ?? sub.currentPeriodEnd;
    return NextResponse.json({
      cancelled: true,
      accessUntil: endsAt,
      status: updated.status,
      message:
        "Résiliation confirmée. Aucun nouveau prélèvement. Vous gardez l'accès jusqu'à la date d'échéance.",
    });
  } catch (err) {
    console.error("[billing/cancel]", err);
    return NextResponse.json({ error: "Erreur résiliation" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
