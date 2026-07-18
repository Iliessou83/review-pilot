export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { db } from "@/lib/db";
import { reviews, businesses } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { PLATFORM_KEYS, type PlatformKey } from "@/lib/platforms";

// Parse une ligne CSV en gérant les champs entre guillemets.
function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else cur += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === "," || c === ";" || c === "\t") { out.push(cur); cur = ""; }
      else cur += c;
    }
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

function parseRating(raw: string): number | null {
  if (!raw) return null;
  const stars = (raw.match(/★|⭐/g) || []).length;
  if (stars >= 1 && stars <= 5) return stars;
  const n = parseFloat(raw.replace(",", "."));
  if (isNaN(n)) return null;
  return Math.max(1, Math.min(5, Math.round(n)));
}

function parseDate(raw: string): Date {
  if (!raw) return new Date();
  const d = new Date(raw);
  return isNaN(d.getTime()) ? new Date() : d;
}

// Détecte l'index des colonnes à partir d'un en-tête, sinon ordre par défaut.
function detectColumns(header: string[]): { author: number; rating: number; text: number; date: number } {
  const find = (keys: string[]) => header.findIndex((h) => keys.some((k) => h.toLowerCase().includes(k)));
  const author = find(["auteur", "author", "nom", "name", "client"]);
  const rating = find(["note", "rating", "étoile", "etoile", "star", "score"]);
  const text = find(["avis", "commentaire", "text", "review", "message", "contenu"]);
  const date = find(["date", "publié", "publie", "published"]);
  return {
    author: author >= 0 ? author : 0,
    rating: rating >= 0 ? rating : 1,
    text: text >= 0 ? text : 2,
    date: date >= 0 ? date : 3,
  };
}

export async function POST(request: NextRequest) {
  const session = await requireAuth(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { businessId?: number; platform?: string; csv?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const businessId = Number(body.businessId);
  const platform = String(body.platform || "other") as PlatformKey;
  const csv = typeof body.csv === "string" ? body.csv : "";

  if (!businessId || isNaN(businessId)) return NextResponse.json({ error: "Établissement requis" }, { status: 400 });
  if (!PLATFORM_KEYS.includes(platform)) return NextResponse.json({ error: "Source inconnue" }, { status: 400 });
  if (!csv.trim()) return NextResponse.json({ error: "Aucune donnée à importer" }, { status: 400 });

  try {
    const [business] = await db.select({ id: businesses.id }).from(businesses).where(eq(businesses.id, businessId)).limit(1);
    if (!business) return NextResponse.json({ error: "Établissement introuvable" }, { status: 404 });

    const lines = csv.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) return NextResponse.json({ error: "Aucune ligne exploitable" }, { status: 400 });

    // Première ligne = en-tête si elle ne contient pas de note chiffrée.
    const firstCols = parseCsvLine(lines[0]);
    const looksLikeHeader = parseRating(firstCols[1] || "") === null && parseRating(firstCols[2] || "") === null;
    const cols = detectColumns(looksLikeHeader ? firstCols : ["auteur", "note", "avis", "date"]);
    const dataLines = looksLikeHeader ? lines.slice(1) : lines;

    // Empreintes déjà présentes pour éviter les doublons.
    const existing = await db
      .select({ pid: reviews.platformReviewId })
      .from(reviews)
      .where(eq(reviews.businessId, businessId));
    const seen = new Set(existing.map((e) => e.pid));

    const toInsert: (typeof reviews.$inferInsert)[] = [];
    let skipped = 0;
    for (const line of dataLines.slice(0, 1000)) {
      const c = parseCsvLine(line);
      const authorName = (c[cols.author] || "Client").slice(0, 120) || "Client";
      const rating = parseRating(c[cols.rating] || "");
      const text = (c[cols.text] || "").slice(0, 2000);
      if (rating === null || !text.trim()) { skipped++; continue; }
      const publishedAt = parseDate(c[cols.date] || "");
      const fingerprint = createHash("sha1").update(`${authorName}|${text}`).digest("hex").slice(0, 24);
      const platformReviewId = `import:${platform}:${fingerprint}`;
      if (seen.has(platformReviewId)) { skipped++; continue; }
      seen.add(platformReviewId);
      toInsert.push({
        businessId,
        platformReviewId,
        authorName,
        rating,
        text,
        publishedAt,
        responded: false,
        platform,
      });
    }

    if (toInsert.length > 0) {
      // Insertion par lots pour rester sous les limites du pooler.
      for (let i = 0; i < toInsert.length; i += 100) {
        await db.insert(reviews).values(toInsert.slice(i, i + 100));
      }
    }

    return NextResponse.json({ imported: toInsert.length, skipped, platform });
  } catch (err) {
    console.error("[reviews/import] error:", err);
    return NextResponse.json({ error: "Erreur pendant l'import" }, { status: 503 });
  }
}
