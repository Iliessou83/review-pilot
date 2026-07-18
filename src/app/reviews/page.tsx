export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { reviews, businesses } from "@/db/schema";
import { eq, and, desc, inArray } from "drizzle-orm";
import { getScope, ownedBusinessIds } from "@/lib/scope";
import { redirect } from "next/navigation";
import ReviewsClient from "./ReviewsClient";

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ platform?: string; responded?: string; rating?: string }>;
}) {
  const scope = await getScope();
  if (!scope) redirect("/");

  const params = await searchParams;

  // Cloisonnement : le client ne voit que les avis de ses commerces.
  const ids = await ownedBusinessIds(scope);
  if (ids !== "all" && ids.length === 0) {
    return (
      <ReviewsClient
        reviews={[]}
        filters={{
          platform: params.platform || "all",
          responded: params.responded || "all",
          rating: params.rating || "all",
        }}
      />
    );
  }

  const conditions = [];
  if (ids !== "all") {
    conditions.push(inArray(reviews.businessId, ids));
  }

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

  let results: { review: typeof reviews.$inferSelect; businessName: string | null }[] = [];

  try {
    const query = db
      .select({
        review: reviews,
        businessName: businesses.name,
      })
      .from(reviews)
      .leftJoin(businesses, eq(reviews.businessId, businesses.id))
      .orderBy(desc(reviews.publishedAt))
      .limit(100);

    results =
      conditions.length > 0 ? await query.where(and(...conditions)) : await query;
  } catch (err) {
    console.error("Reviews query error:", err);
    results = [];
  }

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
