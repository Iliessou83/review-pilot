import "server-only";
import { envoyer, EXPEDITEUR_NOTIF } from "@/lib/email";
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

export type ReviewQuotaStatus = {
  current: number;
  max: number | null; // null = illimité
  ratio: number | null; // null = illimité (pas de seuil applicable)
  status: "ok" | "near" | "exceeded"; // near = >=90% du quota, exceeded = >=100%
  plan: Plan | null;
};

/**
 * Statut du quota d'avis traités ce mois-ci pour ce client.
 * Sans abonnement actif retrouvé : plafond de repli = quota Starter (30),
 * cohérent avec le fallback de checkBusinessQuota (mode essai/démo).
 *
 * Décision produit (2026-07-19) : ceci ne bloque JAMAIS le traitement IA.
 * Le service continue même en dépassement — seule une alerte est déclenchée
 * (voir maybeSendQuotaAlert), avec un petit supplément prévu jusqu'au
 * renouvellement plutôt qu'une coupure ou un système de crédits.
 */
export async function getReviewQuotaStatus(ownerEmail: string): Promise<ReviewQuotaStatus> {
  const plan = await getPlanForEmail(ownerEmail);
  const current = await monthlyReviewCountForOwner(ownerEmail);
  const max = plan ? plan.monthlyReviewQuota : 30;

  if (max === null) return { current, max: null, ratio: null, status: "ok", plan };

  const ratio = max > 0 ? current / max : 1;
  const status: ReviewQuotaStatus["status"] = ratio >= 1 ? "exceeded" : ratio >= 0.9 ? "near" : "ok";
  return { current, max, ratio, status, plan };
}

function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

/**
 * Envoie l'alerte "quota bientôt/déjà atteint" par email, une seule fois par
 * mois (anti-doublon via subscriptions.quotaAlertSentAt). Ne fait rien si :
 * pas d'abonnement actif, plan illimité, ou déjà alerté ce mois-ci.
 * N'échoue jamais silencieusement de façon bloquante (log seulement).
 */
export async function maybeSendQuotaAlert(ownerEmail: string, businessName: string): Promise<void> {
  const normalized = ownerEmail.toLowerCase().trim();
  const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.email, normalized)).limit(1);
  if (!sub || !sub.planId) return;

  const statusInfo = await getReviewQuotaStatus(normalized);
  if (statusInfo.status === "ok" || statusInfo.max === null || !statusInfo.plan) return;

  const now = new Date();
  if (sub.quotaAlertSentAt && isSameMonth(new Date(sub.quotaAlertSentAt), now)) return;

  const plan = statusInfo.plan;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "";
  const overageNote = plan.overagePricePerReview
    ? `Au-delà de votre quota, chaque avis supplémentaire est facturé ${plan.overagePricePerReview}€ jusqu'à votre prochain renouvellement — le service continue sans interruption, rien n'est coupé.`
    : "";

  try {
    await envoyer({
      from: EXPEDITEUR_NOTIF,
      to: normalized,
      subject:
        statusInfo.status === "exceeded"
          ? `Quota d'avis dépassé — ${businessName}`
          : `Vous approchez de votre quota d'avis (90%) — ${businessName}`,
      html: `
<div style="font-family:'Google Sans',system-ui,sans-serif;max-width:560px;margin:0 auto;background:#fff;border:1px solid #DADCE0;border-radius:12px;overflow:hidden;">
  <div style="background:${statusInfo.status === "exceeded" ? "#EA4335" : "#F9AB00"};padding:18px 24px;">
    <span style="color:#fff;font-size:16px;font-weight:700;">
      ${statusInfo.status === "exceeded" ? "Quota d'avis dépassé" : "90% de votre quota atteint"}
    </span>
  </div>
  <div style="padding:24px;">
    <p style="font-size:14px;color:#202124;line-height:1.6;">
      <strong>${businessName}</strong> a traité <strong>${statusInfo.current}</strong> avis ce mois-ci,
      sur les <strong>${statusInfo.max}</strong> inclus dans votre plan <strong>${plan.name}</strong>.
    </p>
    ${overageNote ? `<p style="font-size:13px;color:#5F6368;line-height:1.6;">${overageNote}</p>` : ""}
    <a href="${appUrl}/dashboard/billing" style="display:inline-block;margin-top:12px;padding:10px 20px;background:#1A73E8;color:#fff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:600;">
      Passer à un plan supérieur
    </a>
  </div>
</div>`,
    });
    await db.update(subscriptions).set({ quotaAlertSentAt: now }).where(eq(subscriptions.email, normalized));
  } catch (err) {
    console.error("Quota alert email failed:", err);
  }
}
