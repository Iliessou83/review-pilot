"use client";

import { useMemo, useState } from "react";
import type { WheelSegment } from "@/db/schema";

type Props = {
  slug: string;
  mode: "avis" | "concours";
  theme: "dark" | "neon" | "warm";
  businessName: string;
  headline: string;
  logoUrl: string | null;
  brandColor: string;
  reviewUrl: string;
  segments: WheelSegment[];
  requireContact: boolean;
  consentText: string | null;
};

const THEMES = {
  dark: {
    bg: "radial-gradient(circle at 30% 0%, #1c2620 0%, #0d0f0e 60%, #08090a 100%)",
    text: "#e8eae9",
    sub: "#9aa6a0",
    card: "rgba(255,255,255,0.04)",
    border: "rgba(255,255,255,0.10)",
    star: "#e9c349",
  },
  neon: {
    bg: "radial-gradient(circle at 50% 0%, #14123a 0%, #0a0a18 60%, #050509 100%)",
    text: "#eafcff",
    sub: "#8ea2c8",
    card: "rgba(120,160,255,0.06)",
    border: "rgba(120,200,255,0.18)",
    star: "#ff5cf0",
  },
  warm: {
    bg: "radial-gradient(circle at 50% 0%, #fff7ee 0%, #fdeede 55%, #f7e2cb 100%)",
    text: "#3a2b1c",
    sub: "#8a7156",
    card: "rgba(255,255,255,0.65)",
    border: "rgba(180,140,90,0.25)",
    star: "#e8a02a",
  },
} as const;

export default function WheelClient(props: Props) {
  const t = THEMES[props.theme] ?? THEMES.dark;
  const segments = props.segments;
  const n = Math.max(segments.length, 1);
  const seg = 360 / n;

  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ label: string; spinId: number } | null>(null);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  // Fond conique de la roue à partir des couleurs de segments.
  const conic = useMemo(() => {
    const stops = segments
      .map((s, i) => `${s.color} ${i * seg}deg ${(i + 1) * seg}deg`)
      .join(", ");
    return `conic-gradient(from 0deg, ${stops})`;
  }, [segments, seg]);

  async function spin() {
    if (spinning || result) return;
    setError("");
    if (props.requireContact && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Entre un email valide pour participer.");
      return;
    }
    setSpinning(true);
    try {
      const res = await fetch("/api/wheel/spin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: props.slug, email: email || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur, réessaie.");
        setSpinning(false);
        return;
      }
      const i = data.prizeIndex as number;
      // Amener le centre du segment i sous le curseur (en haut), + 6 tours.
      const target = 360 * 6 - (i + 0.5) * seg;
      // Repart d'un multiple de tour pour garder une rotation croissante.
      const base = Math.ceil(rotation / 360) * 360;
      setRotation(base + target);
      setTimeout(() => {
        setResult({ label: data.prizeLabel, spinId: data.spinId });
        setSpinning(false);
      }, 4200);
    } catch {
      setError("Connexion impossible, réessaie.");
      setSpinning(false);
    }
  }

  async function goReview() {
    if (result) {
      // Mesure uniquement, jamais une condition au gain.
      fetch("/api/wheel/spin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spinId: result.spinId }),
      }).catch(() => {});
    }
    window.open(props.reviewUrl, "_blank", "noopener,noreferrer");
  }

  const radius = 42; // % du conteneur pour placer les labels

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: t.bg,
        color: t.text,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "28px 20px 40px",
        fontFamily:
          "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      {/* En-tête commerçant */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
        {props.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={props.logoUrl}
            alt={props.businessName}
            width={48}
            height={48}
            style={{ borderRadius: "50%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: props.brandColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              color: "#fff",
            }}
          >
            {props.businessName.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div style={{ fontSize: 20, fontWeight: 700 }}>{props.businessName}</div>
      </div>
      <div style={{ color: t.sub, fontSize: 14, marginBottom: 24 }}>{props.headline}</div>

      {/* Roue */}
      <div style={{ position: "relative", width: "min(86vw, 360px)", aspectRatio: "1" }}>
        {/* Curseur */}
        <div
          style={{
            position: "absolute",
            top: -6,
            left: "50%",
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: "16px solid transparent",
            borderRight: "16px solid transparent",
            borderTop: `26px solid ${t.star}`,
            zIndex: 5,
            filter: "drop-shadow(0 2px 3px rgba(0,0,0,.4))",
          }}
        />
        {/* Disque */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: conic,
            border: `8px solid ${t.star}`,
            boxShadow: `0 0 0 2px rgba(0,0,0,.25), 0 20px 50px rgba(0,0,0,.45)`,
            transition: "transform 4.2s cubic-bezier(0.16, 1, 0.3, 1)",
            transform: `rotate(${rotation}deg)`,
          }}
        >
          {segments.map((s, i) => {
            const angle = (i + 0.5) * seg;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  inset: 0,
                  transform: `rotate(${angle}deg)`,
                  pointerEvents: "none",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: `${50 - radius}%`,
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    color: "#fff",
                    fontSize: "clamp(10px, 3.2vw, 14px)",
                    fontWeight: 700,
                    textShadow: "0 1px 2px rgba(0,0,0,.55)",
                    whiteSpace: "nowrap",
                    maxWidth: 90,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
        {/* Moyeu central / bouton */}
        <button
          onClick={spin}
          disabled={spinning || !!result}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 76,
            height: 76,
            borderRadius: "50%",
            border: `4px solid ${t.star}`,
            background: "#0d0f0e",
            color: "#fff",
            fontWeight: 800,
            fontSize: 14,
            letterSpacing: 0.5,
            cursor: spinning || result ? "default" : "pointer",
            zIndex: 4,
            boxShadow: "0 6px 16px rgba(0,0,0,.4)",
          }}
        >
          {spinning ? "..." : "TOURNER"}
        </button>
      </div>

      {/* Capture contact (mode concours) */}
      {props.requireContact && !result && (
        <input
          type="email"
          inputMode="email"
          placeholder="Ton email pour participer"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            marginTop: 24,
            width: "min(86vw, 360px)",
            padding: "14px 16px",
            borderRadius: 12,
            border: `1px solid ${t.border}`,
            background: t.card,
            color: t.text,
            fontSize: 16,
          }}
        />
      )}

      {/* Bouton principal */}
      <button
        onClick={spin}
        disabled={spinning || !!result}
        style={{
          marginTop: 24,
          width: "min(86vw, 360px)",
          padding: "16px",
          borderRadius: 14,
          border: "none",
          background: result
            ? t.card
            : `linear-gradient(45deg, ${props.brandColor}, #1e40af)`,
          color: result ? t.sub : "#fff",
          fontWeight: 700,
          fontSize: 16,
          cursor: spinning || result ? "default" : "pointer",
        }}
      >
        {result ? "Lot débloqué 🎉" : spinning ? "La roue tourne..." : "Faire tourner la roue"}
      </button>

      {error && (
        <div style={{ color: "#ff8a80", marginTop: 12, fontSize: 14 }}>{error}</div>
      )}

      {/* Résultat */}
      {result && (
        <div
          style={{
            marginTop: 18,
            width: "min(86vw, 360px)",
            padding: "16px 18px",
            borderRadius: 14,
            background: t.card,
            border: `1px solid ${t.border}`,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 13, color: t.sub }}>Tu as gagné</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: props.brandColor }}>
            {result.label}
          </div>
          <div style={{ fontSize: 12, color: t.sub, marginTop: 6 }}>
            Montre cet écran en caisse pour profiter de ton lot.
          </div>
        </div>
      )}

      {/* Carte avis Google — SÉPARÉE, jamais conditionnée au lot */}
      <div
        style={{
          marginTop: 28,
          width: "min(86vw, 360px)",
          padding: "20px 18px",
          borderRadius: 16,
          background: t.card,
          border: `1px solid ${t.border}`,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 22, letterSpacing: 2, color: t.star }}>★★★★★</div>
        <div style={{ fontWeight: 700, fontSize: 16, margin: "8px 0 4px" }}>
          Partagez votre expérience sur Google
        </div>
        <button
          onClick={goReview}
          style={{
            marginTop: 10,
            width: "100%",
            padding: "14px",
            borderRadius: 12,
            border: `1px solid ${t.border}`,
            background: "transparent",
            color: t.text,
            fontWeight: 600,
            fontSize: 15,
            cursor: "pointer",
          }}
        >
          Laisser un avis
        </button>
        <div style={{ fontSize: 11, color: t.sub, marginTop: 12, lineHeight: 1.5 }}>
          Avis libre et honnête, positif ou négatif. Le jeu est indépendant de votre avis.
        </div>
      </div>

      {props.requireContact && props.consentText && (
        <div style={{ fontSize: 11, color: t.sub, marginTop: 16, maxWidth: 360, textAlign: "center" }}>
          {props.consentText}
        </div>
      )}

      <div style={{ marginTop: 28, fontSize: 11, color: t.sub, opacity: 0.7 }}>
        Propulsé par Caela Réputation
      </div>
    </div>
  );
}
