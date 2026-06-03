export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { db } from "@/lib/db";
import { reviews, pendingResponses } from "@/db/schema";
import { eq } from "drizzle-orm";

const SECRET = () =>
  new TextEncoder().encode(
    process.env.JWT_SECRET || "reviewpilot-secret-key-min-32-chars-2026"
  );

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("t");
  if (!token) {
    return NextResponse.redirect(new URL("/quick-reply/error", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, SECRET());
    const { pendingId, choice } = payload as {
      pendingId: number;
      choice: number;
    };

    const [pending] = await db
      .select()
      .from(pendingResponses)
      .where(eq(pendingResponses.id, pendingId))
      .limit(1);

    if (!pending) {
      return NextResponse.redirect(new URL("/quick-reply/error", request.url));
    }

    const suggestions = pending.suggestions as string[];
    const responseText = suggestions[choice];
    if (!responseText) {
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
