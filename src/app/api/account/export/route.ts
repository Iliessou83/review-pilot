export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { inArray, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { scopeFrom, ownedBusinessIds } from "@/lib/scope";
import { businesses, contacts, pendingResponses, posts, reviews, reviewRequests, subscriptions, users } from "@/db/schema";

/** Export RGPD lisible par le client, sans jamais inclure les tokens de plateforme. */
export async function GET(request: NextRequest) {
  const session = await requireAuth(request);
  if (!session) return NextResponse.json({ error: "Authentification requise" }, { status: 401 });

  const scope = scopeFrom(session);
  const ids = await ownedBusinessIds(scope);
  const businessRows = ids === "all"
    ? await db.select().from(businesses)
    : ids.length > 0 ? await db.select().from(businesses).where(inArray(businesses.id, ids)) : [];
  const businessIds = businessRows.map((business) => business.id);

  const [userRows, subscriptionRows] = await Promise.all([
    db.select({ id: users.id, email: users.email, name: users.name, role: users.role, createdAt: users.createdAt })
      .from(users).where(eq(users.email, scope.email)),
    db.select().from(subscriptions).where(eq(subscriptions.email, scope.email)),
  ]);

  if (businessIds.length === 0) {
    return NextResponse.json({ exportedAt: new Date().toISOString(), account: userRows[0] ?? { email: scope.email }, subscriptions: subscriptionRows, businesses: [] }, {
      headers: { "Content-Disposition": 'attachment; filename="caela-export.json"' },
    });
  }

  const [reviewRows, postRows, contactRows, requestRows] = await Promise.all([
    db.select().from(reviews).where(inArray(reviews.businessId, businessIds)),
    db.select().from(posts).where(inArray(posts.businessId, businessIds)),
    db.select().from(contacts).where(inArray(contacts.businessId, businessIds)),
    db.select().from(reviewRequests).where(inArray(reviewRequests.businessId, businessIds)),
  ]);
  const reviewIdsForQuery = reviewRows.map((review) => review.id);
  const pendingRows = reviewIdsForQuery.length > 0
    ? await db.select().from(pendingResponses).where(inArray(pendingResponses.reviewId, reviewIdsForQuery))
    : [];

  // Les établissements exportés sont volontairement nettoyés des secrets OAuth
  // et clés API stockés dans platformToken.
  const safeBusinesses = businessRows.map(({ platformToken: _secret, ...business }) => business);
  const reviewIds = new Set(reviewRows.map((review) => review.id));
  const safePending = pendingRows.filter((pending) => reviewIds.has(pending.reviewId));

  return NextResponse.json({
    exportedAt: new Date().toISOString(),
    account: userRows[0] ?? { email: scope.email },
    subscriptions: subscriptionRows,
    businesses: safeBusinesses,
    reviews: reviewRows,
    pendingResponses: safePending,
    posts: postRows,
    contacts: contactRows,
    reviewRequests: requestRows,
  }, {
    headers: {
      "Content-Disposition": 'attachment; filename="caela-export.json"',
      "Cache-Control": "no-store",
    },
  });
}
