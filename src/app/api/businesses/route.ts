export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { businesses } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const session = await requireAuth(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const all = await db.select().from(businesses).orderBy(businesses.createdAt);
    return NextResponse.json(all);
  } catch (err) {
    console.error("GET /businesses error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await requireAuth(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { name, platform, platformId, platformToken, ownerEmail, autoReply5Star } = body as {
    name?: string; platform?: string; platformId?: string;
    platformToken?: string; ownerEmail?: string; autoReply5Star?: boolean;
  };

  if (!name || !platform || !platformId || !platformToken || !ownerEmail) {
    return NextResponse.json({ error: "All fields required" }, { status: 400 });
  }

  if (platform !== "google" && platform !== "trustpilot") {
    return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
  }

  if (typeof ownerEmail === "string" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail)) {
    return NextResponse.json({ error: "Invalid owner email" }, { status: 400 });
  }

  try {
    const [created] = await db.insert(businesses).values({
      name: String(name).slice(0, 255),
      platform: platform as "google" | "trustpilot",
      platformId: String(platformId).slice(0, 500),
      platformToken: String(platformToken).slice(0, 1000),
      ownerEmail: String(ownerEmail).toLowerCase().trim(),
      autoReply5Star: autoReply5Star ?? true,
    }).returning();

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("POST /businesses error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await requireAuth(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const idParam = searchParams.get("id");
  const id = idParam ? parseInt(idParam, 10) : NaN;

  if (!idParam || isNaN(id) || id <= 0) {
    return NextResponse.json({ error: "Valid ID required" }, { status: 400 });
  }

  try {
    const deleted = await db.delete(businesses).where(eq(businesses.id, id)).returning({ id: businesses.id });
    if (deleted.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /businesses error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
