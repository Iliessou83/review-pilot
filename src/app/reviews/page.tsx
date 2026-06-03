export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { reviews, businesses } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import ReviewsClient from "./ReviewsClient";

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ platform?: string; responded?: string; rating?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/");

  const params = await searchParams;

  const conditions = [];

  if (params.platform && params.platform !== "all") {
    conditions.push(
      eq(reviews.platform, params.platform as "google" | "trustpilot")
    );
  }

  if (params.responded === "true") {
    conditions.push(eq(reviews.responded, true));
  } else if (params.responded === "false") {
    conditions.push(eq(reviews.responded, false));
  }

  if (params.rating) {
    conditions.push(eq(reviews.rating, parseInt(params.rating)));
  }

  const query = db
    .select({
      review: reviews,
      businessName: businesses.name,
    })
    .from(reviews)
    .leftJoin(businesses, eq(reviews.businessId, businesses.id))
    .orderBy(desc(reviews.publishedAt))
    .limit(100);

  const results =
    conditions.length > 0 ? await query.where(and(...conditions)) : await query;

  return (
    <ReviewsClient
      reviews={results}
      filters={{
        platform: params.platform || "all",
        responded: params.responded || "all",
        rating: params.rating || "all",
      }}
    />
  );
}
