export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { reviews, businesses, pendingResponses } from "@/db/schema";
import { eq, desc, count, avg } from "drizzle-orm";

async function getDashboardStats() {
  const totalReviewsResult = await db
    .select({ count: count() })
    .from(reviews);

  const avgRatingResult = await db
    .select({ avg: avg(reviews.rating) })
    .from(reviews);

  const autoRespondedResult = await db
    .select({ count: count() })
    .from(reviews)
    .where(eq(reviews.responded, true));

  const pendingResult = await db
    .select({ count: count() })
    .from(pendingResponses)
    .where(eq(pendingResponses.status, "pending"));

  const recentReviews = await db
    .select({
      review: reviews,
      businessName: businesses.name,
    })
    .from(reviews)
    .leftJoin(businesses, eq(reviews.businessId, businesses.id))
    .orderBy(desc(reviews.publishedAt))
    .limit(10);

  return {
    totalReviews: totalReviewsResult[0]?.count || 0,
    avgRating: parseFloat(String(avgRatingResult[0]?.avg || "0")).toFixed(1),
    autoResponded: autoRespondedResult[0]?.count || 0,
    pending: pendingResult[0]?.count || 0,
    recentReviews,
  };
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          style={{
            color: i < rating ? "#f59e0b" : "rgba(255,255,255,0.15)",
            fontSize: "13px",
          }}
        >
          ★
        </span>
      ))}
    </span>
  );
}

function PlatformBadge({ platform }: { platform: string }) {
  const isGoogle = platform === "google";
  return (
    <span
      style={{
        padding: "3px 10px",
        borderRadius: "20px",
        fontSize: "11px",
        fontWeight: 600,
        letterSpacing: "0.4px",
        textTransform: "uppercase",
        background: isGoogle
          ? "rgba(66,133,244,0.15)"
          : "rgba(0,179,91,0.15)",
        color: isGoogle ? "#5b9df5" : "#22c55e",
        border: isGoogle
          ? "1px solid rgba(66,133,244,0.3)"
          : "1px solid rgba(0,179,91,0.3)",
      }}
    >
      {platform}
    </span>
  );
}

function StatusBadge({ responded }: { responded: boolean }) {
  return (
    <span
      style={{
        padding: "3px 10px",
        borderRadius: "20px",
        fontSize: "11px",
        fontWeight: 600,
        letterSpacing: "0.4px",
        background: responded
          ? "rgba(34,197,94,0.12)"
          : "rgba(245,158,11,0.12)",
        color: responded ? "#22c55e" : "#f59e0b",
        border: responded
          ? "1px solid rgba(34,197,94,0.25)"
          : "1px solid rgba(245,158,11,0.25)",
      }}
    >
      {responded ? "Responded" : "Pending"}
    </span>
  );
}

export default async function DashboardPage() {
  const stats = await getDashboardStats().catch(() => ({
    totalReviews: 0,
    avgRating: "0.0",
    autoResponded: 0,
    pending: 0,
    recentReviews: [],
  }));

  const statCards = [
    {
      label: "Total Reviews",
      value: stats.totalReviews,
      icon: "📋",
      color: "#6c47ff",
    },
    {
      label: "Average Rating",
      value: `${stats.avgRating} ⭐`,
      icon: "⭐",
      color: "#f59e0b",
    },
    {
      label: "Auto-Responded",
      value: stats.autoResponded,
      icon: "✓",
      color: "#22c55e",
    },
    {
      label: "Pending Manual",
      value: stats.pending,
      icon: "⏳",
      color: "#f87171",
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <h1
          style={{
            margin: "0 0 6px",
            fontSize: "26px",
            fontWeight: 700,
            color: "#f8f8ff",
            letterSpacing: "-0.5px",
          }}
        >
          Dashboard
        </h1>
        <p style={{ margin: 0, color: "rgba(248,248,255,0.45)", fontSize: "14px" }}>
          Overview of your review management activity
        </p>
      </div>

      {/* Stats row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        {statCards.map((card) => (
          <div
            key={card.label}
            style={{
              background: "#111118",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "12px",
              padding: "20px 24px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "2px",
                background: `linear-gradient(90deg, ${card.color}, transparent)`,
              }}
            />
            <p
              style={{
                margin: "0 0 8px",
                fontSize: "12px",
                color: "rgba(248,248,255,0.4)",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                fontWeight: 500,
              }}
            >
              {card.label}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "30px",
                fontWeight: 700,
                color: "#f8f8ff",
                letterSpacing: "-1px",
              }}
            >
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Recent reviews */}
      <div
        style={{
          background: "#111118",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "15px",
              fontWeight: 600,
              color: "#f8f8ff",
            }}
          >
            Recent Reviews
          </h2>
          <a
            href="/reviews"
            style={{
              fontSize: "13px",
              color: "#6c47ff",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            View all →
          </a>
        </div>

        {stats.recentReviews.length === 0 ? (
          <div
            style={{
              padding: "48px 24px",
              textAlign: "center",
              color: "rgba(248,248,255,0.3)",
            }}
          >
            <p style={{ margin: "0 0 8px", fontSize: "32px" }}>📭</p>
            <p style={{ margin: 0, fontSize: "14px" }}>
              No reviews yet. Add a business and sync to get started.
            </p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  background: "rgba(255,255,255,0.02)",
                }}
              >
                {["Author", "Rating", "Review", "Business", "Platform", "Status"].map(
                  (col) => (
                    <th
                      key={col}
                      style={{
                        padding: "10px 16px",
                        textAlign: "left",
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "rgba(248,248,255,0.35)",
                        textTransform: "uppercase",
                        letterSpacing: "0.6px",
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      {col}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {stats.recentReviews.map(({ review, businessName }, i) => (
                <tr
                  key={review.id}
                  style={{
                    borderBottom:
                      i < stats.recentReviews.length - 1
                        ? "1px solid rgba(255,255,255,0.04)"
                        : "none",
                    transition: "background 0.15s",
                  }}
                >
                  <td
                    style={{
                      padding: "14px 16px",
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#f8f8ff",
                    }}
                  >
                    {review.authorName}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <StarDisplay rating={review.rating} />
                  </td>
                  <td
                    style={{
                      padding: "14px 16px",
                      fontSize: "13px",
                      color: "rgba(248,248,255,0.55)",
                      maxWidth: "280px",
                    }}
                  >
                    <span
                      style={{
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {review.text || "(no text)"}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "14px 16px",
                      fontSize: "13px",
                      color: "rgba(248,248,255,0.6)",
                    }}
                  >
                    {businessName || "—"}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <PlatformBadge platform={review.platform} />
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <StatusBadge responded={review.responded} />
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
