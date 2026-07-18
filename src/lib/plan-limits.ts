import "server-only";
import { db } from "@/lib/db";
import { subscriptions, businesses, reviews } from "@/db/schema";
import { eq, and, inArray, gte, count } from "drizzle-orm";
import { planById, type Plan } from "@/config/legal.config";

const ACTIVE_STATUSES = ["active", "trialing"];

/**
 * Retrouve le plan actif (payant ou en essai) d'un client via son email —
 * c'est la même clé que `businesses.ownerEmail`. Retourne null si aucun
 * abonnement actif (client jamais passé par Stripe, ou résilié).
 */
export async function getPlanForEmail(email: string): Promise<Plan | null> {
  const normalized = email.toLowerCase().trim();
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.email, normalized))
    .limit(1);

  if (!sub || !sub.planId || !ACTIVE_STATUSES.includes(sub.status)) return null;
  return planById(sub.planId) ?? null;
}

/**
 * Peut-on ajouter un établissement supplémentaire pour ce client ?
 * Sans abonnement actif retrouvé : autorise 1 seul établissement (mode
 * essai/démo avant paiement) — le vrai verrou arrive avec Stripe branché.
 */
export async function checkBusinessQuota(ownerEmail: string): Promise<{
  allowed: boolean;
  current: number;
  max: number | null;
  planName: string | null;
}> {
  const normalized = ownerEmail.toLowerCase().trim();
  const plan = await getPlanForEmail(normalized);

  const [row] = await db
    .select({ value: count() })
    .from(businesses)
    .where(eq(businesses.ownerEmail, normalized));
  const current = row?.value ?? 0;

  if (!plan) {
    return { allowed: current < 1, current, max: 1, planName: null };
  }

  const max = plan.maxBusinesses;
  return { allowed: max === null || current < max, current, max, planName: plan.name };
}

function startOfCurrentMonth(): Date {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Nombre d'avis synchronisés ce mois-ci, tous établissements du client
 * confondus (un client peut avoir plusieurs commerces sur un même plan).
 */
export async function monthlyReviewCountForOwner(ownerEmail: string): Promise<number> {
  const normalized = ownerEmail.toLowerCase().trim();
  const owned = await db
    .select({ id: businesses.id })
    .from(businesses)
    .where(eq(businesses.ownerEmail, normalized));
  if (owned.length === 0) return 0;

  const ids = owned.map((b) => b.id);
  const [row] = await db
    .select({ value: count() })
    .from(reviews)
    .where(and(inArray(reviews.businessId, ids), gte(reviews.publishedAt, startOfCurrentMonth())));
  return row?.value ?? 0;
}

/**
 * Le quota d'avis traités par l'IA ce mois-ci est-il dépassé pour ce client ?
 * Sans abonnement actif retrouvé : plafond par défaut = quota Starter (30),
 * cohérent avec le fallback de checkBusinessQuota (mode essai/démo).
 */
export async function checkReviewQuota(ownerEmail: string): Promise<{
  allowed: boolean;
  current: number;
  max: number | null;
}> {
  const plan = await getPlanForEmail(ownerEmail);
  const current = await monthlyReviewCountForOwner(ownerEmail);

  if (!plan) return { allowed: current <= 30, current, max: 30 };

  const max = plan.monthlyReviewQuota;
  return { allowed: max === null || current <= max, current, max };
}
