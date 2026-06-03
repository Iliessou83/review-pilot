export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviews, businesses, pendingResponses } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { generateResponseSuggestions } from "@/lib/claude";
import { Resend } from "resend";

const getResend = () => new Resend(process.env.RESEND_API_KEY || "placeholder");

function buildNotificationEmail(
  ownerEmail: string,
  businessName: string,
  authorName: string,
  rating: number,
  reviewText: string,
  suggestions: string[],
  reviewId: number,
  appUrl: string
) {
  const stars = "⭐".repeat(rating);
  const pendingUrl = `${appUrl}/pending`;

  const suggestionsHtml = suggestions
    .map(
      (s, i) =>
        `<div style="margin:12px 0;padding:14px;background:#1a1a2e;border-left:3px solid #6c47ff;border-radius:4px;">
          <strong style="color:#9d7dff">Option ${i + 1}</strong>
          <p style="color:#e0e0f0;margin:8px 0 0">${s}</p>
        </div>`
    )
    .join("");

  return {
    from: "ReviewPilot <notifications@caela.fr>",
    to: ownerEmail,
    subject: `New ${rating}-star review for ${businessName} — Action needed`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:640px;margin:0 auto;background:#0a0a0f;color:#f8f8ff;padding:32px;border-radius:12px;">
        <h1 style="color:#6c47ff;margin:0 0 8px">ReviewPilot</h1>
        <p style="color:rgba(248,248,255,0.5);margin:0 0 32px;font-size:13px">Automated review management</p>

        <div style="background:#111118;border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:20px;margin-bottom:24px;">
          <p style="margin:0 0 4px;color:rgba(248,248,255,0.5);font-size:12px;text-transform:uppercase;letter-spacing:1px">${businessName}</p>
          <p style="margin:0 0 8px;font-size:18px">${stars} ${authorName}</p>
          <p style="margin:0;color:rgba(248,248,255,0.7);font-style:italic">"${reviewText}"</p>
        </div>

        <h2 style="color:#f8f8ff;font-size:16px;margin:0 0 16px">5 Response suggestions:</h2>
        ${suggestionsHtml}

        <div style="text-align:center;margin-top:32px;">
          <a href="${pendingUrl}" style="background:#6c47ff;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;display:inline-block;">
            Choose & Post Response →
          </a>
        </div>

        <p style="margin-top:32px;color:rgba(248,248,255,0.3);font-size:12px;text-align:center;">
          ReviewPilot — Automated review management by Caela Agency
        </p>
      </div>
    `,
  };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const cronSecret = request.headers.get("x-cron-secret");
  const isCron = cronSecret === process.env.CRON_SECRET;

  if (!isCron) {
    const session = await requireAuth(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const [reviewRow] = await db
    .select()
    .from(reviews)
    .where(eq(reviews.id, parseInt(id)))
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

  const suggestions = await generateResponseSuggestions(
    reviewRow.text,
    reviewRow.authorName,
    business.name,
    reviewRow.rating
  );

  const [pending] = await db
    .insert(pendingResponses)
    .values({
      reviewId: reviewRow.id,
      suggestions,
      status: "pending",
    })
    .returning();

  // Send email notification
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    await getResend().emails.send(
      buildNotificationEmail(
        business.ownerEmail,
        business.name,
        reviewRow.authorName,
        reviewRow.rating,
        reviewRow.text,
        suggestions,
        reviewRow.id,
        appUrl
      )
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

  const result = await db
    .select()
    .from(pendingResponses)
    .where(eq(pendingResponses.reviewId, parseInt(id)))
    .limit(1);

  return NextResponse.json(result[0] || null);
}
