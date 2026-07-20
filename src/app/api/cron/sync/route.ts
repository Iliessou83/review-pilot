export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { businesses, reviews } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { processHighRatedReview, processLowRatedReview } from "@/lib/review-processing";
import { ADMIN_EMAILS } from "@/lib/auth";
import { maybeSendQuotaAlert } from "@/lib/plan-limits";
import { googleAccessToken } from "@/lib/google-oauth";
import { decryptToken } from "@/lib/token-crypto";

interface GoogleReview {
  name: string;
  reviewer: { displayName: string };
  starRating: string;
  comment?: string;
  createTime: string;
}

interface TrustpilotReview {
  id: string;
  consumer: { displayName: string };
  stars: number;
  text?: { review: string };
  createdAt: string;
}

const STAR_MAP: Record<string, number> = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };

async function syncGoogleReviews(business: typeof businesses.$inferSelect) {
  // platform_token = refresh_token OAuth → on génère un jeton d'accès frais.
  const access = await googleAccessToken(business);
  const res = await fetch(
    `https://mybusiness.googleapis.com/v4/${business.platformId}/reviews?pageSize=50`,
    { headers: { Authorization: `Bearer ${access}`, "Content-Type": "application/json" } }
  );
  if (!res.ok) throw new Error(`Google API ${res.status}`);
  const data = await res.json() as { reviews?: GoogleReview[] };
  const created: (typeof reviews.$inferSelect)[] = [];

  for (const gr of data.reviews ?? []) {
    const existing = await db.select({ id: reviews.id }).from(reviews)
      .where(and(eq(reviews.businessId, business.id), eq(reviews.platformReviewId, gr.name))).limit(1);
    if (existing.length === 0) {
      const [saved] = await db.insert(reviews).values({
        businessId: business.id, platformReviewId: gr.name,
        authorName: gr.reviewer.displayName,
        rating: STAR_MAP[gr.starRating] || 3,
        text: gr.comment || "",
        publishedAt: new Date(gr.createTime),
        responded: false, platform: "google",
      }).returning();
      created.push(saved);
    }
  }
  return created;
}

async function syncTrustpilotReviews(business: typeof businesses.$inferSelect) {
  const res = await fetch(
    `https://api.trustpilot.com/v1/business-units/${business.platformId}/reviews?pageSize=50`,
    { headers: { apikey: decryptToken(business.platformToken) } }
  );
  if (!res.ok) throw new Error(`Trustpilot API ${res.status}`);
  const data = await res.json() as { reviews?: TrustpilotReview[] };
  const created: (typeof reviews.$inferSelect)[] = [];

  for (const tr of data.reviews ?? []) {
    const existing = await db.select({ id: reviews.id }).from(reviews)
      .where(and(eq(reviews.businessId, business.id), eq(reviews.platformReviewId, tr.id))).limit(1);
    if (existing.length === 0) {
      const [saved] = await db.insert(reviews).values({
        businessId: business.id, platformReviewId: tr.id,
        authorName: tr.consumer.displayName, rating: tr.stars,
        text: tr.text?.review || "",
        publishedAt: new Date(tr.createdAt),
        responded: false, platform: "trustpilot",
      }).returning();
      created.push(saved);
    }
  }
  return created;
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return await runSync();
  } catch (err) {
    console.error("Cron sync fatal error:", err);
    return NextResponse.json({ error: "Internal error", detail: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

async function runSync() {
  const allBusinesses = await db.select().from(businesses);
  const results: Record<string, { synced: number; processed: number; errors: string[] }> = {};

  for (const business of allBusinesses) {
    results[business.name] = { synced: 0, processed: 0, errors: [] };
    try {
      const newReviews = business.platform === "google"
        ? await syncGoogleReviews(business)
        : await syncTrustpilotReviews(business);

      results[business.name].synced = newReviews.length;

      for (const review of newReviews) {
        try {
          if (review.rating >= 4 && business.autoReply5Star) {
            await processHighRatedReview(review, business);
          } else {
            await processLowRatedReview(review, business);
          }
          results[business.name].processed++;
        } catch (err) {
          results[business.name].errors.push(`Review ${review.id}: ${err instanceof Error ? err.message : "error"}`);
          console.error(`Review ${review.id} processing error:`, err);
        }
      }

      // Alerte quota (90%/dépassé) — jamais de blocage, juste prévenir le client.
      // Les comptes super-admin ne sont jamais concernés (pas de facturation interne).
      if (newReviews.length > 0 && !ADMIN_EMAILS.includes(business.ownerEmail.toLowerCase())) {
        await maybeSendQuotaAlert(business.ownerEmail, business.name).catch((err) =>
          console.error(`Quota alert failed for ${business.name}:`, err)
        );
      }
    } catch (err) {
      results[business.name].errors.push(`Sync failed: ${err instanceof Error ? err.message : "error"}`);
      console.error(`Sync error for ${business.name}:`, err);
    }
  }

  return NextResponse.json({ ok: true, results });
}
