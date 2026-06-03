"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Review, PendingResponse } from "@/db/schema";
import { TONE_LABELS } from "@/lib/claude";

type PendingItem = {
  pending: PendingResponse;
  review: Review;
  businessName: string | null;
};

function StarDisplay({ rating }: { rating: number }) {
  const colors = ["#ef4444", "#f97316", "#f59e0b", "#84cc16", "#22c55e"];
  return (
    <span>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ color: i < rating ? colors[rating - 1] : "rgba(255,255,255,0.12)", fontSize: "16px" }}>
          ★
        </span>
      ))}
    </span>
  );
}

function RatingBadge({ rating }: { rating: number }) {
  const config =
    rating <= 2
      ? { label: "CRISE", color: "#ef4444", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.3)" }
      : rating === 3
      ? { label: "RÉCUPÉRATION", color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)" }
      : { label: "FIDÉLISATION", color: "#22c55e", bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.3)" };

  return (
    <span
      style={{
        padding: "2px 8px",
        borderRadius: "4px",
        fontSize: "10px",
        fontWeight: 700,
        letterSpacing: "0.8px",
        background: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
      }}
    >
      {config.label}
    </span>
  );
}

function PendingCard({ item }: { item: PendingItem }) {
  const router = useRouter();
  const [selected, setSelected] = useState<number | null>(null);
  const [custom, setCustom] = useState("");
  const [posting, setPosting] = useState(false);
  const [posted, setPosted] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const suggestions = (item.pending.suggestions as string[]) || [];

  const activeText = selected !== null ? suggestions[selected] : custom.trim();

  async function handlePost() {
    if (!activeText) {
      alert("Sélectionne une suggestion ou écris une réponse personnalisée.");
      return;
    }

    setPosting(true);
    try {
      await fetch(`/api/reviews/${item.review.id}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responseText: activeText }),
      });

      setPosted(true);
      setTimeout(() => router.refresh(), 1200);
    } catch (err) {
      console.error(err);
      alert("Échec de l'envoi. Réessaie.");
    } finally {
      setPosting(false);
    }
  }

  if (posted) {
    return (
      <div
        style={{
          background: "rgba(34,197,94,0.06)",
          border: "1px solid rgba(34,197,94,0.2)",
          borderRadius: "12px",
          padding: "28px 24px",
          textAlign: "center",
        }}
      >
        <p style={{ margin: "0 0 6px", fontSize: "28px" }}>✓</p>
        <p style={{ margin: 0, color: "#22c55e", fontSize: "15px", fontWeight: 600 }}>
          Réponse publiée avec succès
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "#111118",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "14px",
        overflow: "hidden",
      }}
    >
      {/* Review header */}
      <div
        style={{
          padding: "20px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(255,255,255,0.015)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "15px", fontWeight: 700, color: "#f8f8ff" }}>
                {item.review.authorName}
              </span>
              <span
                style={{
                  padding: "2px 8px",
                  borderRadius: "20px",
                  fontSize: "11px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.4px",
                  background: item.review.platform === "google" ? "rgba(66,133,244,0.15)" : "rgba(0,179,91,0.15)",
                  color: item.review.platform === "google" ? "#5b9df5" : "#22c55e",
                }}
              >
                {item.review.platform}
              </span>
              {item.businessName && (
                <span style={{ fontSize: "12px", color: "rgba(248,248,255,0.35)" }}>
                  {item.businessName}
                </span>
              )}
              <RatingBadge rating={item.review.rating} />
            </div>
            <StarDisplay rating={item.review.rating} />
          </div>
          <span style={{ fontSize: "12px", color: "rgba(248,248,255,0.3)", whiteSpace: "nowrap" }}>
            {new Date(item.review.publishedAt).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>

        <p
          style={{
            margin: 0,
            fontSize: "14px",
            color: "rgba(248,248,255,0.75)",
            lineHeight: 1.65,
            fontStyle: "italic",
            borderLeft: "2px solid rgba(255,255,255,0.1)",
            paddingLeft: "12px",
          }}
        >
          &ldquo;{item.review.text}&rdquo;
        </p>
      </div>

      {/* Suggestions */}
      <div style={{ padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
          <p
            style={{
              margin: 0,
              fontSize: "11px",
              fontWeight: 700,
              color: "rgba(248,248,255,0.35)",
              textTransform: "uppercase",
              letterSpacing: "0.9px",
            }}
          >
            3 réponses IA — clique pour sélectionner
          </p>
          <span style={{ fontSize: "11px", color: "rgba(248,248,255,0.2)" }}>
            {selected !== null ? `Sélection: ${TONE_LABELS[selected].key}` : custom ? "Réponse personnalisée" : "Aucune sélection"}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
          {suggestions.map((suggestion, i) => {
            const tone = TONE_LABELS[i];
            const isSelected = selected === i;
            return (
              <button
                key={i}
                onClick={() => {
                  setSelected(isSelected ? null : i);
                  setCustom("");
                  setCharCount(0);
                }}
                style={{
                  padding: "0",
                  background: isSelected ? tone.bg : "rgba(255,255,255,0.02)",
                  border: isSelected ? `1.5px solid ${tone.border}` : "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "10px",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s",
                  overflow: "hidden",
                }}
              >
                {/* Tone label bar */}
                <div
                  style={{
                    padding: "7px 14px",
                    borderBottom: isSelected ? `1px solid ${tone.border}` : "1px solid rgba(255,255,255,0.04)",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: isSelected ? `rgba(${tone.color.replace('#','')},0.05)` : "transparent",
                  }}
                >
                  <span style={{ fontSize: "13px" }}>{tone.icon}</span>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      letterSpacing: "0.8px",
                      color: isSelected ? tone.color : "rgba(248,248,255,0.35)",
                    }}
                  >
                    {tone.key}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "rgba(248,248,255,0.25)",
                      fontWeight: 400,
                    }}
                  >
                    — {tone.desc}
                  </span>
                  {isSelected && (
                    <span
                      style={{
                        marginLeft: "auto",
                        width: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        background: tone.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        fontSize: "9px",
                        color: "#fff",
                        fontWeight: 700,
                      }}
                    >
                      ✓
                    </span>
                  )}
                </div>

                {/* Suggestion text */}
                <p
                  style={{
                    margin: 0,
                    padding: "12px 14px",
                    fontSize: "13px",
                    color: isSelected ? "#f8f8ff" : "rgba(248,248,255,0.6)",
                    lineHeight: 1.6,
                  }}
                >
                  {suggestion}
                </p>

                {/* Word count */}
                <div style={{ padding: "4px 14px 8px", display: "flex", justifyContent: "flex-end" }}>
                  <span style={{ fontSize: "10px", color: "rgba(248,248,255,0.2)" }}>
                    {suggestion.split(" ").length} mots
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Custom response */}
        <div style={{ marginBottom: "18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <p style={{ margin: 0, fontSize: "11px", fontWeight: 700, color: "rgba(248,248,255,0.3)", textTransform: "uppercase", letterSpacing: "0.6px" }}>
              Ou rédiger une réponse libre
            </p>
            <span style={{ fontSize: "11px", color: charCount > 500 ? "#f87171" : "rgba(248,248,255,0.2)" }}>
              {charCount}/500
            </span>
          </div>
          <textarea
            value={custom}
            onChange={(e) => {
              setCustom(e.target.value);
              setCharCount(e.target.value.length);
              if (e.target.value) setSelected(null);
            }}
            placeholder="Écris ta réponse personnalisée ici..."
            rows={4}
            style={{
              width: "100%",
              padding: "12px 14px",
              background: custom ? "rgba(108,71,255,0.06)" : "rgba(255,255,255,0.03)",
              border: custom ? "1.5px solid rgba(108,71,255,0.35)" : "1px solid rgba(255,255,255,0.07)",
              borderRadius: "8px",
              color: "#f8f8ff",
              fontSize: "13px",
              resize: "vertical",
              outline: "none",
              fontFamily: "inherit",
              lineHeight: 1.6,
              boxSizing: "border-box",
              transition: "border-color 0.15s",
            }}
          />
        </div>

        {/* Preview + post */}
        {activeText && (
          <div
            style={{
              padding: "14px 16px",
              background: "rgba(108,71,255,0.06)",
              border: "1px solid rgba(108,71,255,0.2)",
              borderRadius: "8px",
              marginBottom: "14px",
            }}
          >
            <p style={{ margin: "0 0 6px", fontSize: "10px", fontWeight: 700, color: "rgba(108,71,255,0.7)", textTransform: "uppercase", letterSpacing: "0.8px" }}>
              Aperçu de la réponse
            </p>
            <p style={{ margin: 0, fontSize: "13px", color: "rgba(248,248,255,0.8)", lineHeight: 1.6 }}>
              {activeText}
            </p>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "12px", color: "rgba(248,248,255,0.25)" }}>
            {activeText ? `${activeText.split(" ").length} mots · Prêt à publier` : "Sélectionne une réponse pour continuer"}
          </span>
          <button
            onClick={handlePost}
            disabled={posting || !activeText}
            style={{
              padding: "10px 28px",
              background: posting || !activeText
                ? "rgba(108,71,255,0.25)"
                : "linear-gradient(135deg, #6c47ff, #9d7dff)",
              border: "none",
              borderRadius: "8px",
              color: posting || !activeText ? "rgba(255,255,255,0.4)" : "#fff",
              fontSize: "14px",
              fontWeight: 600,
              cursor: posting || !activeText ? "not-allowed" : "pointer",
              transition: "all 0.15s",
              letterSpacing: "0.1px",
            }}
          >
            {posting ? "Publication..." : "Publier la réponse"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PendingClient({ items }: { items: PendingItem[] }) {
  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ margin: "0 0 6px", fontSize: "26px", fontWeight: 700, color: "#f8f8ff", letterSpacing: "-0.5px" }}>
          Réponses en attente
        </h1>
        <p style={{ margin: 0, color: "rgba(248,248,255,0.45)", fontSize: "14px" }}>
          {items.length} avis nécessite{items.length !== 1 ? "nt" : ""} votre validation
        </p>
      </div>

      {items.length === 0 ? (
        <div
          style={{
            background: "#111118",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "12px",
            padding: "64px 24px",
            textAlign: "center",
            color: "rgba(248,248,255,0.3)",
          }}
        >
          <p style={{ margin: "0 0 12px", fontSize: "44px" }}>✓</p>
          <p style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: 600, color: "#22c55e" }}>
            Tout est traité.
          </p>
          <p style={{ margin: 0, fontSize: "14px" }}>
            Aucun avis en attente. Revenez après la prochaine synchronisation.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {items.map((item) => (
            <PendingCard key={item.pending.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
