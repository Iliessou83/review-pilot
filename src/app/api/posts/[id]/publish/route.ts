export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { posts, businesses } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { scopeFrom, ownsBusiness } from "@/lib/scope";
import { eq } from "drizzle-orm";
import { googleAccessToken } from "@/lib/google-oauth";
import { postGoogleLocalPost } from "@/lib/platform-reply";

// Publie un brouillon sur la vraie fiche Google Business Profile (Local Posts
// API). Seul "google" est géré : Trustpilot/Facebook n'ont pas d'équivalent
// "post" exposé par leur API publique.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const numId = parseInt((await params).id, 10);
  if (isNaN(numId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const [post] = await db.select().from(posts).where(eq(posts.id, numId)).limit(1);
  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
  if (!(await ownsBusiness(scopeFrom(session), post.businessId))) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }
  if (post.status === "publie") return NextResponse.json(post);

  const [business] = await db.select().from(businesses).where(eq(businesses.id, post.businessId)).limit(1);
  if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 });
  if (business.platform !== "google") {
    return NextResponse.json({ error: "La publication automatique n'existe que pour Google." }, { status: 400 });
  }

  try {
    const access = await googleAccessToken(business);
    const googlePostId = await postGoogleLocalPost(
      business.platformId,
      post.content,
      access,
      post.mediaUrl ? { url: post.mediaUrl, type: post.mediaType === "video" ? "video" : "image" } : undefined
    );
    const [updated] = await db
      .update(posts)
      .set({ status: "publie", publishedAt: new Date(), googlePostId, errorMessage: null })
      .where(eq(posts.id, numId))
      .returning();
    return NextResponse.json(updated);
  } catch (err) {
    console.error("Google local post publish error:", err);
    const message = err instanceof Error ? err.message : String(err);
    await db.update(posts).set({ status: "echec", errorMessage: message.slice(0, 300) }).where(eq(posts.id, numId));
    return NextResponse.json({ error: "La publication sur Google a échoué. Réessayez." }, { status: 502 });
  }
}
