"use client";
import { useState, useEffect } from "react";

const DISMISS_DAYS = 14;

// Bandeau discret qui rappelle qu'une tâche peut être déléguée à Caela Agency
// (payant, transparent). Se ferme et reste fermé pendant DISMISS_DAYS pour ne
// jamais devenir intrusif. Palette calquée sur le thème Material du dashboard
// (bleu Google #1A73E8, cartes blanches, bordures #DADCE0).
export default function DelegateBanner({
  storageKey,
  icon = "✨",
  title,
  body,
  ctaLabel = "En discuter →",
  mailSubject,
}: {
  storageKey: string;
  icon?: string;
  title: string;
  body: string;
  ctaLabel?: string;
  mailSubject: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const key = `rp_delegate_dismiss_${storageKey}`;
    const dismissedAt = Number(localStorage.getItem(key) || 0);
    if (!dismissedAt || Date.now() - dismissedAt > DISMISS_DAYS * 24 * 60 * 60 * 1000) {
      setVisible(true);
    }
  }, [storageKey]);

  function dismiss() {
    localStorage.setItem(`rp_delegate_dismiss_${storageKey}`, String(Date.now()));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 12,
        padding: "14px 18px",
        marginBottom: 16,
        background: "linear-gradient(135deg, rgba(26,115,232,0.08), #fff)",
        border: "1px solid rgba(26,115,232,0.25)",
        boxShadow: "0 1px 3px rgba(60,64,67,0.12), 0 1px 2px rgba(60,64,67,0.06)",
        display: "flex",
        alignItems: "center",
        gap: 14,
        flexWrap: "wrap",
        animation: "rpDelegateSlideIn 0.5s cubic-bezier(0.22,1,0.36,1) both",
      }}
    >
      <style>{`
        @keyframes rpDelegateSlideIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes rpDelegatePulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(26,115,232,0.3); } 50% { box-shadow: 0 0 0 6px rgba(26,115,232,0); } }
      `}</style>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          flexShrink: 0,
          background: "rgba(26,115,232,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 17,
          animation: "rpDelegatePulse 2.6s infinite",
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: "#202124", marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 12.5, color: "#5F6368", lineHeight: 1.5 }}>{body}</div>
      </div>
      <a
        href={`mailto:contact@caela-agency.fr?subject=${encodeURIComponent(mailSubject)}`}
        style={{
          flexShrink: 0,
          padding: "9px 16px",
          borderRadius: 8,
          whiteSpace: "nowrap",
          background: "#1A73E8",
          color: "#fff",
          fontWeight: 700,
          fontSize: 12.5,
          textDecoration: "none",
          fontFamily: "inherit",
        }}
      >
        {ctaLabel}
      </a>
      <button
        onClick={dismiss}
        aria-label="Fermer ce rappel"
        style={{
          flexShrink: 0,
          width: 24,
          height: 24,
          borderRadius: 8,
          background: "rgba(60,64,67,0.06)",
          border: "none",
          color: "#5F6368",
          cursor: "pointer",
          fontSize: 13,
          lineHeight: 1,
          fontFamily: "inherit",
        }}
      >
        ✕
      </button>
    </div>
  );
}
