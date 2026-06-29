export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviews, businesses } from "@/db/schema";
import { eq, and, gte, desc, sql, isNotNull } from "drizzle-orm";

// CORS : le widget est chargé depuis le site du commerçant (origine différente).
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

// GET /api/widget/[id] -> données publiques d'avis pour l'embed.
// Seules des données publiques (avis déjà publics sur Google/Trustpilot) sont exposées.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const businessId = parseInt(id, 10);
  if (isNaN(businessId) || businessId <= 0) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400, headers: CORS });
  }

  const [business] = await db
    .select({ id: businesses.id, name: businesses.name })
    .from(businesses)
    .where(eq(businesses.id, businessId))
    .limit(1);

  if (!business) {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers: CORS });
  }

  // Agrégat sur TOUS les avis (honnête pour le rich snippet AggregateRating).
  const [agg] = await db
    .select({
      avg: sql<string>`coalesce(avg(${reviews.rating}), 0)`,
      count: sql<string>`count(*)`,
    })
    .from(reviews)
    .where(eq(reviews.businessId, businessId));

  const avgRating = Math.round(Number(agg?.avg ?? 0) * 10) / 10;
  const totalCount = Number(agg?.count ?? 0);

  // Vitrine : avis récents 4-5★ avec texte (max 8).
  const recent = await db
    .select({
      authorName: reviews.authorName,
      rating: reviews.rating,
      text: reviews.text,
      publishedAt: reviews.publishedAt,
      platform: reviews.platform,
    })
    .from(reviews)
    .where(
      and(
        eq(reviews.businessId, businessId),
        gte(reviews.rating, 4),
        isNotNull(reviews.text)
      )
    )
    .orderBy(desc(reviews.publishedAt))
    .limit(8);

  return NextResponse.json(
    {
      businessName: business.name,
      avgRating,
      totalCount,
      reviews: recent.map((r) => ({
        author: r.authorName,
        rating: r.rating,
        text: r.text,
        date: r.publishedAt,
        platform: r.platform,
      })),
    },
    { headers: CORS }
  );
}
