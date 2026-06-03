export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { businesses, reviews } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

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
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
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

  if (!response.ok) {
    throw new Error(`Google API error: ${response.status}`);
  }

  const data = await response.json() as { reviews?: GoogleReview[] };
  const googleReviews = data.reviews || [];

  const newReviews = [];

  for (const gr of googleReviews) {
    const platformReviewId = gr.name;
    const existing = await db
      .select()
      .from(reviews)
      .where(
        and(
          eq(reviews.businessId, business.id),
          eq(reviews.platformReviewId, platformReviewId)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      const [saved] = await db
        .insert(reviews)
        .values({
          businessId: business.id,
          platformReviewId,
          authorName: gr.reviewer.displayName,
          rating: STAR_RATING_MAP[gr.starRating] || 3,
          text: gr.comment || "",
          publishedAt: new Date(gr.createTime),
          responded: false,
          platform: "google",
        })
        .returning();

      newReviews.push(saved);
    }
  }

  return newReviews;
}

async function syncTrustpilotReviews(business: typeof businesses.$inferSelect) {
  const response = await fetch(
    `https://api.trustpilot.com/v1/business-units/${business.platformId}/reviews?pageSize=50`,
    {
      headers: {
        apikey: business.platformToken,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Trustpilot API error: ${response.status}`);
  }

  const data = await response.json() as { reviews?: TrustpilotReview[] };
  const tpReviews = data.reviews || [];

  const newReviews = [];

  for (const tr of tpReviews) {
    const platformReviewId = tr.id;
    const existing = await db
      .select()
      .from(reviews)
      .where(
        and(
          eq(reviews.businessId, business.id),
          eq(reviews.platformReviewId, platformReviewId)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      const [saved] = await db
        .insert(reviews)
        .values({
          businessId: business.id,
          platformReviewId,
          authorName: tr.consumer.displayName,
          rating: tr.stars,
          text: tr.text?.review || "",
          publishedAt: new Date(tr.createdAt),
          responded: false,
          platform: "trustpilot",
        })
        .returning();

      newReviews.push(saved);
    }
  }

  return newReviews;
}

export async function POST(request: NextRequest) {
  // Allow both authenticated users and cron (header-based)
  const cronSecret = request.headers.get("x-cron-secret");
  const isCron = cronSecret === process.env.CRON_SECRET;

  if (!isCron) {
    const session = await requireAuth(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get("businessId");

  const allBusinesses = businessId
    ? await db
        .select()
        .from(businesses)
        .where(eq(businesses.id, parseInt(businessId)))
    : await db.select().from(businesses);

  const results: Record<string, { synced: number; errors: string[] }> = {};

  for (const business of allBusinesses) {
    results[business.name] = { synced: 0, errors: [] };

    try {
      let newReviews: (typeof reviews.$inferSelect)[] = [];

      if (business.platform === "google") {
        newReviews = await syncGoogleReviews(business);
      } else {
        newReviews = await syncTrustpilotReviews(business);
      }

      results[business.name].synced = newReviews.length;

      // Process each new review
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

      for (const review of newReviews) {
        // Natural delay to avoid spam patterns
        await new Promise((r) => setTimeout(r, 2000 + Math.random() * 3000));

        if (review.rating >= 4 && business.autoReply5Star) {
          // Auto-respond to 4-5 star reviews
          await fetch(`${baseUrl}/api/reviews/${review.id}/respond`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-cron-secret": process.env.CRON_SECRET || "",
            },
            body: JSON.stringify({ autoGenerate: true }),
          });
        } else if (review.rating <= 3) {
          // Generate suggestions for 1-3 star reviews and notify owner
          await fetch(`${baseUrl}/api/reviews/${review.id}/suggestions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-cron-secret": process.env.CRON_SECRET || "",
            },
            body: JSON.stringify({
              businessName: business.name,
              ownerEmail: business.ownerEmail,
            }),
          });
        }
      }
    } catch (err) {
      results[business.name].errors.push(String(err));
    }
  }

  return NextResponse.json({ results });
}
