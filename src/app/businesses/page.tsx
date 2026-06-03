export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { businesses, reviews } from "@/db/schema";
import { eq, count, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import BusinessesClient from "./BusinessesClient";

export default async function BusinessesPage() {
  const session = await getSession();
  if (!session) redirect("/");

  const allBusinesses = await db.select().from(businesses).orderBy(desc(businesses.createdAt));

  // Get review counts per business
  const reviewCounts = await db
    .select({
      businessId: reviews.businessId,
      total: count(reviews.id),
    })
    .from(reviews)
    .groupBy(reviews.businessId);

  const countMap = Object.fromEntries(
    reviewCounts.map((r) => [r.businessId, r.total])
  );

  const businessesWithStats = allBusinesses.map((b) => ({
    ...b,
    reviewCount: countMap[b.id] || 0,
  }));

  return <BusinessesClient businesses={businessesWithStats} />;
}
