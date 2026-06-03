export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { reviews, businesses, pendingResponses } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import PendingClient from "./PendingClient";

export default async function PendingPage() {
  const session = await getSession();
  if (!session) redirect("/");

  // Fetch all pending reviews with their suggestions
  const pendingItems = await db
    .select({
      pending: pendingResponses,
      review: reviews,
      businessName: businesses.name,
    })
    .from(pendingResponses)
    .innerJoin(reviews, eq(pendingResponses.reviewId, reviews.id))
    .leftJoin(businesses, eq(reviews.businessId, businesses.id))
    .where(eq(pendingResponses.status, "pending"))
    .orderBy(pendingResponses.notifiedAt);

  return <PendingClient items={pendingItems} />;
}
