export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviews, businesses } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { eq, and, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const session = await requireAuth(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const platform = searchParams.get("platform");
  const responded = searchParams.get("responded");
  const rating = searchParams.get("rating");
  // Borne dure: jamais NaN, jamais de dump complet de la table.
  const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "50", 10) || 50, 1), 200);

  const conditions = [];

  if (platform === "google" || platform === "trustpilot") {
    conditions.push(eq(reviews.platform, platform));
  }

  if (responded === "true") {
    conditions.push(eq(reviews.responded, true));
  } else if (responded === "false") {
    conditions.push(eq(reviews.responded, false));
  }

  // N'ajouter le filtre note que si c'est un entier 1..5 (évite eq(rating, NaN) -> 500).
  if (rating) {
    const r = parseInt(rating, 10);
    if (Number.isInteger(r) && r >= 1 && r <= 5) {
      conditions.push(eq(reviews.rating, r));
    }
  }

  const query = db
    .select({
      review: reviews,
      businessName: businesses.name,
    })
    .from(reviews)
    .leftJoin(businesses, eq(reviews.businessId, businesses.id))
    .orderBy(desc(reviews.publishedAt))
    .limit(limit);

  const results = conditions.length > 0
    ? await query.where(and(...conditions))
    : await query;

  return NextResponse.json(results);
}
