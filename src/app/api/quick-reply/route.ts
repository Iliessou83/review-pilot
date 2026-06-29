export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { db } from "@/lib/db";
import { reviews, pendingResponses, businesses } from "@/db/schema";
import { getJwtSecret } from "@/lib/auth";
import { publishReply } from "@/lib/platform-reply";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("t");
  if (!token) {
    return NextResponse.redirect(new URL("/quick-reply/error", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, getJwtSecret());

    const pendingId = typeof payload.pendingId === "number" ? payload.pendingId : null;
    const choice = typeof payload.choice === "number" ? payload.choice : null;
    if (pendingId === null || choice === null || choice < 0 || choice > 2) {
      return NextResponse.redirect(new URL("/quick-reply/error", request.url));
    }

    const [pending] = await db
      .select()
      .from(pendingResponses)
      .where(eq(pendingResponses.id, pendingId))
      .limit(1);

    if (!pending) {
      return NextResponse.redirect(new URL("/quick-reply/error", request.url));
    }

    // Idempotent: link already used — redirect to success without re-posting
    if (pending.status === "sent") {
      return NextResponse.redirect(new URL("/quick-reply/success", request.url));
    }

    const suggestions = pending.suggestions as string[];
    const responseText = suggestions[choice];
    if (!responseText) {
      return NextResponse.redirect(new URL("/quick-reply/error", request.url));
    }

    // Charger l'avis + l'établissement pour publier RÉELLEMENT sur la plateforme.
    const [reviewRow] = await db
      .select()
      .from(reviews)
      .where(eq(reviews.id, pending.reviewId))
      .limit(1);
    if (!reviewRow) {
      return NextResponse.redirect(new URL("/quick-reply/error", request.url));
    }

    // Déjà répondu côté avis (autre canal) : on synchronise le pending et on sort.
    if (reviewRow.responded) {
      await db
        .update(pendingResponses)
        .set({ status: "sent", chosenSuggestionIndex: choice })
        .where(eq(pendingResponses.id, pendingId));
      return NextResponse.redirect(new URL("/quick-reply/success", request.url));
    }

    const [business] = await db
      .select()
      .from(businesses)
      .where(eq(businesses.id, reviewRow.businessId))
      .limit(1);
    if (!business) {
      return NextResponse.redirect(new URL("/quick-reply/error", request.url));
    }

    // Publication réelle. On ne marque "sent"/"responded" QUE si ça réussit.
    try {
      await publishReply(reviewRow, business, responseText);
    } catch (err) {
      console.error("[quick-reply] publication plateforme échouée:", err);
      return NextResponse.redirect(new URL("/quick-reply/error", request.url));
    }

    await db
      .update(reviews)
      .set({ responded: true, responseText, respondedAt: new Date() })
      .where(eq(reviews.id, pending.reviewId));

    await db
      .update(pendingResponses)
      .set({ status: "sent", chosenSuggestionIndex: choice })
      .where(eq(pendingResponses.id, pendingId));

    return NextResponse.redirect(new URL("/quick-reply/success", request.url));
  } catch {
    return NextResponse.redirect(new URL("/quick-reply/error", request.url));
  }
}
