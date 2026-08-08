export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, referrals } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ensureReferralCode } from "@/lib/referral";

// Renvoie le VRAI code de parrainage du compte connecté (persisté en base),
// jamais un code généré à la volée côté client. Les super-admins en dur
// (ADMIN_EMAILS) n'ont pas de ligne `users` : le parrainage ne s'applique
// qu'aux comptes self-serve.
export async function GET(request: NextRequest) {
  const session = await requireAuth(request);
  if (!session) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const [user] = await db.select().from(users).where(eq(users.email, session.email)).limit(1);
  if (!user) {
    return NextResponse.json({ eligible: false, reason: "compte agence, parrainage non applicable" });
  }

  const code = await ensureReferralCode(user.id, user.referralCode);

  const referred = await db.select().from(referrals).where(eq(referrals.referrerEmail, session.email));
  const rewarded = referred.filter((r) => r.referrerRewardedAt !== null).length;

  return NextResponse.json({
    eligible: true,
    code,
    referredCount: referred.length,
    rewardedCount: rewarded,
  });
}
