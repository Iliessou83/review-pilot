export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { and, eq, isNull, gt } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, passwordResetTokens } from "@/db/schema";
import { hashPassword, hashResetToken } from "@/lib/auth";
import { limitePartagee, getClientIp } from "@/lib/rate-limit";

// POST /api/auth/reset-password { token, password }
export async function POST(req: NextRequest) {
  if (!(await limitePartagee(`reset-password:${getClientIp(req)}`, 5, 15 * 60 * 1000))) {
    return NextResponse.json({ error: "Trop de tentatives. Réessayez dans 15 minutes." }, { status: 429 });
  }
  const body = await req.json().catch(() => ({}));
  const token = String(body.token || "");
  const password = String(body.password || "");
  if (!token || password.length < 8) {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const tokenHash = hashResetToken(token);
  const [row] = await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.tokenHash, tokenHash),
        isNull(passwordResetTokens.usedAt),
        gt(passwordResetTokens.expiresAt, new Date()),
      ),
    )
    .limit(1);

  if (!row) {
    return NextResponse.json({ error: "Lien invalide ou expiré" }, { status: 400 });
  }

  await db.update(users).set({ passwordHash: await hashPassword(password) }).where(eq(users.id, row.userId));
  await db.update(passwordResetTokens).set({ usedAt: new Date() }).where(eq(passwordResetTokens.id, row.id));

  return NextResponse.json({ ok: true });
}
