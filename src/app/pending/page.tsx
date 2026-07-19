export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { reviews, businesses, pendingResponses } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { getScope, ownedBusinessIds } from "@/lib/scope";
import { redirect } from "next/navigation";
import PendingClient from "./PendingClient";

export default async function PendingPage() {
  const scope = await getScope();
  if (!scope) redirect("/");

  // Cloisonnement : un client ne voit que les avis en attente de SES commerces.
  const owned = await ownedBusinessIds(scope);
  if (owned !== "all" && owned.length === 0) {
    return <PendingClient items={[]} />;
  }
  const bizFilter = owned === "all" ? undefined : inArray(reviews.businessId, owned);

  try {
    const pendingItems = await db
      .select({
        pending: pendingResponses,
        review: reviews,
        businessName: businesses.name,
      })
      .from(pendingResponses)
      .innerJoin(reviews, eq(pendingResponses.reviewId, reviews.id))
      .leftJoin(businesses, eq(reviews.businessId, businesses.id))
      .where(and(eq(pendingResponses.status, "pending"), bizFilter))
      .orderBy(pendingResponses.notifiedAt);

    return <PendingClient items={pendingItems} />;
  } catch (err) {
    console.error("Pending query error:", err);
    return <PendingClient items={[]} />;
  }
}
