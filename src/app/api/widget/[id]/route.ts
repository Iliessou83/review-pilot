export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviews, businesses } from "@/db/schema";
import { eq, and, gte, desc, count, avg, isNotNull } from "drizzle-orm";
import { getClientIp, limitePartagee } from "@/lib/rate-limit";

function normalizeOrigin(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url.origin.toLowerCase();
  } catch {
    return null;
  }
}

function cors(origin: string | null) {
  return {
    ...(origin ? { "Access-Control-Allow-Origin": origin, Vary: "Origin" } : {}),
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600",
    "X-Content-Type-Options": "nosniff",
  };
}

export async function OPTIONS(request: NextRequest) {
  const origin = normalizeOrigin(request.headers.get("origin") || "");
  return new NextResponse(null, { status: 204, headers: cors(origin) });
}

// Le paramètre public est un UUID aléatoire, jamais l'id séquentiel interne.
// Le widget est désactivé par défaut et ne fonctionne que pour les domaines
// explicitement autorisés par le commerçant.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (process.env.ENABLE_EXTERNAL_REVIEW_WIDGET !== "true") {
    return NextResponse.json({ error: "Widget indisponible pendant la validation des licences." }, { status: 503 });
  }

  const { id: publicToken } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(publicToken)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const rateKey = `widget:${getClientIp(request)}:${publicToken.slice(0, 8)}`;
  if (!(await limitePartagee(rateKey, 240, 60 * 60 * 1000))) {
    return NextResponse.json({ error: "Trop de demandes" }, { status: 429 });
  }

  try {
    const [business] = await db
      .select({
        id: businesses.id,
        name: businesses.name,
        enabled: businesses.widgetEnabled,
        allowedOrigins: businesses.widgetAllowedOrigins,
      })
      .from(businesses)
      .where(eq(businesses.widgetPublicToken, publicToken))
      .limit(1);

    if (!business || !business.enabled) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const requestOrigin = normalizeOrigin(
      request.headers.get("origin") || request.headers.get("referer") || ""
    );
    const allowed = (business.allowedOrigins || []).map(normalizeOrigin).filter((v): v is string => Boolean(v));
    const internalPreview = requestOrigin === request.nextUrl.origin.toLowerCase();
    if (!internalPreview && (!requestOrigin || !allowed.includes(requestOrigin))) {
      return NextResponse.json({ error: "Origin not allowed" }, { status: 403 });
    }

    const [agg] = await db
      .select({ avg: avg(reviews.rating), count: count() })
      .from(reviews)
      .where(eq(reviews.businessId, business.id));

    const recent = await db
      .select({
        authorName: reviews.authorName,
        rating: reviews.rating,
        text: reviews.text,
        publishedAt: reviews.publishedAt,
        platform: reviews.platform,
      })
      .from(reviews)
      .where(and(
        eq(reviews.businessId, business.id),
        gte(reviews.rating, 4),
        isNotNull(reviews.text),
      ))
      .orderBy(desc(reviews.publishedAt))
      .limit(8);

    return NextResponse.json({
      businessName: business.name,
      avgRating: Math.round(Number(agg?.avg ?? 0) * 10) / 10,
      totalCount: Number(agg?.count ?? 0),
      selectionDisclosure: "Sélection d’avis récents 4–5 étoiles. La note globale inclut tous les avis disponibles.",
      reviews: recent.map((r) => ({
        author: r.authorName,
        rating: r.rating,
        text: r.text,
        date: r.publishedAt,
        platform: r.platform,
      })),
    }, { headers: cors(requestOrigin) });
  } catch (err) {
    console.error("[widget] error:", err);
    return NextResponse.json({ error: "Service indisponible" }, { status: 503 });
  }
}
