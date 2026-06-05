import { NextRequest } from "next/server";

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

export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}
