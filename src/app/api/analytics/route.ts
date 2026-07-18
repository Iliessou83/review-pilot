export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviews, businesses } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { scopeFrom, ownedBusinessIds } from "@/lib/scope";
import { eq, gte, lt, and, count, avg, sql, inArray } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const session = await requireAuth(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Cloisonnement : un client ne voit que les stats de ses commerces.
  const scope = scopeFrom(session);
  const ids = await ownedBusinessIds(scope);
  if (ids !== "all" && ids.length === 0) {
    return NextResponse.json({
      ratingDistribution: [1, 2, 3, 4, 5].map((r) => ({ rating: r, count: 0 })),
      perBusiness: [],
      monthly: [],
    });
  }
  // Filtre commerce réutilisé sur chaque agrégat (undefined = admin, pas de filtre).
  const bizFilter = ids === "all" ? undefined : inArray(reviews.businessId, ids);

  const now = new Date();
  const months: { label: string; start: Date; end: Date }[] = [];

  for (let i = 11; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
    months.push({ label: monthNames[start.getMonth()], start, end });
  }

  const [ratingDist, perBusiness, monthlyData] = await Promise.all([
    // Distribution par note (1-5)
    db.select({
      rating: reviews.rating,
      count: count(),
    }).from(reviews).where(bizFilter).groupBy(reviews.rating),

    // Stats par établissement
    db.select({
      businessId: reviews.businessId,
      businessName: businesses.name,
      total: count(),
      responded: sql<number>`SUM(CASE WHEN ${reviews.responded} THEN 1 ELSE 0 END)::int`,
      avgRating: avg(reviews.rating),
    })
      .from(reviews)
      .leftJoin(businesses, eq(reviews.businessId, businesses.id))
      .where(bizFilter)
      .groupBy(reviews.businessId, businesses.name),

    // Données mensuelles (12 mois)
    Promise.all(
      months.map(async (m) => {
        const [res] = await db
          .select({
            total: count(),
            avgRating: avg(reviews.rating),
            responded: sql<number>`SUM(CASE WHEN ${reviews.responded} THEN 1 ELSE 0 END)::int`,
            negative: sql<number>`SUM(CASE WHEN ${reviews.rating} <= 3 THEN 1 ELSE 0 END)::int`,
          })
          .from(reviews)
          .where(and(gte(reviews.publishedAt, m.start), lt(reviews.publishedAt, m.end), bizFilter));
        return {
          label: m.label,
          total: res?.total || 0,
          avgRating: parseFloat(String(res?.avgRating || "0")),
          responded: Number(res?.responded) || 0,
          negative: Number(res?.negative) || 0,
        };
      })
    ),
  ]);

  const ratingMap: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of ratingDist) ratingMap[r.rating] = r.count;

  return NextResponse.json({
    ratingDistribution: [1, 2, 3, 4, 5].map(r => ({ rating: r, count: ratingMap[r] || 0 })),
    perBusiness: perBusiness.map(b => ({
      businessId: b.businessId,
      name: b.businessName || "Inconnu",
      total: b.total,
      responded: Number(b.responded) || 0,
      responseRate: b.total > 0 ? Math.round((Number(b.responded) / b.total) * 100) : 0,
      avgRating: parseFloat(String(b.avgRating || "0")).toFixed(1),
    })),
    monthly: monthlyData,
  });
}
