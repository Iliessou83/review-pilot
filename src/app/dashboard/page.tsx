export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { reviews, businesses, pendingResponses } from "@/db/schema";
import { eq, desc, count, avg } from "drizzle-orm";

const G = { blue: "#1A73E8", red: "#EA4335", yellow: "#FBBC04", green: "#34A853" };
const SHADOW = "0 1px 3px rgba(60,64,67,0.12), 0 1px 2px rgba(60,64,67,0.06)";

async function getStats() {
  const [totalRes, avgRes, autoRes, pendingRes, recent] = await Promise.all([
    db.select({ count: count() }).from(reviews),
    db.select({ avg: avg(reviews.rating) }).from(reviews),
    db.select({ count: count() }).from(reviews).where(eq(reviews.responded, true)),
    db.select({ count: count() }).from(pendingResponses).where(eq(pendingResponses.status, "pending")),
    db.select({ review: reviews, businessName: businesses.name })
      .from(reviews)
      .leftJoin(businesses, eq(reviews.businessId, businesses.id))
      .orderBy(desc(reviews.publishedAt))
      .limit(10),
  ]);
  return {
    totalReviews: totalRes[0]?.count || 0,
    avgRating: parseFloat(String(avgRes[0]?.avg || "0")).toFixed(1),
    autoResponded: autoRes[0]?.count || 0,
    pending: pendingRes[0]?.count || 0,
    recentReviews: recent,
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

export default async function DashboardPage() {
  const stats = await getStats().catch(() => ({
    totalReviews: 0, avgRating: "0.0", autoResponded: 0, pending: 0, recentReviews: [],
  }));

  const cards = [
    { label: "Total avis", value: stats.totalReviews, color: G.blue, icon: "📋", bg: "#E8F0FE" },
    { label: "Note moyenne", value: `${stats.avgRating} ★`, color: G.yellow, icon: "⭐", bg: "#FEF7E0" },
    { label: "Répondu auto.", value: stats.autoResponded, color: G.green, icon: "✓", bg: "#E6F4EA" },
    { label: "En attente", value: stats.pending, color: G.red, icon: "⏳", bg: "#FCE8E6" },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ margin: "0 0 4px", fontSize: "24px", fontWeight: 700, color: "#202124", letterSpacing: "-0.5px" }}>
          Tableau de bord
        </h1>
        <p style={{ margin: 0, color: "#5F6368", fontSize: "14px" }}>
          Vue d&apos;ensemble de vos avis Google
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "28px" }}>
        {cards.map((card) => (
          <div key={card.label} style={{
            background: "#fff",
            border: "1px solid #DADCE0",
            borderRadius: "12px",
            padding: "20px 24px",
            boxShadow: SHADOW,
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: card.color }} />
            <div style={{
              width: "36px", height: "36px",
              background: card.bg, borderRadius: "8px",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "16px", marginBottom: "12px",
            }}>{card.icon}</div>
            <p style={{ margin: "0 0 6px", fontSize: "12px", color: "#5F6368", textTransform: "uppercase", letterSpacing: "0.7px", fontWeight: 500 }}>
              {card.label}
            </p>
            <p style={{ margin: 0, fontSize: "28px", fontWeight: 700, color: "#202124", letterSpacing: "-0.8px" }}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Recent reviews */}
      <div style={{ background: "#fff", border: "1px solid #DADCE0", borderRadius: "12px", overflow: "hidden", boxShadow: SHADOW }}>
        <div style={{
          padding: "18px 24px",
          borderBottom: "1px solid #DADCE0",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <h2 style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: "#202124" }}>Avis récents</h2>
          <a href="/reviews" style={{ fontSize: "13px", color: G.blue, textDecoration: "none", fontWeight: 500 }}>
            Tout voir →
          </a>
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
                {["Auteur", "Note", "Avis", "Établissement", "Plateforme", "Statut"].map((col) => (
                  <th key={col} style={{
                    padding: "10px 16px", textAlign: "left",
                    fontSize: "11px", fontWeight: 600, color: "#5F6368",
                    textTransform: "uppercase", letterSpacing: "0.6px",
                    borderBottom: "1px solid #DADCE0",
                  }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.recentReviews.map(({ review, businessName }, i) => (
                <tr key={review.id} style={{ borderBottom: i < stats.recentReviews.length - 1 ? "1px solid #F8F9FA" : "none" }}>
                  <td style={{ padding: "13px 16px", fontSize: "14px", fontWeight: 500, color: "#202124" }}>
                    {review.authorName}
                  </td>
                  <td style={{ padding: "13px 16px" }}>
                    <Stars rating={review.rating} />
                  </td>
                  <td style={{ padding: "13px 16px", fontSize: "13px", color: "#5F6368", maxWidth: "260px" }}>
                    <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {review.text || "(sans texte)"}
                    </span>
                  </td>
                  <td style={{ padding: "13px 16px", fontSize: "13px", color: "#5F6368" }}>
                    {businessName || "—"}
                  </td>
                  <td style={{ padding: "13px 16px" }}>
                    <span style={{
                      padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600,
                      background: review.platform === "google" ? "#E8F0FE" : "#E6F4EA",
                      color: review.platform === "google" ? G.blue : G.green,
                    }}>
                      {review.platform === "google" ? "Google" : "Trustpilot"}
                    </span>
                  </td>
                  <td style={{ padding: "13px 16px" }}>
                    <span style={{
                      padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600,
                      background: review.responded ? "#E6F4EA" : "#FEF7E0",
                      color: review.responded ? G.green : "#F9AB00",
                    }}>
                      {review.responded ? "Répondu" : "En attente"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
