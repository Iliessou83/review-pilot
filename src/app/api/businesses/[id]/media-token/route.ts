export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { db } from "@/lib/db";
import { businesses } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { scopeFrom, ownsBusiness } from "@/lib/scope";
import { eq } from "drizzle-orm";

// Génère (ou rend) le jeton du lien public "envoyez vos photos/vidéos" pour
// ce commerce. Idempotent : un jeton déjà posé n'est jamais régénéré au
// hasard d'un rechargement, sinon l'ancien lien déjà partagé au client casse.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const numId = parseInt((await params).id, 10);
  if (isNaN(numId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  if (!(await ownsBusiness(scopeFrom(session), numId))) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const [business] = await db.select().from(businesses).where(eq(businesses.id, numId)).limit(1);
  if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 });

  if (business.mediaUploadToken) {
    return NextResponse.json({ token: business.mediaUploadToken });
  }

  const token = crypto.randomBytes(16).toString("hex");
  await db.update(businesses).set({ mediaUploadToken: token }).where(eq(businesses.id, numId));
  return NextResponse.json({ token });
}
