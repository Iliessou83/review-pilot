export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviews, businesses } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { scopeFrom, ownsBusiness } from "@/lib/scope";
import { eq } from "drizzle-orm";
import { generateAutoResponse } from "@/lib/claude";
import { publishReply } from "@/lib/platform-reply";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const cronSecret = request.headers.get("x-cron-secret");
  const isCron = cronSecret !== null && cronSecret === process.env.CRON_SECRET;

  let session: Awaited<ReturnType<typeof requireAuth>> = null;
  if (!isCron) {
    session = await requireAuth(request);
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

  // Cloisonnement : un client ne répond qu'aux avis de ses commerces.
  if (session && !(await ownsBusiness(scopeFrom(session), reviewRow.businessId))) {
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

  // On ne marque "responded" QUE si la publication plateforme réussit.
  // Un échec (token expiré, 403...) renvoie 502 et l'avis reste à retenter.
  try {
    await publishReply(reviewRow, business, responseText);
  } catch (err) {
    console.error("Platform post error:", err);
    return NextResponse.json(
      { error: "La publication sur la plateforme a échoué. Réessayez." },
      { status: 502 }
    );
  }

  const [updated] = await db
    .update(reviews)
    .set({ responded: true, responseText, respondedAt: new Date() })
    .where(eq(reviews.id, numId))
    .returning();

  return NextResponse.json(updated);
}
