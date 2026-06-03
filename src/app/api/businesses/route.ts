export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { businesses } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const session = await requireAuth(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const all = await db.select().from(businesses).orderBy(businesses.createdAt);
  return NextResponse.json(all);
}

export async function POST(request: NextRequest) {
  const session = await requireAuth(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, platform, platformId, platformToken, ownerEmail, autoReply5Star } = body as {
    name: string;
    platform: "google" | "trustpilot";
    platformId: string;
    platformToken: string;
    ownerEmail: string;
    autoReply5Star?: boolean;
  };

  if (!name || !platform || !platformId || !platformToken || !ownerEmail) {
    return NextResponse.json({ error: "All fields required" }, { status: 400 });
  }

  const [created] = await db
    .insert(businesses)
    .values({
      name,
      platform,
      platformId,
      platformToken,
      ownerEmail,
      autoReply5Star: autoReply5Star ?? true,
    })
    .returning();

  return NextResponse.json(created, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const session = await requireAuth(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }

  await db.delete(businesses).where(eq(businesses.id, parseInt(id)));
  return NextResponse.json({ success: true });
}
