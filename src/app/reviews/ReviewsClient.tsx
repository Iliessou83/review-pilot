"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Review } from "@/db/schema";

type ReviewWithBusiness = { review: Review; businessName: string | null };

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          style={{
            color: i < rating ? "#f59e0b" : "rgba(255,255,255,0.12)",
            fontSize: "14px",
          }}
        >
          ★
        </span>
      ))}
    </span>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "6px 14px",
        borderRadius: "6px",
        fontSize: "13px",
        fontWeight: active ? 600 : 400,
        color: active ? "#f8f8ff" : "rgba(248,248,255,0.45)",
        background: active ? "rgba(108,71,255,0.2)" : "transparent",
        border: active
          ? "1px solid rgba(108,71,255,0.35)"
          : "1px solid rgba(255,255,255,0.08)",
        cursor: "pointer",
        transition: "all 0.15s",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

export default function ReviewsClient({
  reviews,
  filters,
}: {
  reviews: ReviewWithBusiness[];
  filters: { platform: string; responded: string; rating: string };
}) {
  const router = useRouter();

  function setFilter(key: string, value: string) {
    const params = new URLSearchParams();
    const current = { ...filters, [key]: value };
    if (current.platform !== "all") params.set("platform", current.platform);
    if (current.responded !== "all") params.set("responded", current.responded);
    if (current.rating !== "all") params.set("rating", current.rating);
    router.push(`/reviews?${params.toString()}`);
  }

  const ratingFilters = [
    { value: "all", label: "All Ratings" },
    { value: "5", label: "★★★★★" },
    { value: "4", label: "★★★★" },
    { value: "3", label: "★★★" },
    { value: "2", label: "★★" },
    { value: "1", label: "★" },
  ];

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h1
          style={{
            margin: "0 0 6px",
            fontSize: "26px",
            fontWeight: 700,
            color: "#f8f8ff",
            letterSpacing: "-0.5px",
          }}
        >
          Reviews
        </h1>
        <p
          style={{
            margin: 0,
            color: "rgba(248,248,255,0.45)",
            fontSize: "14px",
          }}
        >
          {reviews.length} review{reviews.length !== 1 ? "s" : ""} matching
          filters
        </p>
      </div>

      {/* Filter bar */}
      <div
        style={{
          background: "#111118",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "10px",
          padding: "16px 20px",
          marginBottom: "20px",
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: "12px",
            color: "rgba(248,248,255,0.3)",
            textTransform: "uppercase",
            letterSpacing: "0.6px",
            marginRight: "4px",
          }}
        >
          Platform:
        </span>
        {["all", "google", "trustpilot"].map((p) => (
          <FilterButton
            key={p}
            active={filters.platform === p}
            onClick={() => setFilter("platform", p)}
          >
            {p === "all" ? "All" : p.charAt(0).toUpperCase() + p.slice(1)}
          </FilterButton>
        ))}

        <div
          style={{
            width: "1px",
            height: "24px",
            background: "rgba(255,255,255,0.08)",
            margin: "0 4px",
          }}
        />

        <span
          style={{
            fontSize: "12px",
            color: "rgba(248,248,255,0.3)",
            textTransform: "uppercase",
            letterSpacing: "0.6px",
            marginRight: "4px",
          }}
        >
          Status:
        </span>
        {[
          { value: "all", label: "All" },
          { value: "true", label: "Responded" },
          { value: "false", label: "Not responded" },
        ].map((s) => (
          <FilterButton
            key={s.value}
            active={filters.responded === s.value}
            onClick={() => setFilter("responded", s.value)}
          >
            {s.label}
          </FilterButton>
        ))}

        <div
          style={{
            width: "1px",
            height: "24px",
            background: "rgba(255,255,255,0.08)",
            margin: "0 4px",
          }}
        />

        <span
          style={{
            fontSize: "12px",
            color: "rgba(248,248,255,0.3)",
            textTransform: "uppercase",
            letterSpacing: "0.6px",
            marginRight: "4px",
          }}
        >
          Rating:
        </span>
        {ratingFilters.map((r) => (
          <FilterButton
            key={r.value}
            active={filters.rating === r.value}
            onClick={() => setFilter("rating", r.value)}
          >
            {r.label}
          </FilterButton>
        ))}
      </div>

      {/* Table */}
      <div
        style={{
          background: "#111118",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        {reviews.length === 0 ? (
          <div
            style={{
              padding: "64px 24px",
              textAlign: "center",
              color: "rgba(248,248,255,0.3)",
            }}
          >
            <p style={{ margin: "0 0 8px", fontSize: "36px" }}>🔍</p>
            <p style={{ margin: 0, fontSize: "14px" }}>
              No reviews match the selected filters.
            </p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                {[
                  "Author",
                  "Rating",
                  "Review",
                  "Business",
                  "Date",
                  "Platform",
                  "Status",
                ].map((col) => (
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
                ))}
              </tr>
            </thead>
            <tbody>
              {reviews.map(({ review, businessName }, i) => (
                <tr
                  key={review.id}
                  style={{
                    borderBottom:
                      i < reviews.length - 1
                        ? "1px solid rgba(255,255,255,0.04)"
                        : "none",
                  }}
                >
                  <td
                    style={{
                      padding: "14px 16px",
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#f8f8ff",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {review.authorName}
                  </td>
                  <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
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
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {review.text || "(no text)"}
                    </span>
                    {review.responseText && (
                      <div
                        style={{
                          marginTop: "6px",
                          padding: "6px 10px",
                          background: "rgba(34,197,94,0.08)",
                          borderLeft: "2px solid #22c55e",
                          borderRadius: "0 4px 4px 0",
                          fontSize: "12px",
                          color: "rgba(34,197,94,0.8)",
                        }}
                      >
                        <span
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          Reply: {review.responseText}
                        </span>
                      </div>
                    )}
                  </td>
                  <td
                    style={{
                      padding: "14px 16px",
                      fontSize: "13px",
                      color: "rgba(248,248,255,0.55)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {businessName || "—"}
                  </td>
                  <td
                    style={{
                      padding: "14px 16px",
                      fontSize: "12px",
                      color: "rgba(248,248,255,0.35)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {new Date(review.publishedAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: "20px",
                        fontSize: "11px",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.4px",
                        background:
                          review.platform === "google"
                            ? "rgba(66,133,244,0.15)"
                            : "rgba(0,179,91,0.15)",
                        color:
                          review.platform === "google" ? "#5b9df5" : "#22c55e",
                        border:
                          review.platform === "google"
                            ? "1px solid rgba(66,133,244,0.3)"
                            : "1px solid rgba(0,179,91,0.3)",
                      }}
                    >
                      {review.platform}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: "20px",
                        fontSize: "11px",
                        fontWeight: 600,
                        background: review.responded
                          ? "rgba(34,197,94,0.12)"
                          : "rgba(245,158,11,0.12)",
                        color: review.responded ? "#22c55e" : "#f59e0b",
                        border: review.responded
                          ? "1px solid rgba(34,197,94,0.25)"
                          : "1px solid rgba(245,158,11,0.25)",
                      }}
                    >
                      {review.responded ? "Responded" : "Pending"}
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
