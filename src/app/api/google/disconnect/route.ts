export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { businesses, businessConsents } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { scopeFrom, ownsBusiness } from "@/lib/scope";
import { eq } from "drizzle-orm";
import { decryptToken } from "@/lib/token-crypto";

// Déconnecte le compte Google Business d'un commerce : efface les jetons
// stockés (platform_token = refresh_token). Le commerce et son historique
// d'avis restent, mais la synchro et l'auto-réponse s'arrêtent tant que le
// commerçant ne reconnecte pas sa fiche (voir /onboarding).
export async function POST(request: NextRequest) {
  const session = await requireAuth(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { businessId?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const businessId = body.businessId;
  if (!businessId || isNaN(businessId)) {
    return NextResponse.json({ error: "businessId requis" }, { status: 400 });
  }

  const scope = scopeFrom(session);
  if (!(await ownsBusiness(scope, businessId))) {
    return NextResponse.json({ error: "Établissement introuvable" }, { status: 404 });
  }

  const [existing] = await db
    .select({ id: businesses.id, platform: businesses.platform, platformToken: businesses.platformToken })
    .from(businesses)
    .where(eq(businesses.id, businessId))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "Établissement introuvable" }, { status: 404 });
  }
  if (existing.platform !== "google") {
    return NextResponse.json({ error: "Ce commerce n'est pas connecté via Google" }, { status: 400 });
  }

  let remoteRevoked = false;
  if (existing.platformToken) {
    try {
      const revokeResponse = await fetch("https://oauth2.googleapis.com/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ token: decryptToken(existing.platformToken) }),
      });
      remoteRevoked = revokeResponse.ok;
    } catch (error) {
      console.error("Google token revocation failed:", error);
    }
  }

  await db.transaction(async (tx) => {
    await tx
      .update(businesses)
      .set({ platformToken: "", autoReply5Star: false, autoReplyNegative: false })
      .where(eq(businesses.id, businessId));

    await tx.insert(businessConsents).values({
      businessId,
      actorEmail: session.email.toLowerCase(),
      scope: "manual",
      termsVersion: "review-management-2026-09-v1",
      granted: false,
    });
  });

  return NextResponse.json({ ok: true, remoteRevoked });
}
