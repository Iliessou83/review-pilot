export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pendingResponses } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const session = await requireAuth(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const numId = parseInt(id, 10);
  if (isNaN(numId) || numId <= 0) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  let body: { status?: string; chosenSuggestionIndex?: number; customResponse?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Validate status value
  if (body.status !== undefined && body.status !== "pending" && body.status !== "sent") {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  // Verify the resource exists
  const existing = await db
    .select({ id: pendingResponses.id })
    .from(pendingResponses)
    .where(eq(pendingResponses.id, numId))
    .limit(1);

  if (existing.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [updated] = await db
    .update(pendingResponses)
    .set({
      status: body.status as "pending" | "sent" | undefined,
      chosenSuggestionIndex: body.chosenSuggestionIndex,
      customResponse: body.customResponse,
    })
    .where(eq(pendingResponses.id, numId))
    .returning();

  return NextResponse.json(updated);
}
