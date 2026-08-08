import { db } from "@/lib/db";
import { users, referrals } from "@/db/schema";
import { eq, isNull, and, lte } from "drizzle-orm";
import crypto from "crypto";

// Le code de parrainage n'est PAS un identifiant de sécurité (pas de secret,
// juste un token public à partager). Alphabet sans 0/O/1/I pour éviter les
// confusions à l'oral/à l'écrit.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomCode(): string {
  let s = "";
  for (let i = 0; i < 6; i++) s += ALPHABET[crypto.randomInt(ALPHABET.length)];
  return `CAELA-${s}`;
}

/** Génère et persiste un code unique pour ce compte s'il n'en a pas déjà un. */
export async function ensureReferralCode(userId: number, existing: string | null): Promise<string> {
  if (existing) return existing;
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomCode();
    const [clash] = await db.select({ id: users.id }).from(users).where(eq(users.referralCode, code)).limit(1);
    if (clash) continue;
    await db.update(users).set({ referralCode: code }).where(eq(users.id, userId));
    return code;
  }
  throw new Error("Impossible de générer un code de parrainage unique");
}

/**
 * Appelé à l'inscription si un code de parrainage a été saisi. Renvoie
 * l'email du parrain si le code est valide, sinon null (code invalide :
 * l'appelant décide s'il bloque l'inscription ou l'ignore silencieusement).
 */
export async function resolveReferrer(code: string, newAccountEmail: string): Promise<string | null> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return null;
  const [owner] = await db.select({ email: users.email }).from(users).where(eq(users.referralCode, normalized)).limit(1);
  if (!owner || owner.email === newAccountEmail) return null;
  return owner.email;
}

export async function recordReferral(referrerEmail: string, referredEmail: string, code: string): Promise<void> {
  await db.insert(referrals).values({ referrerEmail, referredEmail, code }).onConflictDoNothing({ target: referrals.referredEmail });
}

/** Le filleul a-t-il un parrainage en attente d'application du -15% ? */
export async function pendingReferralDiscount(referredEmail: string): Promise<boolean> {
  const [row] = await db.select({ id: referrals.id }).from(referrals).where(eq(referrals.referredEmail, referredEmail)).limit(1);
  return Boolean(row);
}

/** Marque le premier paiement réussi du filleul (idempotent, ne réécrit jamais). */
export async function markFirstPayment(referredEmail: string): Promise<void> {
  await db
    .update(referrals)
    .set({ referredFirstPaymentAt: new Date() })
    .where(and(eq(referrals.referredEmail, referredEmail), isNull(referrals.referredFirstPaymentAt)));
}

/** Parrainages dont le crédit de 21 jours est dû et jamais versé. */
export async function dueRewards(cutoff: Date) {
  return db
    .select()
    .from(referrals)
    .where(and(lte(referrals.referredFirstPaymentAt, cutoff), isNull(referrals.referrerRewardedAt)));
}

export async function markRewarded(id: number): Promise<void> {
  await db.update(referrals).set({ referrerRewardedAt: new Date() }).where(eq(referrals.id, id));
}
