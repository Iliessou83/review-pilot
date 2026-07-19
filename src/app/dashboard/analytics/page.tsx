export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { reviews, businesses, pendingResponses } from "@/db/schema";
import { eq, gte, lt, and, count, avg, sql, inArray, type SQL } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getScope, ownedBusinessIds } from "@/lib/scope";
import { platformMeta } from "@/lib/platforms";

const G = { blue: "#1A73E8", red: "#EA4335", yellow: "#FBBC04", green: "#34A853" };
const SHADOW = "0 1px 3px rgba(60,64,67,0.12), 0 1px 2px rgba(60,64,67,0.06)";

async function getAnalytics(biz: SQL | undefined) {
  const now = new Date();
  const months: { label: string; start: Date; end: Date }[] = [];
  const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];

  for (let i = 11; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    months.push({ label: monthNames[start.getMonth()], start, end });
  }

  const [ratingDist, perBusiness, totalReviews, totalResponded, pendingCount] = await Promise.all([
    db.select({ rating: reviews.rating, count: count() }).from(reviews).where(biz).groupBy(reviews.rating),
    db.select({
      businessId: reviews.businessId,
      businessName: businesses.name,
      platform: businesses.platform,
      total: count(),
      responded: sql<string>`SUM(CASE WHEN ${reviews.responded} THEN 1 ELSE 0 END)::bigint`,
      avgRating: avg(reviews.rating),
    }).from(reviews).leftJoin(businesses, eq(reviews.businessId, businesses.id)).where(biz).groupBy(reviews.businessId, businesses.name, businesses.platform),
    db.select({ count: count() }).from(reviews).where(biz),
    db.select({ count: count() }).from(reviews).where(and(eq(reviews.responded, true), biz)),
    db.select({ count: count() }).from(pendingResponses)
      .innerJoin(reviews, eq(pendingResponses.reviewId, reviews.id))
      .where(and(eq(pendingResponses.status, "pending"), biz)),
  ]);

  const monthlyData = await Promise.all(
    months.map(async (m) => {
      const [res] = await db
        .select({
          total: count(),
          avgRating: avg(reviews.rating),
          responded: sql<string>`SUM(CASE WHEN ${reviews.responded} THEN 1 ELSE 0 END)::bigint`,
          negative: sql<string>`SUM(CASE WHEN ${reviews.rating} <= 3 THEN 1 ELSE 0 END)::bigint`,
        })
        .from(reviews)
        .where(and(gte(reviews.publishedAt, m.start), lt(reviews.publishedAt, m.end), biz));
      return {
        label: m.label,
        total: res?.total || 0,
        avgRating: parseFloat(String(res?.avgRating || "0")),
        responded: parseInt(String(res?.responded)) || 0,
        negative: parseInt(String(res?.negative)) || 0,
      };
    })
  );

  const ratingMap: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of ratingDist) ratingMap[r.rating] = r.count;

  return {
    monthly: monthlyData,
    ratingDistribution: [1, 2, 3, 4, 5].map(r => ({ rating: r, count: ratingMap[r] || 0 })),
    perBusiness: perBusiness.map(b => ({
      businessId: b.businessId,
      name: b.businessName || "Inconnu",
      platform: b.platform || "google",
      total: b.total,
      responded: parseInt(String(b.responded)) || 0,
      responseRate: b.total > 0 ? Math.round((parseInt(String(b.responded)) / b.total) * 100) : 0,
      avgRating: parseFloat(String(b.avgRating || "0")).toFixed(1),
    })),
    totalReviews: totalReviews[0]?.count || 0,
    totalResponded: totalResponded[0]?.count || 0,
    pendingCount: pendingCount[0]?.count || 0,
  };
}

function MiniSparkline({ data, color, height = 48 }: { data: number[]; color: string; height?: number }) {
  const max = Math.max(...data, 1);
  const w = 100 / data.length;
  const points = data
    .map((v, i) => `${i * w + w / 2},${height - (v / max) * (height - 4)}`)
    .join(" ");

  return (
    <svg width="100%" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {data.map((v, i) => (
        <circle
          key={i}
          cx={i * w + w / 2}
          cy={height - (v / max) * (height - 4)}
          r={i === data.length - 1 ? "3" : "1.5"}
          fill={color}
        />
      ))}
    </svg>
  );
}

function BarChart({ data, maxVal, color }: { data: { label: string; value: number }[]; maxVal: number; color: string }) {
  return (
    <div style={{ display: "flex", gap: "8px", alignItems: "flex-end", height: "120px" }}>
      {data.map((d, i) => {
        const pct = maxVal > 0 ? (d.value / maxVal) * 100 : 0;
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
            <span style={{ fontSize: "10px", fontWeight: 600, color: "#202124" }}>{d.value > 0 ? d.value : ""}</span>
            <div style={{ width: "100%", height: "90px", background: "#F8F9FA", borderRadius: "6px 6px 0 0", display: "flex", alignItems: "flex-end", overflow: "hidden" }}>
              <div style={{ width: "100%", height: `${Math.max(pct, d.value > 0 ? 4 : 0)}%`, background: color, borderRadius: "4px 4px 0 0", transition: "height 0.4s ease" }} />
            </div>
            <span style={{ fontSize: "10px", color: "#80868B" }}>{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function RatingBar({ rating, count, total }: { rating: number; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const starColors = ["#EA4335", "#F9AB00", "#FBBC04", "#34A853", "#1A73E8"];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <span style={{ fontSize: "12px", color: "#5F6368", width: "24px", textAlign: "right" }}>{rating}★</span>
      <div style={{ flex: 1, height: "8px", background: "#F8F9FA", borderRadius: "4px", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: starColors[rating - 1], borderRadius: "4px", transition: "width 0.4s ease" }} />
      </div>
      <span style={{ fontSize: "12px", color: "#80868B", width: "36px" }}>{count}</span>
    </div>
  );
}

export default async function AnalyticsPage() {
  const scope = await getScope();
  if (!scope) redirect("/");

  // Cloisonnement : super-admin = tout ; client = seulement SES commerces
  // (aucun commerce rattaché = vue vide, jamais les chiffres d'un autre).
  const owned = await ownedBusinessIds(scope);
  const empty = {
    monthly: [],
    ratingDistribution: [],
    perBusiness: [],
    totalReviews: 0,
    totalResponded: 0,
    pendingCount: 0,
  };
  const biz =
    owned === "all"
      ? undefined
      : owned.length
        ? inArray(reviews.businessId, owned)
        : null;
  const data = biz === null ? empty : await getAnalytics(biz).catch(() => empty);

  const maxMonthly = Math.max(...data.monthly.map(m => m.total), 1);
  const responseRate = data.totalReviews > 0 ? Math.round((data.totalResponded / data.totalReviews) * 100) : 0;
  const totalNegative = data.monthly.reduce((s, m) => s + m.negative, 0);
  const totalRating = data.ratingDistribution.reduce((s, r) => s + r.count, 0);

  const lastMonthIdx = data.monthly.length - 1;
  const prevMonthIdx = data.monthly.length - 2;
  const volumeTrend = prevMonthIdx >= 0 && data.monthly[prevMonthIdx].total > 0
    ? Math.round(((data.monthly[lastMonthIdx].total - data.monthly[prevMonthIdx].total) / data.monthly[prevMonthIdx].total) * 100)
    : 0;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ margin: "0 0 4px", fontSize: "24px", fontWeight: 700, color: "#202124", letterSpacing: "-0.5px" }}>
            Analytics
          </h1>
          <p style={{ margin: 0, color: "#5F6368", fontSize: "14px" }}>Analyse de votre réputation sur 12 mois</p>
        </div>
        <Link href="/dashboard" style={{ padding: "8px 16px", background: "#fff", border: "1px solid #DADCE0", borderRadius: "8px", textDecoration: "none", fontSize: "13px", color: "#5F6368", boxShadow: SHADOW }}>
          ← Dashboard
        </Link>
      </div>

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "14px", marginBottom: "24px" }}>
        {[
          { label: "Total avis (12 mois)", value: data.totalReviews, color: G.blue, bg: "#E8F0FE", trend: `${volumeTrend >= 0 ? "+" : ""}${volumeTrend}% vs mois préc.` },
          { label: "Taux de réponse", value: `${responseRate}%`, color: responseRate >= 80 ? G.green : G.yellow, bg: responseRate >= 80 ? "#E6F4EA" : "#FEF7E0", trend: responseRate >= 80 ? "Excellent" : "À améliorer" },
          { label: "Avis négatifs", value: totalNegative, color: G.red, bg: "#FCE8E6", trend: `1-3★ sur 12 mois` },
          { label: "En attente action", value: data.pendingCount, color: data.pendingCount > 0 ? G.red : G.green, bg: data.pendingCount > 0 ? "#FCE8E6" : "#E6F4EA", trend: data.pendingCount > 0 ? "Réponse requise" : "Tout traité ✓" },
        ].map(card => (
          <div key={card.label} style={{ background: "#fff", border: "1px solid #DADCE0", borderRadius: "12px", padding: "18px 20px", boxShadow: SHADOW, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: card.color }} />
            <div style={{ width: "32px", height: "32px", background: card.bg, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "10px" }}>
              <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: card.color }} />
            </div>
            <p style={{ margin: "0 0 4px", fontSize: "11px", color: "#5F6368", textTransform: "uppercase", letterSpacing: "0.7px", fontWeight: 500 }}>{card.label}</p>
            <p style={{ margin: "0 0 6px", fontSize: "26px", fontWeight: 700, color: "#202124", letterSpacing: "-0.8px" }}>{card.value}</p>
            <p style={{ margin: 0, fontSize: "11px", color: card.color, fontWeight: 500 }}>{card.trend}</p>
          </div>
        ))}
      </div>

      {/* Volume chart + Rating distribution */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "24px" }}>

        {/* Volume 12 mois */}
        <div style={{ background: "#fff", border: "1px solid #DADCE0", borderRadius: "12px", padding: "20px 24px", boxShadow: SHADOW }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <h2 style={{ margin: "0 0 2px", fontSize: "15px", fontWeight: 600, color: "#202124" }}>Volume d&apos;avis</h2>
              <p style={{ margin: 0, fontSize: "12px", color: "#80868B" }}>12 derniers mois</p>
            </div>
            <div style={{ display: "flex", gap: "12px", fontSize: "11px", color: "#80868B" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: G.blue }} />
                Total avis
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: G.red }} />
                Avis négatifs
              </span>
            </div>
          </div>
          <BarChart
            data={data.monthly.map(m => ({ label: m.label, value: m.total }))}
            maxVal={maxMonthly}
            color={G.blue}
          />
          {/* Negative overlay line */}
          <div style={{ marginTop: "8px" }}>
            <MiniSparkline data={data.monthly.map(m => m.negative)} color={G.red} height={32} />
          </div>
        </div>

        {/* Rating distribution */}
        <div style={{ background: "#fff", border: "1px solid #DADCE0", borderRadius: "12px", padding: "20px 24px", boxShadow: SHADOW }}>
          <h2 style={{ margin: "0 0 16px", fontSize: "15px", fontWeight: 600, color: "#202124" }}>Distribution des notes</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[5, 4, 3, 2, 1].map(r => {
              const item = data.ratingDistribution.find(d => d.rating === r);
              return <RatingBar key={r} rating={r} count={item?.count || 0} total={totalRating} />;
            })}
          </div>
          <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid #F8F9FA", display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: "12px", color: "#5F6368" }}>Total avis analysés</span>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#202124" }}>{totalRating}</span>
          </div>
        </div>
      </div>

      {/* Note moyenne sur 12 mois (sparkline) */}
      <div style={{ background: "#fff", border: "1px solid #DADCE0", borderRadius: "12px", padding: "20px 24px", boxShadow: SHADOW, marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h2 style={{ margin: "0 0 2px", fontSize: "15px", fontWeight: 600, color: "#202124" }}>Évolution de la note moyenne</h2>
            <p style={{ margin: 0, fontSize: "12px", color: "#80868B" }}>Sur 12 mois</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "22px", fontWeight: 700, color: G.yellow }}>
              {data.monthly[lastMonthIdx]?.avgRating > 0 ? data.monthly[lastMonthIdx].avgRating.toFixed(1) : "—"} ★
            </div>
            <div style={{ fontSize: "11px", color: "#80868B" }}>Ce mois</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0", alignItems: "flex-end" }}>
          {data.monthly.map((m, i) => {
            const isLast = i === data.monthly.length - 1;
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                <div style={{
                  width: "6px", height: "6px", borderRadius: "50%",
                  background: isLast ? G.yellow : `${G.yellow}60`,
                  border: isLast ? `2px solid ${G.yellow}` : "none",
                  marginBottom: "2px",
                }} />
                {m.avgRating > 0 && (
                  <span style={{ fontSize: "9px", color: isLast ? G.yellow : "#DADCE0", fontWeight: 600 }}>
                    {m.avgRating.toFixed(1)}
                  </span>
                )}
                <span style={{ fontSize: "9px", color: isLast ? "#5F6368" : "#DADCE0" }}>{m.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Par établissement */}
      {data.perBusiness.length > 0 && (
        <div style={{ background: "#fff", border: "1px solid #DADCE0", borderRadius: "12px", overflow: "hidden", boxShadow: SHADOW }}>
          <div style={{ padding: "18px 24px", borderBottom: "1px solid #DADCE0" }}>
            <h2 style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: "#202124" }}>Performance par établissement</h2>
          </div>
          <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", minWidth: "680px", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F8F9FA" }}>
                {["Établissement", "Plateforme", "Total avis", "Répondu", "Taux réponse", "Note moyenne"].map(col => (
                  <th key={col} style={{ padding: "10px 16px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#5F6368", textTransform: "uppercase", letterSpacing: "0.6px", borderBottom: "1px solid #DADCE0" }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.perBusiness.map((b, i) => (
                <tr key={b.businessId} style={{ borderBottom: i < data.perBusiness.length - 1 ? "1px solid #F8F9FA" : "none" }}>
                  <td style={{ padding: "13px 16px", fontSize: "14px", fontWeight: 600, color: "#202124" }}>{b.name}</td>
                  <td style={{ padding: "13px 16px" }}>
                    <span style={{ padding: "2px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: 600, background: platformMeta(b.platform).bg, color: platformMeta(b.platform).color }}>
                      {platformMeta(b.platform).label}
                    </span>
                  </td>
                  <td style={{ padding: "13px 16px", fontSize: "14px", color: "#202124" }}>{b.total}</td>
                  <td style={{ padding: "13px 16px", fontSize: "14px", color: "#202124" }}>{b.responded}</td>
                  <td style={{ padding: "13px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "60px", height: "6px", background: "#F8F9FA", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ width: `${b.responseRate}%`, height: "100%", background: b.responseRate >= 80 ? G.green : b.responseRate >= 50 ? G.yellow : G.red, borderRadius: "3px" }} />
                      </div>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: b.responseRate >= 80 ? G.green : b.responseRate >= 50 ? G.yellow : G.red }}>
                        {b.responseRate}%
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "13px 16px", fontSize: "14px", fontWeight: 700, color: G.yellow }}>
                    {parseFloat(b.avgRating) > 0 ? `${b.avgRating} ★` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {data.perBusiness.length === 0 && (
        <div style={{ background: "#fff", border: "1px solid #DADCE0", borderRadius: "12px", padding: "48px 24px", textAlign: "center", boxShadow: SHADOW }}>
          <p style={{ margin: "0 0 8px", fontSize: "40px" }}>📊</p>
          <p style={{ margin: "0 0 6px", fontSize: "15px", fontWeight: 600, color: "#202124" }}>Aucune donnée disponible</p>
          <p style={{ margin: "0 0 16px", fontSize: "13px", color: "#5F6368" }}>Ajoutez un établissement et synchronisez pour voir vos analytics.</p>
          <Link href="/businesses" style={{ padding: "10px 20px", background: G.blue, color: "#fff", textDecoration: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600 }}>
            Ajouter un établissement →
          </Link>
        </div>
      )}
    </div>
  );
}
