export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pendingResponses } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { eq, count } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const session = await requireAuth(request);
  if (!session) return NextResponse.json({ count: 0 });

  const [res] = await db
    .select({ count: count() })
    .from(pendingResponses)
    .where(eq(pendingResponses.status, "pending"));

  return NextResponse.json({ count: res?.count || 0 });
}
