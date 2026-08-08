export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { posts } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { scopeFrom, ownsBusiness } from "@/lib/scope";
import { eq } from "drizzle-orm";

async function loadOwnedPost(session: NonNullable<Awaited<ReturnType<typeof requireAuth>>>, numId: number) {
  const [row] = await db.select().from(posts).where(eq(posts.id, numId)).limit(1);
  if (!row) return null;
  if (!(await ownsBusiness(scopeFrom(session), row.businessId))) return null;
  return row;
}

// Modifie un brouillon (contenu/média) avant publication — jamais un post déjà publié.
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const numId = parseInt((await params).id, 10);
  if (isNaN(numId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const row = await loadOwnedPost(session, numId);
  if (!row) return NextResponse.json({ error: "Post not found" }, { status: 404 });
  if (row.status === "publie") return NextResponse.json({ error: "Déjà publié, non modifiable" }, { status: 409 });

  let body: { content?: string; mediaUrl?: string; mediaType?: "image" | "video"; status?: "brouillon" | "pret" };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const [updated] = await db
    .update(posts)
    .set({
      ...(body.content !== undefined ? { content: body.content } : {}),
      ...(body.mediaUrl !== undefined ? { mediaUrl: body.mediaUrl } : {}),
      ...(body.mediaType !== undefined ? { mediaType: body.mediaType } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
    })
    .where(eq(posts.id, numId))
    .returning();

  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const numId = parseInt((await params).id, 10);
  if (isNaN(numId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const row = await loadOwnedPost(session, numId);
  if (!row) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  await db.delete(posts).where(eq(posts.id, numId));
  return NextResponse.json({ ok: true });
}
