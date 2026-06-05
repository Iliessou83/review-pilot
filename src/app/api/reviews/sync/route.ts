export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { businesses, reviews } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { processHighRatedReview, processLowRatedReview } from "@/lib/review-processing";

interface GoogleReview {
  name: string;
  reviewer: { displayName: string };
  starRating: string;
  comment: string;
  createTime: string;
}

interface TrustpilotReview {
  id: string;
  consumer: { displayName: string };
  stars: number;
  text: { review: string };
  createdAt: string;
}

const STAR_RATING_MAP: Record<string, number> = {
  ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5,
};

async function syncGoogleReviews(business: typeof businesses.$inferSelect) {
  const response = await fetch(
    `https://mybusiness.googleapis.com/v4/${business.platformId}/reviews?pageSize=50`,
    {
      headers: {
        Authorization: `Bearer ${business.platformToken}`,
        "Content-Type": "application/json",
      },
    }
  );
  if (!response.ok) throw new Error(`Google API error: ${response.status}`);

  const data = await response.json() as { reviews?: GoogleReview[] };
  const newReviews = [];

  for (const gr of data.reviews ?? []) {
    const platformReviewId = gr.name;
    const existing = await db
      .select({ id: reviews.id })
      .from(reviews)
      .where(and(eq(reviews.businessId, business.id), eq(reviews.platformReviewId, platformReviewId)))
      .limit(1);

    if (existing.length === 0) {
      const [saved] = await db.insert(reviews).values({
        businessId: business.id,
        platformReviewId,
        authorName: gr.reviewer.displayName,
        rating: STAR_RATING_MAP[gr.starRating] || 3,
        text: gr.comment || "",
        publishedAt: new Date(gr.createTime),
        responded: false,
        platform: "google",
      }).returning();
      newReviews.push(saved);
    }
  }
  return newReviews;
}

async function syncTrustpilotReviews(business: typeof businesses.$inferSelect) {
  const response = await fetch(
    `https://api.trustpilot.com/v1/business-units/${business.platformId}/reviews?pageSize=50`,
    { headers: { apikey: business.platformToken } }
  );
  if (!response.ok) throw new Error(`Trustpilot API error: ${response.status}`);

  const data = await response.json() as { reviews?: TrustpilotReview[] };
  const newReviews = [];

  for (const tr of data.reviews ?? []) {
    const platformReviewId = tr.id;
    const existing = await db
      .select({ id: reviews.id })
      .from(reviews)
      .where(and(eq(reviews.businessId, business.id), eq(reviews.platformReviewId, platformReviewId)))
      .limit(1);

    if (existing.length === 0) {
      const [saved] = await db.insert(reviews).values({
        businessId: business.id,
        platformReviewId,
        authorName: tr.consumer.displayName,
        rating: tr.stars,
        text: tr.text?.review || "",
        publishedAt: new Date(tr.createdAt),
        responded: false,
        platform: "trustpilot",
      }).returning();
      newReviews.push(saved);
    }
  }
  return newReviews;
}

export async function POST(request: NextRequest) {
  const cronSecret = request.headers.get("x-cron-secret");
  const isCron = cronSecret !== null && cronSecret === process.env.CRON_SECRET;

  if (!isCron) {
    const session = await requireAuth(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const { searchParams } = new URL(request.url);
  const businessIdParam = searchParams.get("businessId");
  const businessId = businessIdParam ? parseInt(businessIdParam, 10) : null;
  if (businessIdParam && (businessId === null || isNaN(businessId))) {
    return NextResponse.json({ error: "Invalid businessId" }, { status: 400 });
  }

  const allBusinesses = businessId
    ? await db.select().from(businesses).where(eq(businesses.id, businessId))
    : await db.select().from(businesses);

  const results: Record<string, { synced: number; processed: number; errors: string[] }> = {};

  for (const business of allBusinesses) {
    results[business.name] = { synced: 0, processed: 0, errors: [] };

    try {
      let newReviews: (typeof reviews.$inferSelect)[] = [];
      if (business.platform === "google") {
        newReviews = await syncGoogleReviews(business);
      } else {
        newReviews = await syncTrustpilotReviews(business);
      }

      results[business.name].synced = newReviews.length;

      // Process reviews — direct function calls, no HTTP self-call (no SSRF risk)
      for (const review of newReviews) {
        try {
          if (review.rating >= 4) {
            if (business.autoReply5Star) {
              await processHighRatedReview(review, business);
            } else {
              // Auto-reply disabled: generate suggestions for owner to review
              await processLowRatedReview(review, business);
            }
          } else {
            await processLowRatedReview(review, business);
          }
          results[business.name].processed++;
        } catch (reviewErr) {
          results[business.name].errors.push(`Review ${review.id}: processing failed`);
          console.error(`Review ${review.id} processing error:`, reviewErr);
        }
      }
    } catch (err) {
      results[business.name].errors.push("Sync failed");
      console.error(`Sync error for ${business.name}:`, err);
    }
  }

  return NextResponse.json({ results });
}
