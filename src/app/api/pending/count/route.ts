export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pendingResponses, reviews } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { scopeFrom, ownedBusinessIds } from "@/lib/scope";
import { eq, and, count, inArray } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const session = await requireAuth(request);
  if (!session) return NextResponse.json({ count: 0 });

  // Cloisonnement : ne compter que les avis en attente des commerces du client.
  const scope = scopeFrom(session);
  const ids = await ownedBusinessIds(scope);
  if (ids !== "all" && ids.length === 0) return NextResponse.json({ count: 0 });

  const [res] = await db
    .select({ count: count() })
    .from(pendingResponses)
    .innerJoin(reviews, eq(pendingResponses.reviewId, reviews.id))
    .where(
      and(
        eq(pendingResponses.status, "pending"),
        ids === "all" ? undefined : inArray(reviews.businessId, ids)
      )
    );

  return NextResponse.json({ count: res?.count || 0 });
}
