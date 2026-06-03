export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviews, businesses, pendingResponses } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { generateResponseSuggestions } from "@/lib/claude";
import { Resend } from "resend";
import { SignJWT } from "jose";

const getResend = () => new Resend(process.env.RESEND_API_KEY || "placeholder");

async function createQuickToken(pendingId: number, choice: number): Promise<string> {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET || "reviewpilot-secret-key-min-32-chars-2026");
  return new SignJWT({ pendingId, choice })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

function buildNotificationEmail(
  ownerEmail: string,
  businessName: string,
  authorName: string,
  rating: number,
  reviewText: string,
  suggestions: string[],
  tokens: string[],
  appUrl: string
) {
  const pendingUrl = `${appUrl}/pending`;
  const token0Url = `${appUrl}/api/quick-reply?t=${tokens[0]}`;
  const token1Url = `${appUrl}/api/quick-reply?t=${tokens[1]}`;
  const token2Url = `${appUrl}/api/quick-reply?t=${tokens[2]}`;

  return {
    from: "ReviewPilot <notifications@caela.fr>",
    to: ownerEmail,
    subject: `Avis ${rating}★ pour ${businessName} — action requise`,
    html: `
<div style="font-family:'Google Sans',system-ui,sans-serif;max-width:600px;margin:0 auto;background:#fff;border:1px solid #DADCE0;border-radius:12px;overflow:hidden;">
  <!-- Header -->
  <div style="background:#1A73E8;padding:20px 28px;display:flex;align-items:center;gap:10px;">
    <div style="display:flex;gap:4px;">
      <div style="width:8px;height:8px;border-radius:50%;background:#EA4335;"></div>
      <div style="width:8px;height:8px;border-radius:50%;background:#FBBC04;"></div>
      <div style="width:8px;height:8px;border-radius:50%;background:#34A853;"></div>
    </div>
    <span style="color:#fff;font-size:18px;font-weight:700;">ReviewPilot</span>
    <span style="color:rgba(255,255,255,0.7);font-size:13px;margin-left:4px;">par Caela</span>
  </div>

  <!-- Alert -->
  <div style="padding:24px 28px 0;">
    <div style="background:#FCE8E6;border-radius:8px;padding:14px 16px;display:flex;align-items:center;gap:10px;margin-bottom:20px;">
      <span style="font-size:20px;">⚠️</span>
      <div>
        <div style="font-size:14px;font-weight:700;color:#EA4335;">Avis ${rating}★ — action requise</div>
        <div style="font-size:12px;color:#5F6368;">${businessName} · ${authorName}</div>
      </div>
    </div>

    <!-- Review text -->
    <div style="background:#F8F9FA;border-left:3px solid #DADCE0;border-radius:0 8px 8px 0;padding:12px 16px;margin-bottom:24px;">
      <div style="font-size:12px;color:#5F6368;margin-bottom:4px;">${authorName} écrit :</div>
      <div style="font-size:14px;color:#202124;font-style:italic;">"${reviewText}"</div>
    </div>

    <div style="font-size:14px;font-weight:600;color:#202124;margin-bottom:14px;">Choisissez votre réponse en 1 clic :</div>
  </div>

  <!-- 3 buttons -->
  <div style="padding:0 28px;">
    <!-- Button EMPATHIQUE -->
    <a href="${token0Url}" style="display:block;margin-bottom:10px;padding:14px 18px;background:#FCE8E6;border:1px solid rgba(234,67,53,0.3);border-radius:10px;text-decoration:none;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;">
        <span>💛</span>
        <span style="font-size:12px;font-weight:700;color:#EA4335;text-transform:uppercase;letter-spacing:0.5px;">EMPATHIQUE</span>
      </div>
      <div style="font-size:13px;color:#202124;">${suggestions[0]}</div>
    </a>
    <!-- Button SOLUTION -->
    <a href="${token1Url}" style="display:block;margin-bottom:10px;padding:14px 18px;background:#E6F4EA;border:1px solid rgba(52,168,83,0.3);border-radius:10px;text-decoration:none;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;">
        <span>🎯</span>
        <span style="font-size:12px;font-weight:700;color:#34A853;text-transform:uppercase;letter-spacing:0.5px;">SOLUTION</span>
      </div>
      <div style="font-size:13px;color:#202124;">${suggestions[1]}</div>
    </a>
    <!-- Button PRO -->
    <a href="${token2Url}" style="display:block;margin-bottom:10px;padding:14px 18px;background:#E8F0FE;border:1px solid rgba(26,115,232,0.3);border-radius:10px;text-decoration:none;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;">
        <span>🏆</span>
        <span style="font-size:12px;font-weight:700;color:#1A73E8;text-transform:uppercase;letter-spacing:0.5px;">PROFESSIONNEL</span>
      </div>
      <div style="font-size:13px;color:#202124;">${suggestions[2]}</div>
    </a>
  </div>

  <!-- Footer -->
  <div style="padding:20px 28px;border-top:1px solid #DADCE0;margin-top:20px;text-align:center;">
    <a href="${pendingUrl}" style="color:#1A73E8;font-size:13px;font-weight:500;">Gérer depuis le dashboard →</a>
    <p style="margin:12px 0 0;font-size:10px;color:#80868B;">ReviewPilot est un outil indépendant, non affilié à Google LLC.</p>
  </div>
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

  // Generate magic-link tokens (one per choice 0,1,2)
  const tokens = await Promise.all([
    createQuickToken(pending.id, 0),
    createQuickToken(pending.id, 1),
    createQuickToken(pending.id, 2),
  ]);

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
        tokens,
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
