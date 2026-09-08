export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { cronAutorise, avecSignalement } from "@/lib/cronSignal";
import { db } from "@/lib/db";
import { businesses, reviews, internalAlerts } from "@/db/schema";
import { eq, and, gte, lt, lte, avg, count, isNull } from "drizzle-orm";
import { envoyer, EXPEDITEUR } from "@/lib/email";
import { escapeHtml } from "@/lib/escape-html";

// ── Radar interne "client en train de décrocher" ────────────────────────────
//
// Jamais montré au client — voir le playbook ops (section 4). Trois signaux,
// chacun dédupliqué : si un business a déjà une alerte du même type non
// résolue depuis moins de 7 jours, on ne réinsère pas une ligne par jour où
// le seuil reste franchi (sinon la table grossit pour rien et le digest
// devient illisible).
//
// 1. rating_drop    : note moyenne des 30 derniers jours en baisse d'au moins
//                      0,5★ vs les 30 jours précédents (minimum 3 avis sur la
//                      période précédente, sinon le signal n'est pas fiable).
// 2. negative_spike : 3 avis ≤2★ ou plus sur les 14 derniers jours.
// 3. health_low     : score de santé (même formule que /dashboard) sous 50/100,
//                      uniquement si le business a au moins 1 avis (sinon le
//                      score est mécaniquement bas sans rien dire d'utile).

const DEDUPE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

async function dejaAlerte(businessId: number, type: "rating_drop" | "negative_spike" | "health_low") {
  const seuil = new Date(Date.now() - DEDUPE_WINDOW_MS);
  const [row] = await db
    .select({ id: internalAlerts.id })
    .from(internalAlerts)
    .where(and(
      eq(internalAlerts.businessId, businessId),
      eq(internalAlerts.type, type),
      isNull(internalAlerts.resolvedAt),
      gte(internalAlerts.createdAt, seuil),
    ))
    .limit(1);
  return Boolean(row);
}

async function handler(request: Request) {
  if (!cronAutorise(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const j14 = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const j30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const j60 = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const bizList = await db.select({ id: businesses.id, name: businesses.name }).from(businesses);

    const nouvelles: { businessName: string; type: string; detail: string; severity: string }[] = [];

    for (const biz of bizList) {
      const bizFilter = eq(reviews.businessId, biz.id);

      const [last30, prev30, neg14, totalStats, autoRespondedCount] = await Promise.all([
        db.select({ avg: avg(reviews.rating), count: count() }).from(reviews).where(and(bizFilter, gte(reviews.publishedAt, j30))),
        db.select({ avg: avg(reviews.rating), count: count() }).from(reviews).where(and(bizFilter, gte(reviews.publishedAt, j60), lt(reviews.publishedAt, j30))),
        db.select({ count: count() }).from(reviews).where(and(bizFilter, gte(reviews.publishedAt, j14), lte(reviews.rating, 2))),
        db.select({ avg: avg(reviews.rating), count: count() }).from(reviews).where(bizFilter),
        db.select({ count: count() }).from(reviews).where(and(bizFilter, eq(reviews.responded, true))),
      ]);

      const totalReviews = totalStats[0]?.count || 0;
      if (totalReviews === 0) continue;

      // 1. rating_drop
      const prevCount = prev30[0]?.count || 0;
      if (prevCount >= 3) {
        const lastAvg = parseFloat(String(last30[0]?.avg || "0"));
        const prevAvg = parseFloat(String(prev30[0]?.avg || "0"));
        const lastCount = last30[0]?.count || 0;
        if (lastCount > 0 && prevAvg - lastAvg >= 0.5) {
          if (!(await dejaAlerte(biz.id, "rating_drop"))) {
            const detail = `Note passée de ${prevAvg.toFixed(1)}★ à ${lastAvg.toFixed(1)}★ (30 derniers jours vs 30 jours précédents)`;
            await db.insert(internalAlerts).values({ businessId: biz.id, type: "rating_drop", detail, severity: "high" });
            nouvelles.push({ businessName: biz.name, type: "Note en baisse", detail, severity: "high" });
          }
        }
      }

      // 2. negative_spike
      const negCount = neg14[0]?.count || 0;
      if (negCount >= 3) {
        if (!(await dejaAlerte(biz.id, "negative_spike"))) {
          const detail = `${negCount} avis ≤2★ sur les 14 derniers jours`;
          await db.insert(internalAlerts).values({ businessId: biz.id, type: "negative_spike", detail, severity: "high" });
          nouvelles.push({ businessName: biz.name, type: "Pic d'avis négatifs", detail, severity: "high" });
        }
      }

      // 3. health_low (même formule que /dashboard)
      const avgRating = parseFloat(String(totalStats[0]?.avg || "0"));
      const autoResponded = autoRespondedCount[0]?.count || 0;
      const ratingScore = Math.round((avgRating / 5) * 40);
      const responseScore = totalReviews > 0 ? Math.round((autoResponded / totalReviews) * 35) : 0;
      const volumeScore = Math.min(totalReviews, 25);
      const health = ratingScore + responseScore + volumeScore;
      if (health < 50) {
        if (!(await dejaAlerte(biz.id, "health_low"))) {
          const detail = `Score de santé à ${health}/100 (note ${ratingScore}/40, réponse ${responseScore}/35, volume ${volumeScore}/25)`;
          await db.insert(internalAlerts).values({ businessId: biz.id, type: "health_low", detail, severity: "medium" });
          nouvelles.push({ businessName: biz.name, type: "Score de santé bas", detail, severity: "medium" });
        }
      }
    }

    if (nouvelles.length === 0) {
      return NextResponse.json({ ok: true, nouvelles_alertes: 0 });
    }

    const destinataire = process.env.CLIENT_NOTIFICATION_EMAIL || "contact@caela.fr";
    const envoye = await envoyer({
      from: EXPEDITEUR,
      to: destinataire,
      subject: `🚩 ${nouvelles.length} nouvelle${nouvelles.length > 1 ? "s" : ""} alerte${nouvelles.length > 1 ? "s" : ""} interne${nouvelles.length > 1 ? "s" : ""} — Caela Réputation`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:560px;">
          <h2 style="margin:0 0 4px;">Radar réputation — ${nouvelles.length} client${nouvelles.length > 1 ? "s" : ""} à surveiller</h2>
          <p style="color:#5F6368;font-size:13px;margin:0 0 20px;">Usage interne — jamais envoyé à un client.</p>
          ${nouvelles.map(a => `
            <div style="border:1px solid #DADCE0;border-radius:10px;padding:14px 18px;margin-bottom:10px;">
              <div style="font-weight:700;font-size:14px;">${escapeHtml(a.businessName)}</div>
              <div style="font-size:12px;font-weight:700;color:${a.severity === "high" ? "#D6455D" : "#B4740E"};margin:2px 0 6px;">${escapeHtml(a.type)}</div>
              <div style="font-size:13px;color:#5F6368;">${escapeHtml(a.detail)}</div>
            </div>
          `).join("")}
        </div>
      `,
    });

    if (!envoye) {
      console.error("[cron/internal-alerts] alertes enregistrées en base mais digest email non envoyé");
    }

    return NextResponse.json({ ok: true, nouvelles_alertes: nouvelles.length, notified: envoye });
  } catch (err) {
    console.error("Internal alerts cron error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export const GET = avecSignalement("/api/cron/internal-alerts", handler);
