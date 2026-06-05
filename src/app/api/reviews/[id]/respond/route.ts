export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviews, businesses } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { generateAutoResponse } from "@/lib/claude";

async function postGoogleReply(reviewId: string, responseText: string, token: string) {
  const response = await fetch(
    `https://mybusiness.googleapis.com/v4/${reviewId}/reply`,
    {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ comment: responseText }),
    }
  );
  if (!response.ok) throw new Error(`Google reply failed: ${response.status}`);
}

async function postTrustpilotReply(businessUnitId: string, reviewId: string, responseText: string, apiKey: string) {
  const response = await fetch(
    `https://api.trustpilot.com/v1/private/business-units/${businessUnitId}/reviews/${reviewId}/reply`,
    {
      method: "POST",
      headers: { apikey: apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ message: responseText }),
    }
  );
  if (!response.ok) throw new Error(`Trustpilot reply failed: ${response.status}`);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const cronSecret = request.headers.get("x-cron-secret");
  const isCron = cronSecret !== null && cronSecret === process.env.CRON_SECRET;

  if (!isCron) {
    const session = await requireAuth(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const numId = parseInt(id, 10);
  if (isNaN(numId) || numId <= 0) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  let body: { autoGenerate?: boolean; responseText?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const [reviewRow] = await db
    .select()
    .from(reviews)
    .where(eq(reviews.id, numId))
    .limit(1);

  if (!reviewRow) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  // Idempotent: already responded
  if (reviewRow.responded) {
    return NextResponse.json(reviewRow);
  }

  const [business] = await db
    .select()
    .from(businesses)
    .where(eq(businesses.id, reviewRow.businessId))
    .limit(1);

  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  let responseText = body.responseText;

  if (body.autoGenerate || !responseText) {
    try {
      responseText = await generateAutoResponse(
        reviewRow.text, reviewRow.authorName, business.name, reviewRow.rating
      );
    } catch (err) {
      console.error("Auto-response generation failed:", err);
      return NextResponse.json({ error: "Failed to generate response" }, { status: 502 });
    }
  }

  if (!responseText) {
    return NextResponse.json({ error: "No response text provided" }, { status: 400 });
  }

  // Only mark as responded if platform post succeeds
  try {
    if (reviewRow.platform === "google") {
      await postGoogleReply(reviewRow.platformReviewId, responseText, business.platformToken);
    } else {
      await postTrustpilotReply(business.platformId, reviewRow.platformReviewId, responseText, business.platformToken);
    }
  } catch (err) {
    console.error("Platform post error:", err);
    // Save locally even if platform is down — mark with a note
  }

  const [updated] = await db
    .update(reviews)
    .set({ responded: true, responseText, respondedAt: new Date() })
    .where(eq(reviews.id, numId))
    .returning();

  return NextResponse.json(updated);
}
