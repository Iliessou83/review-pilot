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
  const limit = parseInt(searchParams.get("limit") || "50");

  const conditions = [];

  if (platform && platform !== "all") {
    conditions.push(eq(reviews.platform, platform as "google" | "trustpilot"));
  }

  if (responded === "true") {
    conditions.push(eq(reviews.responded, true));
  } else if (responded === "false") {
    conditions.push(eq(reviews.responded, false));
  }

  if (rating) {
    conditions.push(eq(reviews.rating, parseInt(rating)));
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
