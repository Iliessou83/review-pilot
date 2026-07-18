"use client";

import { useRouter } from "next/navigation";
import type { Review } from "@/db/schema";

const G = { blue: "#1A73E8", red: "#EA4335", yellow: "#FBBC04", green: "#34A853" };
const SHADOW = "0 1px 3px rgba(60,64,67,0.12), 0 1px 2px rgba(60,64,67,0.06)";

type ReviewWithBusiness = { review: Review; businessName: string | null };

function Stars({ rating }: { rating: number }) {
  return (
    <span>
      {[1,2,3,4,5].map((i) => (
        <span key={i} style={{ color: i <= rating ? G.yellow : "#DADCE0", fontSize: "14px" }}>★</span>
      ))}
    </span>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "6px 14px", borderRadius: "20px",
        fontSize: "13px", fontWeight: active ? 600 : 400,
        color: active ? G.blue : "#5F6368",
        background: active ? "#E8F0FE" : "transparent",
        border: active ? `1px solid ${G.blue}30` : "1px solid #DADCE0",
        cursor: "pointer", transition: "all 0.15s",
        whiteSpace: "nowrap", fontFamily: "inherit",
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

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ margin: "0 0 4px", fontSize: "24px", fontWeight: 700, color: "#202124", letterSpacing: "-0.5px" }}>
          Avis
        </h1>
        <p style={{ margin: 0, color: "#5F6368", fontSize: "14px" }}>
          {reviews.length} avis correspondant aux filtres
        </p>
      </div>

      {/* Filters */}
      <div style={{
        background: "#fff", border: "1px solid #DADCE0",
        borderRadius: "12px", padding: "14px 20px",
        marginBottom: "16px", display: "flex",
        flexWrap: "wrap", gap: "8px", alignItems: "center",
        boxShadow: SHADOW,
      }}>
        <span style={{ fontSize: "12px", color: "#5F6368", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginRight: "4px" }}>
          Plateforme
        </span>
        {[
          { value: "all", label: "Toutes" },
          { value: "google", label: "Google" },
          { value: "trustpilot", label: "Trustpilot" },
        ].map((p) => (
          <Chip key={p.value} active={filters.platform === p.value} onClick={() => setFilter("platform", p.value)}>
            {p.label}
          </Chip>
        ))}

        <div style={{ width: "1px", height: "20px", background: "#DADCE0", margin: "0 4px" }} />

        <span style={{ fontSize: "12px", color: "#5F6368", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginRight: "4px" }}>
          Statut
        </span>
        {[
          { value: "all", label: "Tous" },
          { value: "true", label: "Répondu" },
          { value: "false", label: "Sans réponse" },
        ].map((s) => (
          <Chip key={s.value} active={filters.responded === s.value} onClick={() => setFilter("responded", s.value)}>
            {s.label}
          </Chip>
        ))}

        <div style={{ width: "1px", height: "20px", background: "#DADCE0", margin: "0 4px" }} />

        <span style={{ fontSize: "12px", color: "#5F6368", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginRight: "4px" }}>
          Note
        </span>
        {[
          { value: "all", label: "Toutes" },
          { value: "5", label: "★★★★★" },
          { value: "4", label: "★★★★" },
          { value: "3", label: "★★★" },
          { value: "2", label: "★★" },
          { value: "1", label: "★" },
        ].map((r) => (
          <Chip key={r.value} active={filters.rating === r.value} onClick={() => setFilter("rating", r.value)}>
            {r.label}
          </Chip>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid #DADCE0", borderRadius: "12px", overflow: "hidden", boxShadow: SHADOW }}>
        {reviews.length === 0 ? (
          <div style={{ padding: "64px 24px", textAlign: "center" }}>
            <p style={{ margin: "0 0 8px", fontSize: "36px" }}>🔍</p>
            <p style={{ margin: 0, fontSize: "14px", color: "#5F6368" }}>
              Aucun avis ne correspond aux filtres sélectionnés.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", minWidth: "760px", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F8F9FA" }}>
                {["Auteur", "Note", "Contenu", "Établissement", "Date", "Plateforme", "Statut"].map((col) => (
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
              {reviews.map(({ review, businessName }, i) => (
                <tr key={review.id} style={{ borderBottom: i < reviews.length - 1 ? "1px solid #F8F9FA" : "none" }}>
                  <td style={{ padding: "13px 16px", fontSize: "14px", fontWeight: 500, color: "#202124", whiteSpace: "nowrap" }}>
                    {review.authorName}
                  </td>
                  <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                    <Stars rating={review.rating} />
                  </td>
                  <td style={{ padding: "13px 16px", fontSize: "13px", color: "#5F6368", maxWidth: "260px" }}>
                    <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {review.text || "(sans texte)"}
                    </span>
                    {review.responseText && (
                      <div style={{
                        marginTop: "6px", padding: "5px 10px",
                        background: "#E6F4EA",
                        borderLeft: `2px solid ${G.green}`,
                        borderRadius: "0 4px 4px 0",
                        fontSize: "12px", color: G.green,
                      }}>
                        <span style={{ display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          Réponse : {review.responseText}
                        </span>
                      </div>
                    )}
                  </td>
                  <td style={{ padding: "13px 16px", fontSize: "13px", color: "#5F6368", whiteSpace: "nowrap" }}>
                    {businessName || "—"}
                  </td>
                  <td style={{ padding: "13px 16px", fontSize: "12px", color: "#80868B", whiteSpace: "nowrap" }}>
                    {new Date(review.publishedAt).toLocaleDateString("fr-FR", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </td>
                  <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                    <span style={{
                      padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600,
                      background: review.platform === "google" ? "#E8F0FE" : "#E6F4EA",
                      color: review.platform === "google" ? G.blue : G.green,
                    }}>
                      {review.platform === "google" ? "Google" : "Trustpilot"}
                    </span>
                  </td>
                  <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
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
          </div>
        )}
      </div>
    </div>
  );
}
