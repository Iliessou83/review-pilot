export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviews, businesses, pendingResponses } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { generateResponseSuggestions } from "@/lib/claude";
import { buildNotificationEmail } from "@/lib/review-processing";
import { Resend } from "resend";
import { SignJWT } from "jose";
import { getJwtSecret } from "@/lib/auth";

const getResend = () => new Resend(process.env.RESEND_API_KEY || "placeholder");

async function createQuickToken(pendingId: number, choice: number): Promise<string> {
  return new SignJWT({ pendingId, choice })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("48h")
    .sign(getJwtSecret());
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

  const [reviewRow] = await db
    .select()
    .from(reviews)
    .where(eq(reviews.id, numId))
    .limit(1);

  if (!reviewRow) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  const [business] = await db
    .select()
    .from(businesses)
    .where(eq(businesses.id, reviewRow.businessId))
    .limit(1);

  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  // Idempotent: don't create duplicate pending entries
  const existingPending = await db
    .select({ id: pendingResponses.id })
    .from(pendingResponses)
    .where(eq(pendingResponses.reviewId, reviewRow.id))
    .limit(1);

  if (existingPending.length > 0) {
    return NextResponse.json({ message: "Pending already exists", pendingId: existingPending[0].id });
  }

  let suggestions: string[];
  try {
    suggestions = await generateResponseSuggestions(
      reviewRow.text, reviewRow.authorName, business.name, reviewRow.rating
    );
  } catch (err) {
    console.error("Suggestion generation failed:", err);
    return NextResponse.json({ error: "Failed to generate suggestions" }, { status: 502 });
  }

  const [pending] = await db
    .insert(pendingResponses)
    .values({ reviewId: reviewRow.id, suggestions, status: "pending" })
    .returning();

  const tokens = await Promise.all([
    createQuickToken(pending.id, 0),
    createQuickToken(pending.id, 1),
    createQuickToken(pending.id, 2),
  ]);

  const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    await getResend().emails.send(
      buildNotificationEmail(business.ownerEmail, business.name, reviewRow.authorName, reviewRow.rating, reviewRow.text, suggestions, tokens, appUrl)
    );
  } catch (err) {
    console.error("Email send error:", err);
  }

  return NextResponse.json({ pending, suggestions });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const session = await requireAuth(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const numId = parseInt(id, 10);
  if (isNaN(numId) || numId <= 0) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const result = await db
    .select()
    .from(pendingResponses)
    .where(eq(pendingResponses.reviewId, numId))
    .limit(1);

  if (!result[0]) {
    return NextResponse.json(null, { status: 404 });
  }

  return NextResponse.json(result[0]);
}
