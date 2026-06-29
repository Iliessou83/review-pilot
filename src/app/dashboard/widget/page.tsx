"use client";

import { useEffect, useState } from "react";

const G = { blue: "#1A73E8", green: "#34A853", red: "#EA4335" };

type Business = { id: number; name: string };

export default function WidgetPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [origin, setOrigin] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
    fetch("/api/businesses")
      .then((r) => (r.ok ? r.json() : []))
      .then((d: Business[]) => setBusinesses(Array.isArray(d) ? d : []))
      .catch(() => setBusinesses([]))
      .finally(() => setLoading(false));
  }, []);

  // Charge le vrai widget.js une fois les <div> d'aperçu présents dans le DOM.
  useEffect(() => {
    if (!businesses.length || !origin) return;
    if (document.getElementById("caela-widget-preview-script")) return;
    const s = document.createElement("script");
    s.id = "caela-widget-preview-script";
    s.src = `${origin}/widget.js`;
    s.async = true;
    document.body.appendChild(s);
  }, [businesses, origin]);

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 1800);
    });
  }

  function embedCode(id: number) {
    return `<div data-caela-widget="${id}"></div>\n<script src="${origin}/widget.js" async></script>`;
  }
  function jsonLdCode(id: number) {
    return `<!-- Étoiles dans Google : collez ce bloc dans le <head> de votre site.\n     Remplacez les valeurs par celles de votre dernier audit, ou laissez le widget les injecter automatiquement. -->\n<script type="application/ld+json">\n${JSON.stringify(
      {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: businesses.find((b) => b.id === id)?.name || "",
        aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8", reviewCount: "120", bestRating: 5 },
      },
      null,
      2
    )}\n</script>`;
  }

  const box: React.CSSProperties = {
    background: "#0d1117", color: "#e6edf3", fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace",
    fontSize: 12.5, lineHeight: 1.6, borderRadius: 10, padding: "14px 16px",
    whiteSpace: "pre-wrap", wordBreak: "break-all", overflowX: "auto",
  };
  const copyBtn = (active: boolean): React.CSSProperties => ({
    padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer",
    border: "1px solid #DADCE0", borderRadius: 8, fontFamily: "inherit",
    background: active ? "#E6F4EA" : "#fff", color: active ? G.green : "#202124",
  });

  return (
    <div style={{ maxWidth: 880, margin: "0 auto" }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: "#202124", margin: "0 0 6px" }}>
        Widget d&apos;avis
      </h1>
      <p style={{ fontSize: 15, color: "#5F6368", margin: "0 0 28px", lineHeight: 1.6, maxWidth: 620 }}>
        Affichez vos avis directement sur votre site, et faites apparaître vos étoiles dans Google
        (rich snippets). Copiez le code, collez-le où vous voulez. Aucune mise à jour à faire : le
        widget se synchronise tout seul.
      </p>

      {loading && <p style={{ color: "#80868B" }}>Chargement…</p>}

      {!loading && businesses.length === 0 && (
        <div style={{ background: "#FFF3E0", border: "1px solid #FBBC04", borderRadius: 12, padding: "18px 20px", fontSize: 14, color: "#7A5900" }}>
          Ajoutez d&apos;abord un établissement pour générer son widget.
        </div>
      )}

      {businesses.map((b) => (
        <div key={b.id} style={{ background: "#fff", border: "1px solid #DADCE0", borderRadius: 16, padding: "24px 26px", marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#202124", margin: "0 0 18px" }}>{b.name}</h2>

          {/* Aperçu live */}
          <div style={{ fontSize: 12, fontWeight: 700, color: "#80868B", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Aperçu</div>
          <div style={{ marginBottom: 22 }} data-caela-widget={b.id} data-layout="row" data-max="4" />

          {/* Code embed */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#80868B", textTransform: "uppercase", letterSpacing: 0.5 }}>Code à coller sur votre site</span>
            <button style={copyBtn(copied === `embed-${b.id}`)} onClick={() => copy(embedCode(b.id), `embed-${b.id}`)}>
              {copied === `embed-${b.id}` ? "✓ Copié" : "Copier"}
            </button>
          </div>
          <div style={box}>{embedCode(b.id)}</div>

          {/* Options */}
          <p style={{ fontSize: 12.5, color: "#80868B", margin: "10px 0 22px", lineHeight: 1.6 }}>
            Options sur le <code>div</code> : <code>data-theme=&quot;dark&quot;</code> (fond sombre),{" "}
            <code>data-layout=&quot;grid&quot;</code> (en grille) ou <code>&quot;row&quot;</code> (en ligne),{" "}
            <code>data-max=&quot;6&quot;</code> (nombre d&apos;avis affichés).
          </p>

          {/* JSON-LD */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#80868B", textTransform: "uppercase", letterSpacing: 0.5 }}>Étoiles dans Google (optionnel)</span>
            <button style={copyBtn(copied === `ld-${b.id}`)} onClick={() => copy(jsonLdCode(b.id), `ld-${b.id}`)}>
              {copied === `ld-${b.id}` ? "✓ Copié" : "Copier"}
            </button>
          </div>
          <div style={box}>{jsonLdCode(b.id)}</div>
        </div>
      ))}
    </div>
  );
}
