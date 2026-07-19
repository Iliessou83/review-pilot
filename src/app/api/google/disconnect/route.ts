export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { businesses } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { scopeFrom, ownsBusiness } from "@/lib/scope";
import { eq } from "drizzle-orm";

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
    .select({ id: businesses.id, platform: businesses.platform })
    .from(businesses)
    .where(eq(businesses.id, businessId))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "Établissement introuvable" }, { status: 404 });
  }
  if (existing.platform !== "google") {
    return NextResponse.json({ error: "Ce commerce n'est pas connecté via Google" }, { status: 400 });
  }

  await db
    .update(businesses)
    .set({ platformToken: "" })
    .where(eq(businesses.id, businessId));

  return NextResponse.json({ ok: true });
}
