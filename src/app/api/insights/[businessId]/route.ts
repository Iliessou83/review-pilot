export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/lib/db";
import { reviews, businesses } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { scopeFrom, ownsBusiness } from "@/lib/scope";
import { eq, and, desc } from "drizzle-orm";
import { platformLabel } from "@/lib/platforms";

const claude = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

type Theme = { label: string; count: number; quote: string };
type AiInsights = {
  sentimentSummary: string;
  praiseThemes: Theme[];
  complaintThemes: Theme[];
  keywords: { word: string; polarity: "positif" | "negatif" | "neutre" }[];
  actions: string[];
};

// Extraction qualitative par Claude (à la demande = coût maîtrisé).
async function analyzeThemes(
  businessName: string,
  sample: { rating: number; text: string }[]
): Promise<AiInsights | null> {
  if (!claude || sample.length === 0) return null;

  const corpus = sample
    .map((r) => `[${r.rating}★] ${r.text.replace(/\s+/g, " ").slice(0, 280)}`)
    .join("\n");

  const prompt = `Tu es analyste e-réputation. Voici ${sample.length} avis clients de "${businessName}".

${corpus}

Analyse ce corpus et renvoie EXACTEMENT ce JSON (sans markdown, sans texte autour) :
{
  "sentimentSummary": "2 phrases max : l'impression générale et ce qui ressort le plus.",
  "praiseThemes": [ { "label": "thème positif court", "count": nombre_d_avis_concernés, "quote": "citation courte tirée d'un avis" } ],
  "complaintThemes": [ { "label": "thème négatif court", "count": nombre_d_avis_concernés, "quote": "citation courte tirée d'un avis" } ],
  "keywords": [ { "word": "mot-clé récurrent", "polarity": "positif|negatif|neutre" } ],
  "actions": [ "action concrète et priorisée pour le gérant" ]
}

Règles : 3 à 5 praiseThemes, 3 à 5 complaintThemes (0 si aucun avis négatif), 8 à 12 keywords, 3 actions. Français naturel, spécifique au métier, aucune invention hors du corpus.`;

  try {
    const res = await claude.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1400,
      messages: [{ role: "user", content: prompt }],
    });
    const text = res.content[0]?.type === "text" ? res.content[0].text : "";
    const cleaned = text.trim().replace(/^```json?\s*/i, "").replace(/```$/i, "").trim();
    const data = JSON.parse(cleaned) as AiInsights;
    return {
      sentimentSummary: String(data.sentimentSummary || ""),
      praiseThemes: Array.isArray(data.praiseThemes) ? data.praiseThemes.slice(0, 5) : [],
      complaintThemes: Array.isArray(data.complaintThemes) ? data.complaintThemes.slice(0, 5) : [],
      keywords: Array.isArray(data.keywords) ? data.keywords.slice(0, 12) : [],
      actions: Array.isArray(data.actions) ? data.actions.slice(0, 4) : [],
    };
  } catch (err) {
    console.error("[insights] AI error:", err);
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  const session = await requireAuth(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { businessId: raw } = await params;
  const businessId = parseInt(raw, 10);
  if (isNaN(businessId) || businessId <= 0) {
    return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });
  }

  // Cloisonnement : un client n'analyse que ses propres commerces.
  const scope = scopeFrom(session);
  if (!(await ownsBusiness(scope, businessId))) {
    return NextResponse.json({ error: "Établissement introuvable" }, { status: 404 });
  }

  const url = new URL(request.url);
  const platformFilter = url.searchParams.get("platform");

  try {
    const [business] = await db
      .select({ id: businesses.id, name: businesses.name })
      .from(businesses)
      .where(eq(businesses.id, businessId))
      .limit(1);
    if (!business) return NextResponse.json({ error: "Établissement introuvable" }, { status: 404 });

    const where =
      platformFilter && platformFilter !== "all"
        ? and(eq(reviews.businessId, businessId), eq(reviews.platform, platformFilter as "google"))
        : eq(reviews.businessId, businessId);

    const rows = await db
      .select({
        rating: reviews.rating,
        text: reviews.text,
        platform: reviews.platform,
        responded: reviews.responded,
        publishedAt: reviews.publishedAt,
      })
      .from(reviews)
      .where(where)
      .orderBy(desc(reviews.publishedAt))
      .limit(500);

    const total = rows.length;

    // --- Stats quantitatives ---
    const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const bySource: Record<string, { count: number; sum: number }> = {};
    let sum = 0;
    let responded = 0;
    for (const r of rows) {
      dist[r.rating] = (dist[r.rating] || 0) + 1;
      sum += r.rating;
      if (r.responded) responded++;
      const p = r.platform || "other";
      bySource[p] = bySource[p] || { count: 0, sum: 0 };
      bySource[p].count++;
      bySource[p].sum += r.rating;
    }
    const avg = total > 0 ? Math.round((sum / total) * 10) / 10 : 0;
    const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0;
    const positive = dist[4] + dist[5];
    const negative = dist[1] + dist[2] + dist[3];

    // Tendance 6 mois
    const now = new Date();
    const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
    const months: { label: string; count: number; sum: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ label: monthNames[d.getMonth()], count: 0, sum: 0 });
    }
    const firstMonth = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    for (const r of rows) {
      const pub = new Date(r.publishedAt);
      if (pub >= firstMonth) {
        const idx = (pub.getFullYear() - firstMonth.getFullYear()) * 12 + (pub.getMonth() - firstMonth.getMonth());
        if (idx >= 0 && idx < 6) { months[idx].count++; months[idx].sum += r.rating; }
      }
    }
    const trend = months.map((m) => ({
      label: m.label,
      count: m.count,
      avg: m.count > 0 ? Math.round((m.sum / m.count) * 10) / 10 : 0,
    }));

    const sources = Object.entries(bySource).map(([key, v]) => ({
      key,
      label: platformLabel(key),
      count: v.count,
      avg: v.count > 0 ? Math.round((v.sum / v.count) * 10) / 10 : 0,
    })).sort((a, b) => b.count - a.count);

    // --- Analyse qualitative (Claude, échantillon plafonné) ---
    // On privilégie les avis avec du texte, en mixant positifs et négatifs.
    const withText = rows.filter((r) => r.text && r.text.trim().length > 8);
    const negatives = withText.filter((r) => r.rating <= 3).slice(0, 60);
    const positives = withText.filter((r) => r.rating >= 4).slice(0, 60);
    const sample = [...negatives, ...positives].slice(0, 120).map((r) => ({ rating: r.rating, text: r.text }));

    const ai = await analyzeThemes(business.name, sample);

    return NextResponse.json({
      businessName: business.name,
      total,
      analyzedText: sample.length,
      avg,
      responseRate,
      positive,
      negative,
      distribution: [1, 2, 3, 4, 5].map((r) => ({ rating: r, count: dist[r] })),
      sources,
      trend,
      ai,
      aiAvailable: ai !== null,
    });
  } catch (err) {
    console.error("[insights] error:", err);
    return NextResponse.json({ error: "Erreur d'analyse" }, { status: 503 });
  }
}
