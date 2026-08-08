export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { posts, businesses } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { scopeFrom, ownsBusiness } from "@/lib/scope";
import { eq, desc } from "drizzle-orm";

// Liste les posts (brouillons + publiés) d'un commerce du client connecté.
export async function GET(request: NextRequest) {
  const session = await requireAuth(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const businessId = Number(request.nextUrl.searchParams.get("businessId"));
  if (!businessId) return NextResponse.json({ error: "businessId requis" }, { status: 400 });

  if (!(await ownsBusiness(scopeFrom(session), businessId))) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const rows = await db.select().from(posts).where(eq(posts.businessId, businessId)).orderBy(desc(posts.createdAt));
  return NextResponse.json(rows);
}

// Crée un post en brouillon (contenu texte, l'équipe rédige — le média peut
// venir d'un post déjà déposé par le client via /api/media-upload).
export async function POST(request: NextRequest) {
  const session = await requireAuth(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { businessId?: number; content?: string; mediaUrl?: string; mediaType?: "image" | "video" };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body.businessId || !body.content?.trim()) {
    return NextResponse.json({ error: "businessId et content requis" }, { status: 400 });
  }
  if (!(await ownsBusiness(scopeFrom(session), body.businessId))) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }
  const [business] = await db.select().from(businesses).where(eq(businesses.id, body.businessId)).limit(1);
  if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 });

  const [created] = await db
    .insert(posts)
    .values({
      businessId: body.businessId,
      content: body.content.trim(),
      mediaUrl: body.mediaUrl,
      mediaType: body.mediaType,
      source: "equipe",
      status: "pret",
    })
    .returning();

  return NextResponse.json(created, { status: 201 });
}
