export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { wheelConfigs, wheelSpins } from "@/db/schema";
import { eq } from "drizzle-orm";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

function isPhone(v: unknown): v is string {
  return typeof v === "string" && v.replace(/[\s.\-()]/g, "").length >= 8;
}

// Tirage pondéré côté serveur : empêche le client de forcer un lot.
function pickWeighted(weights: number[]): number {
  const total = weights.reduce((s, w) => s + Math.max(0, w), 0);
  if (total <= 0) return Math.floor(Math.random() * weights.length);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= Math.max(0, weights[i]);
    if (r < 0) return i;
  }
  return weights.length - 1;
}

function isEmail(v: unknown): v is string {
  return typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

// POST /api/wheel/spin  { slug, email?, phone? } -> { spinId, prizeIndex, prizeLabel }
export async function POST(request: NextRequest) {
  // Anti-spam / anti-farming de lots : 10 tours / heure / IP.
  const ip = getClientIp(request);
  if (!rateLimit(`spin:${ip}`, 10, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Trop de tentatives. Réessayez plus tard." }, { status: 429 });
  }

  let body: { slug?: string; email?: string; phone?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const slug = (body.slug || "").trim();
  if (!slug) return NextResponse.json({ error: "slug requis" }, { status: 400 });

  const [config] = await db
    .select()
    .from(wheelConfigs)
    .where(eq(wheelConfigs.slug, slug))
    .limit(1);

  if (!config || !config.active) {
    return NextResponse.json({ error: "Roue introuvable" }, { status: 404 });
  }

  const segments = config.segments || [];
  if (segments.length === 0) {
    return NextResponse.json({ error: "Roue non configurée" }, { status: 400 });
  }

  // Mode concours : capture contact obligatoire (email OU téléphone, comme promis).
  if (config.requireContact && !isEmail(body.email) && !isPhone(body.phone)) {
    return NextResponse.json({ error: "Email ou téléphone requis" }, { status: 400 });
  }

  const prizeIndex = pickWeighted(segments.map((s) => s.weight));
  const prizeLabel = segments[prizeIndex].label;

  const [spin] = await db
    .insert(wheelSpins)
    .values({
      wheelConfigId: config.id,
      prizeIndex,
      prizeLabel,
      email: isEmail(body.email) ? body.email : null,
      phone: typeof body.phone === "string" && body.phone.trim() ? body.phone.trim() : null,
    })
    .returning({ id: wheelSpins.id });

  return NextResponse.json({ spinId: spin.id, prizeIndex, prizeLabel });
}

// PATCH /api/wheel/spin  { spinId } -> marque le clic vers Google (mesure, jamais conditionné)
export async function PATCH(request: NextRequest) {
  let body: { spinId?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const spinId = Number(body.spinId);
  if (!spinId || isNaN(spinId)) {
    return NextResponse.json({ error: "spinId requis" }, { status: 400 });
  }
  await db
    .update(wheelSpins)
    .set({ reviewClicked: true })
    .where(eq(wheelSpins.id, spinId));
  return NextResponse.json({ ok: true });
}
