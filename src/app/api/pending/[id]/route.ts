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
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json() as {
    status?: "pending" | "sent";
    chosenSuggestionIndex?: number;
    customResponse?: string;
  };

  const [updated] = await db
    .update(pendingResponses)
    .set({
      status: body.status,
      chosenSuggestionIndex: body.chosenSuggestionIndex,
      customResponse: body.customResponse,
    })
    .where(eq(pendingResponses.id, parseInt(id)))
    .returning();

  return NextResponse.json(updated);
}
