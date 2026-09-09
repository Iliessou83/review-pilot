import "server-only";
import crypto from "node:crypto";
import { db } from "@/lib/db";
import { googleConnectionTickets } from "@/db/schema";
import { and, eq, gt } from "drizzle-orm";
import { encryptToken, decryptToken } from "@/lib/token-crypto";

const TTL_MS = 15 * 60 * 1000;

function hash(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

export async function createGoogleConnectionTicket(input: {
  actorEmail: string;
  refreshToken: string;
  termsVersion: string;
}): Promise<string> {
  const raw = crypto.randomBytes(32).toString("base64url");
  await db.insert(googleConnectionTickets).values({
    tokenHash: hash(raw),
    actorEmail: input.actorEmail.toLowerCase(),
    encryptedRefreshToken: encryptToken(input.refreshToken),
    termsVersion: input.termsVersion,
    expiresAt: new Date(Date.now() + TTL_MS),
  });
  return raw;
}

export async function readGoogleConnectionTicket(raw: string, actorEmail: string) {
  if (!raw) return null;
  const [ticket] = await db
    .select()
    .from(googleConnectionTickets)
    .where(and(
      eq(googleConnectionTickets.tokenHash, hash(raw)),
      eq(googleConnectionTickets.actorEmail, actorEmail.toLowerCase()),
      gt(googleConnectionTickets.expiresAt, new Date()),
    ))
    .limit(1);
  if (!ticket) return null;
  return {
    id: ticket.id,
    refreshToken: decryptToken(ticket.encryptedRefreshToken),
    termsVersion: ticket.termsVersion,
  };
}

export async function deleteGoogleConnectionTicket(id: number): Promise<void> {
  await db.delete(googleConnectionTickets).where(eq(googleConnectionTickets.id, id));
}
