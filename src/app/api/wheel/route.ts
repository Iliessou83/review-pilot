export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { wheelConfigs, wheelSpins, type WheelSegment } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { eq, desc, sql } from "drizzle-orm";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function validSegments(v: unknown): v is WheelSegment[] {
  return (
    Array.isArray(v) &&
    v.length >= 2 &&
    v.length <= 12 &&
    v.every(
      (s) =>
        s &&
        typeof s.label === "string" &&
        s.label.length > 0 &&
        typeof s.weight === "number" &&
        s.weight >= 0 &&
        typeof s.color === "string"
    )
  );
}

// GET /api/wheel -> liste des roues + nb de tours
export async function GET(request: NextRequest) {
  const session = await requireAuth(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const configs = await db.select().from(wheelConfigs).orderBy(desc(wheelConfigs.createdAt));

  const counts = await db
    .select({
      wheelConfigId: wheelSpins.wheelConfigId,
      total: sql<number>`count(*)::int`,
      reviews: sql<number>`sum(case when ${wheelSpins.reviewClicked} then 1 else 0 end)::int`,
    })
    .from(wheelSpins)
    .groupBy(wheelSpins.wheelConfigId);

  const byId = new Map(counts.map((c) => [c.wheelConfigId, c]));

  return NextResponse.json({
    wheels: configs.map((c) => ({
      ...c,
      spins: byId.get(c.id)?.total ?? 0,
      reviewClicks: byId.get(c.id)?.reviews ?? 0,
    })),
  });
}

// POST /api/wheel -> crée une roue
export async function POST(request: NextRequest) {
  const session = await requireAuth(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const businessName = String(body.businessName || "").trim();
  const reviewUrl = String(body.reviewUrl || "").trim();
  if (!businessName) return NextResponse.json({ error: "Nom requis" }, { status: 400 });
  if (!reviewUrl) return NextResponse.json({ error: "Lien d'avis requis" }, { status: 400 });
  if (!validSegments(body.segments)) {
    return NextResponse.json({ error: "Segments invalides (2 à 12)" }, { status: 400 });
  }

  let slug = slugify(String(body.slug || businessName));
  if (!slug) slug = `roue-${Date.now().toString(36)}`;
  // garantit l'unicité du slug
  const existing = await db.select({ id: wheelConfigs.id }).from(wheelConfigs).where(eq(wheelConfigs.slug, slug)).limit(1);
  if (existing.length) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

  const [created] = await db
    .insert(wheelConfigs)
    .values({
      businessId: body.businessId ? Number(body.businessId) : null,
      slug,
      mode: body.mode === "concours" ? "concours" : "avis",
      theme: ["dark", "neon", "warm"].includes(String(body.theme)) ? (body.theme as "dark" | "neon" | "warm") : "dark",
      businessName,
      headline: String(body.headline || "Merci de votre visite !"),
      logoUrl: body.logoUrl ? String(body.logoUrl) : null,
      brandColor: String(body.brandColor || "#10b981"),
      reviewUrl,
      segments: body.segments as WheelSegment[],
      requireContact: Boolean(body.requireContact),
      consentText: body.consentText ? String(body.consentText) : null,
    })
    .returning();

  return NextResponse.json({ ok: true, wheel: created });
}

// PUT /api/wheel -> met à jour une roue
export async function PUT(request: NextRequest) {
  const session = await requireAuth(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const id = Number(body.id);
  if (!id || isNaN(id)) return NextResponse.json({ error: "id requis" }, { status: 400 });

  const update: Record<string, unknown> = {};
  if (body.businessName !== undefined) update.businessName = String(body.businessName);
  if (body.headline !== undefined) update.headline = String(body.headline);
  if (body.logoUrl !== undefined) update.logoUrl = body.logoUrl ? String(body.logoUrl) : null;
  if (body.brandColor !== undefined) update.brandColor = String(body.brandColor);
  if (body.reviewUrl !== undefined) update.reviewUrl = String(body.reviewUrl);
  if (body.mode !== undefined) update.mode = body.mode === "concours" ? "concours" : "avis";
  if (body.theme !== undefined && ["dark", "neon", "warm"].includes(String(body.theme))) update.theme = body.theme;
  if (body.requireContact !== undefined) update.requireContact = Boolean(body.requireContact);
  if (body.consentText !== undefined) update.consentText = body.consentText ? String(body.consentText) : null;
  if (body.active !== undefined) update.active = Boolean(body.active);
  if (body.segments !== undefined) {
    if (!validSegments(body.segments)) {
      return NextResponse.json({ error: "Segments invalides (2 à 12)" }, { status: 400 });
    }
    update.segments = body.segments;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Rien à mettre à jour" }, { status: 400 });
  }

  const [updated] = await db.update(wheelConfigs).set(update).where(eq(wheelConfigs.id, id)).returning();
  if (!updated) return NextResponse.json({ error: "Roue introuvable" }, { status: 404 });

  return NextResponse.json({ ok: true, wheel: updated });
}

// DELETE /api/wheel?id=123
export async function DELETE(request: NextRequest) {
  const session = await requireAuth(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!id || isNaN(id)) return NextResponse.json({ error: "id requis" }, { status: 400 });

  await db.delete(wheelConfigs).where(eq(wheelConfigs.id, id));
  return NextResponse.json({ ok: true });
}
