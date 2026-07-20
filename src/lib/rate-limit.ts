import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { loginAttempts } from "@/db/schema";
import { sql } from "drizzle-orm";

interface Entry {
  count: number;
  resetAt: number;
}

// In-memory store — works across concurrent requests on Fluid Compute
// (single instance). Acceptable for an MVP; swap for Upstash Redis when scaling.
const store = new Map<string, Entry>();

// Periodically prune expired entries to prevent unbounded growth
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}, 60_000);

/**
 * Returns true if the request is within the allowed limit.
 * Returns false (= block) when the limit is exceeded.
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) return false;

  entry.count++;
  return true;
}

/**
 * Anti-bruteforce login — compteur partagé en base (table login_attempts, voir
 * drizzle/manual/2026-07-20_add_login_attempts.sql). Contrairement à rateLimit()
 * ci-dessus (Map en mémoire), fonctionne correctement sur Vercel où chaque
 * instance serverless a sa propre mémoire.
 *
 * Upsert atomique en une requête : si la fenêtre précédente est expirée, on
 * repart de 1 ; sinon on incrémente. Renvoie true (autorisé) tant que le
 * compteur résultant ne dépasse pas `limit`.
 */
export async function dbRateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const resetAt = new Date(Date.now() + windowMs);
  const rows = await db
    .insert(loginAttempts)
    .values({ ipKey: key, count: 1, resetAt })
    .onConflictDoUpdate({
      target: loginAttempts.ipKey,
      set: {
        count: sql`CASE WHEN ${loginAttempts.resetAt} < now() THEN 1 ELSE ${loginAttempts.count} + 1 END`,
        resetAt: sql`CASE WHEN ${loginAttempts.resetAt} < now() THEN ${resetAt.toISOString()}::timestamptz ELSE ${loginAttempts.resetAt} END`,
      },
    })
    .returning({ count: loginAttempts.count });

  const count = rows[0]?.count ?? 1;
  return count <= limit;
}

export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}
