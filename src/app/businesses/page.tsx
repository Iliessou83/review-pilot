export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { businesses, reviews } from "@/db/schema";
import { count, desc, inArray } from "drizzle-orm";
import { getScope, ownedBusinessIds } from "@/lib/scope";
import { redirect } from "next/navigation";
import BusinessesClient from "./BusinessesClient";

export default async function BusinessesPage() {
  const scope = await getScope();
  if (!scope) redirect("/");

  // Cloisonnement : un client ne voit que ses commerces, l'admin voit tout.
  const ids = await ownedBusinessIds(scope);
  if (ids !== "all" && ids.length === 0) {
    return <BusinessesClient businesses={[]} />;
  }

  const base = db.select().from(businesses);
  const allBusinesses =
    ids === "all"
      ? await base.orderBy(desc(businesses.createdAt))
      : await base.where(inArray(businesses.id, ids)).orderBy(desc(businesses.createdAt));

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
