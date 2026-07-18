export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { reviews, businesses, pendingResponses } from "@/db/schema";
import { eq, desc, count, avg, gte, and, lt, inArray } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getScope, ownedBusinessIds } from "@/lib/scope";

// Stats vides (client sans commerce rattaché) : évite d'afficher des chiffres
// d'autres comptes et de faire des requêtes inutiles.
function emptyStats() {
  const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
  const now = new Date();
  return {
    totalReviews: 0, avgRating: "0.0", autoResponded: 0, pending: 0, recentReviews: [],
    history: [3, 2, 1, 0].map((k) => ({ label: monthNames[(now.getMonth() - k + 12) % 12], count: 0, avg: 0 })),
    thisMonthCount: 0, thisMonthAvg: "0.0", lastMonthAvg: "0.0", evolution: 0, evolutionPct: 0,
    negThisMonth: 0, negLastMonth: 0,
  };
}

const G = { blue: "#1A73E8", red: "#EA4335", yellow: "#FBBC04", green: "#34A853" };
const SHADOW = "0 1px 3px rgba(60,64,67,0.12), 0 1px 2px rgba(60,64,67,0.06)";
const SHADOW_MD = "0 2px 6px rgba(60,64,67,0.15), 0 1px 4px rgba(60,64,67,0.1)";

async function getStats(biz: ReturnType<typeof inArray> | undefined, hasNone: boolean) {
  if (hasNone) return emptyStats();
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const twoMonthsStart = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  const threeMonthsStart = new Date(now.getFullYear(), now.getMonth() - 3, 1);

  const [totalRes, avgRes, autoRes, pendingRes, recent,
    thisMonth, lastMonth, twoMonths, threeMonths,
    thisMonthAvg, lastMonthAvg,
    negThisMonth, negLastMonth] = await Promise.all([
    db.select({ count: count() }).from(reviews).where(biz),
    db.select({ avg: avg(reviews.rating) }).from(reviews).where(biz),
    db.select({ count: count() }).from(reviews).where(and(eq(reviews.responded, true), biz)),
    db.select({ count: count() }).from(pendingResponses)
      .innerJoin(reviews, eq(pendingResponses.reviewId, reviews.id))
      .where(and(eq(pendingResponses.status, "pending"), biz)),
    db.select({ review: reviews, businessName: businesses.name })
      .from(reviews)
      .leftJoin(businesses, eq(reviews.businessId, businesses.id))
      .where(biz)
      .orderBy(desc(reviews.publishedAt))
      .limit(10),
    // Monthly counts
    db.select({ count: count() }).from(reviews).where(and(gte(reviews.publishedAt, thisMonthStart), biz)),
    db.select({ count: count() }).from(reviews).where(and(gte(reviews.publishedAt, lastMonthStart), lt(reviews.publishedAt, thisMonthStart), biz)),
    db.select({ count: count() }).from(reviews).where(and(gte(reviews.publishedAt, twoMonthsStart), lt(reviews.publishedAt, lastMonthStart), biz)),
    db.select({ count: count() }).from(reviews).where(and(gte(reviews.publishedAt, threeMonthsStart), lt(reviews.publishedAt, twoMonthsStart), biz)),
    // Monthly avg rating
    db.select({ avg: avg(reviews.rating) }).from(reviews).where(and(gte(reviews.publishedAt, thisMonthStart), biz)),
    db.select({ avg: avg(reviews.rating) }).from(reviews).where(and(gte(reviews.publishedAt, lastMonthStart), lt(reviews.publishedAt, thisMonthStart), biz)),
    // Negative reviews this vs last month
    db.select({ count: count() }).from(reviews).where(and(gte(reviews.publishedAt, thisMonthStart), lt(reviews.rating, 4), biz)),
    db.select({ count: count() }).from(reviews).where(and(gte(reviews.publishedAt, lastMonthStart), lt(reviews.publishedAt, thisMonthStart), lt(reviews.rating, 4), biz)),
  ]);

  const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
  const history = [
    { label: monthNames[(now.getMonth() - 3 + 12) % 12], count: threeMonths[0]?.count || 0, avg: 0 },
    { label: monthNames[(now.getMonth() - 2 + 12) % 12], count: twoMonths[0]?.count || 0, avg: 0 },
    { label: monthNames[(now.getMonth() - 1 + 12) % 12], count: lastMonth[0]?.count || 0, avg: parseFloat(String(lastMonthAvg[0]?.avg || "0")) },
    { label: monthNames[now.getMonth()], count: thisMonth[0]?.count || 0, avg: parseFloat(String(thisMonthAvg[0]?.avg || "0")) },
  ];

  const thisMonthCount = thisMonth[0]?.count ?? 0;
  const lastMonthCount = lastMonth[0]?.count ?? 0;
  const evolution = thisMonthCount - lastMonthCount;
  const evolutionPct = lastMonthCount > 0
    ? Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100)
    : 0;

  return {
    totalReviews: totalRes[0]?.count || 0,
    avgRating: parseFloat(String(avgRes[0]?.avg || "0")).toFixed(1),
    autoResponded: autoRes[0]?.count || 0,
    pending: pendingRes[0]?.count || 0,
    recentReviews: recent,
    history,
    thisMonthCount: thisMonth[0]?.count || 0,
    thisMonthAvg: parseFloat(String(thisMonthAvg[0]?.avg || "0")).toFixed(1),
    lastMonthAvg: parseFloat(String(lastMonthAvg[0]?.avg || "0")).toFixed(1),
    evolution,
    evolutionPct,
    negThisMonth: negThisMonth[0]?.count || 0,
    negLastMonth: negLastMonth[0]?.count || 0,
  };
}

function Stars({ rating }: { rating: number }) {
  return (
    <span>
      {[1,2,3,4,5].map((i) => (
        <span key={i} style={{ color: i <= rating ? G.yellow : "#DADCE0", fontSize: "13px" }}>★</span>
      ))}
    </span>
  );
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
      <div style={{ width: "100%", height: "80px", background: "#F8F9FA", borderRadius: "6px", display: "flex", alignItems: "flex-end", overflow: "hidden" }}>
        <div style={{ width: "100%", height: `${Math.max(pct, 4)}%`, background: color, borderRadius: "4px 4px 0 0", transition: "height 0.4s ease", opacity: pct === 0 ? 0.2 : 1 }} />
      </div>
      <span style={{ fontSize: "18px", fontWeight: 700, color: "#202124" }}>{value}</span>
    </div>
  );
}

export default async function DashboardPage() {
  // Cloisonnement : super-admin = tous les commerces ; client = les siens.
  const scope = await getScope();
  if (!scope) redirect("/");
  const ids = await ownedBusinessIds(scope);
  const biz = ids === "all" ? undefined : inArray(reviews.businessId, ids.length ? ids : [-1]);
  const hasNone = ids !== "all" && ids.length === 0;

  const stats = await getStats(biz, hasNone).catch(() => emptyStats());

  const maxHistory = Math.max(...(stats.history as {count:number}[]).map(h => h.count), 1);

  const cards = [
    { label: "Total avis", value: stats.totalReviews, color: G.blue, icon: "📋", bg: "#E8F0FE" },
    { label: "Note moyenne", value: `${stats.avgRating} ★`, color: G.yellow, icon: "⭐", bg: "#FEF7E0" },
    { label: "Répondu auto.", value: stats.autoResponded, color: G.green, icon: "✓", bg: "#E6F4EA" },
    { label: "En attente", value: stats.pending, color: G.red, icon: "⏳", bg: "#FCE8E6" },
  ];

  const evolutionPositive = stats.evolution >= 0;
  const negEvolution = stats.negThisMonth - stats.negLastMonth;

  const now = new Date();
  const monthName = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"][now.getMonth()];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ margin: "0 0 4px", fontSize: "24px", fontWeight: 700, color: "#202124", letterSpacing: "-0.5px" }}>
            Tableau de bord
          </h1>
          <p style={{ margin: 0, color: "#5F6368", fontSize: "14px" }}>Vue d&apos;ensemble de votre réputation Google</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {stats.pending > 0 && (
            <Link href="/pending" style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "8px 16px", background: "#FCE8E6", borderRadius: "8px",
              textDecoration: "none", fontSize: "13px", fontWeight: 600, color: G.red,
              border: "1px solid rgba(234,67,53,0.2)",
            }}>
              ⏳ {stats.pending} en attente
            </Link>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {cards.map((card) => (
          <div key={card.label} style={{
            background: "#fff", border: "1px solid #DADCE0", borderRadius: "12px",
            padding: "20px 24px", boxShadow: SHADOW, position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: card.color }} />
            <div style={{ width: "36px", height: "36px", background: card.bg, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", marginBottom: "12px" }}>
              {card.icon}
            </div>
            <p style={{ margin: "0 0 6px", fontSize: "12px", color: "#5F6368", textTransform: "uppercase", letterSpacing: "0.7px", fontWeight: 500 }}>
              {card.label}
            </p>
            <p style={{ margin: 0, fontSize: "28px", fontWeight: 700, color: "#202124", letterSpacing: "-0.8px" }}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Health score */}
      {(() => {
        const ratingScore = Math.round((parseFloat(stats.avgRating) / 5) * 40);
        const responseScore = stats.totalReviews > 0 ? Math.round((stats.autoResponded / stats.totalReviews) * 35) : 0;
        const volumeScore = Math.min(stats.totalReviews, 25);
        const health = ratingScore + responseScore + volumeScore;
        const healthColor = health >= 75 ? G.green : health >= 50 ? G.yellow : G.red;
        const healthLabel = health >= 75 ? "Excellente réputation" : health >= 50 ? "Réputation correcte" : "Réputation à améliorer";
        return (
          <div style={{ background: "#fff", border: `1px solid ${healthColor}30`, borderRadius: "12px", padding: "18px 24px", boxShadow: SHADOW, marginBottom: "24px", display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", border: `4px solid ${healthColor}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: "20px", fontWeight: 800, color: healthColor, lineHeight: 1 }}>{health}</span>
              <span style={{ fontSize: "9px", color: healthColor, fontWeight: 600 }}>/100</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#202124", marginBottom: "4px" }}>Score de santé : {healthLabel}</div>
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                {[
                  { label: "Note Google", score: ratingScore, max: 40 },
                  { label: "Taux de réponse", score: responseScore, max: 35 },
                  { label: "Volume d'avis", score: volumeScore, max: 25 },
                ].map(s => (
                  <div key={s.label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: "80px", height: "4px", background: "#F8F9FA", borderRadius: "2px", overflow: "hidden" }}>
                      <div style={{ width: `${Math.round(s.score / s.max * 100)}%`, height: "100%", background: healthColor, borderRadius: "2px" }} />
                    </div>
                    <span style={{ fontSize: "11px", color: "#80868B" }}>{s.label} ({s.score}/{s.max})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* History + evolution row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>

        {/* Monthly bar chart */}
        <div style={{ background: "#fff", border: "1px solid #DADCE0", borderRadius: "12px", padding: "20px 24px", boxShadow: SHADOW }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: "#202124" }}>Avis par mois</h2>
            <span style={{ fontSize: "12px", color: "#80868B" }}>4 derniers mois</span>
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
            {(stats.history as {label:string; count:number}[]).map((h, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                <MiniBar value={h.count} max={maxHistory} color={i === 3 ? G.blue : "#DADCE0"} />
                <span style={{ fontSize: "11px", color: i === 3 ? G.blue : "#80868B", fontWeight: i === 3 ? 700 : 400 }}>{h.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Evolution indicators */}
        <div style={{ background: "#fff", border: "1px solid #DADCE0", borderRadius: "12px", padding: "20px 24px", boxShadow: SHADOW }}>
          <h2 style={{ margin: "0 0 16px", fontSize: "15px", fontWeight: 600, color: "#202124" }}>
            Évolution — {monthName}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

            {/* Volume */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#F8F9FA", borderRadius: "10px" }}>
              <div>
                <div style={{ fontSize: "12px", color: "#5F6368", marginBottom: "2px" }}>Volume d&apos;avis</div>
                <div style={{ fontSize: "20px", fontWeight: 700, color: "#202124" }}>{stats.thisMonthCount}</div>
              </div>
              <div style={{
                padding: "4px 12px", borderRadius: "20px",
                background: evolutionPositive ? "#E6F4EA" : "#FCE8E6",
                color: evolutionPositive ? G.green : G.red,
                fontSize: "13px", fontWeight: 700,
              }}>
                {evolutionPositive ? "+" : ""}{stats.evolutionPct}% vs mois dernier
              </div>
            </div>

            {/* Note moyenne */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#F8F9FA", borderRadius: "10px" }}>
              <div>
                <div style={{ fontSize: "12px", color: "#5F6368", marginBottom: "2px" }}>Note moyenne ce mois</div>
                <div style={{ fontSize: "20px", fontWeight: 700, color: "#202124" }}>
                  {stats.thisMonthAvg} <span style={{ color: G.yellow }}>★</span>
                </div>
              </div>
              <div style={{ fontSize: "12px", color: "#80868B" }}>
                Mois dernier : {stats.lastMonthAvg} ★
              </div>
            </div>

            {/* Avis négatifs */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#F8F9FA", borderRadius: "10px" }}>
              <div>
                <div style={{ fontSize: "12px", color: "#5F6368", marginBottom: "2px" }}>Avis négatifs (1-3★)</div>
                <div style={{ fontSize: "20px", fontWeight: 700, color: negEvolution > 0 ? G.red : G.green }}>
                  {stats.negThisMonth}
                </div>
              </div>
              <div style={{
                padding: "4px 12px", borderRadius: "20px",
                background: negEvolution <= 0 ? "#E6F4EA" : "#FCE8E6",
                color: negEvolution <= 0 ? G.green : G.red,
                fontSize: "13px", fontWeight: 700,
              }}>
                {negEvolution === 0 ? "Stable" : negEvolution > 0 ? `+${negEvolution} ce mois` : `${negEvolution} ce mois`}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent reviews */}
      <div style={{ background: "#fff", border: "1px solid #DADCE0", borderRadius: "12px", overflow: "hidden", boxShadow: SHADOW }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #DADCE0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: "#202124" }}>Avis récents</h2>
          <Link href="/reviews" style={{ fontSize: "13px", color: G.blue, textDecoration: "none", fontWeight: 500 }}>
            Tout voir →
          </Link>
        </div>

        {stats.recentReviews.length === 0 ? (
          <div style={{ padding: "56px 24px", textAlign: "center" }}>
            <p style={{ margin: "0 0 10px", fontSize: "40px" }}>📭</p>
            <p style={{ margin: "0 0 6px", fontSize: "15px", fontWeight: 600, color: "#202124" }}>Aucun avis pour l&apos;instant</p>
            <p style={{ margin: 0, fontSize: "13px", color: "#5F6368" }}>
              Ajoutez un établissement et synchronisez pour commencer.
            </p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F8F9FA" }}>
                {["Auteur", "Note", "Avis", "Établissement", "Date", "Statut"].map((col) => (
                  <th key={col} style={{ padding: "10px 16px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#5F6368", textTransform: "uppercase", letterSpacing: "0.6px", borderBottom: "1px solid #DADCE0" }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.recentReviews.map(({ review, businessName }, i) => (
                <tr key={review.id} style={{ borderBottom: i < stats.recentReviews.length - 1 ? "1px solid #F8F9FA" : "none" }}>
                  <td style={{ padding: "13px 16px", fontSize: "14px", fontWeight: 500, color: "#202124" }}>{review.authorName}</td>
                  <td style={{ padding: "13px 16px" }}><Stars rating={review.rating} /></td>
                  <td style={{ padding: "13px 16px", fontSize: "13px", color: "#5F6368", maxWidth: "240px" }}>
                    <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {review.text || "(sans texte)"}
                    </span>
                  </td>
                  <td style={{ padding: "13px 16px", fontSize: "13px", color: "#5F6368" }}>{businessName || "—"}</td>
                  <td style={{ padding: "13px 16px", fontSize: "12px", color: "#80868B", whiteSpace: "nowrap" }}>
                    {new Date(review.publishedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                  </td>
                  <td style={{ padding: "13px 16px" }}>
                    <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, background: review.responded ? "#E6F4EA" : "#FEF7E0", color: review.responded ? G.green : "#F9AB00" }}>
                      {review.responded ? "✓ Répondu" : "En attente"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Quick actions */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginTop: "16px" }}>
        {[
          { icon: "🏢", label: "Ajouter un établissement", href: "/businesses", color: G.blue, bg: "#E8F0FE" },
          { icon: "⏳", label: `Traiter les ${stats.pending} avis en attente`, href: "/pending", color: G.red, bg: "#FCE8E6" },
          { icon: "📊", label: "Voir tous les avis", href: "/reviews", color: G.green, bg: "#E6F4EA" },
          { icon: "💳", label: "Abonnement & facturation", href: "/dashboard/billing", color: G.blue, bg: "#E8F0FE" },
        ].map(a => (
          <Link key={a.href} href={a.href} style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "14px 18px", background: a.bg, borderRadius: "10px",
            textDecoration: "none", border: `1px solid ${a.color}20`,
            fontSize: "13px", fontWeight: 600, color: a.color,
          }}>
            <span style={{ fontSize: "18px" }}>{a.icon}</span>
            {a.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
