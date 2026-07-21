"use client";

import { useEffect, useState } from "react";

type Extension = {
  key: string;
  name: string;
  produit: string;
  icon: string;
  price: number;
  accent: string;
  wash: string;
  pitch: string;
  status: "active" | "available";
  openUrl?: string;
};

const EMOJI: Record<string, string> = {
  avis: "⭐",
  reservation: "📅",
  jeux: "🎲",
  fidelite: "🎁",
  campagnes: "📣",
  qr: "🔗",
};

// Cartes "Ajouter X" — le reste de l'écosystème Caela proposé sans quitter
// Reputation. Activation en un clic : paiement Stripe si le module est
// payant, sinon connexion directe (repli gratuit).
export default function ExtensionsWidget() {
  const [extensions, setExtensions] = useState<Extension[] | null>(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/extensions")
      .then((r) => (r.ok ? r.json() : { modules: [] }))
      .then((d) => setExtensions(d.modules ?? []))
      .catch(() => setExtensions([]));
  }, []);

  const active = (extensions ?? []).filter((e) => e.status === "active");
  const available = (extensions ?? []).filter((e) => e.status === "available");

  async function activate(key: string) {
    setBusy(key);
    setError("");
    try {
      const res = await fetch("/api/extensions/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ module: key }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      setError(data.error || "Erreur");
    } catch {
      setError("Connexion impossible");
    }
    setBusy("");
  }

  if (extensions !== null && active.length === 0 && available.length === 0) return null;

  return (
    <div style={{ marginTop: "32px" }}>
      <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#202124", margin: "0 0 4px" }}>🧩 L&apos;écosystème Caela</h2>
      <p style={{ fontSize: "13px", color: "#5F6368", margin: "0 0 16px" }}>
        Ajoute d&apos;autres outils au même compte, sans ressaisir tes infos.
      </p>

      {error && <p style={{ fontSize: "13px", color: "#EA4335", marginBottom: "12px" }}>{error}</p>}

      {extensions === null ? (
        <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ height: "150px", borderRadius: "12px", background: "#F8F9FA", border: "1px solid #DADCE0" }} />
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
          {active.map((ext) => (
            <div key={ext.key} style={{ background: "#fff", border: "1px solid #DADCE0", borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "10px", fontSize: "16px", background: ext.wash }}>
                {EMOJI[ext.key] ?? "🧩"}
              </div>
              <div style={{ fontWeight: 700, color: "#202124", fontSize: "14px" }}>{ext.produit}</div>
              <div style={{ fontSize: "11px", color: "#5F6368", marginTop: "2px" }}>{ext.name}</div>
              <p style={{ fontSize: "12.5px", color: "#5F6368", marginTop: "8px", flex: 1 }}>{ext.pitch}</p>
              <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#34A853", marginTop: "10px" }}>● Actif</span>
              {ext.openUrl && (
                <a href={ext.openUrl} style={{ marginTop: "8px", padding: "9px 14px", background: ext.accent, borderRadius: "8px", color: "#fff", fontSize: "13px", fontWeight: 600, textAlign: "center", textDecoration: "none", fontFamily: "inherit" }}>
                  Ouvrir {ext.produit}
                </a>
              )}
            </div>
          ))}
          {available.map((ext) => (
            <div key={ext.key} style={{ background: "#fff", border: "1px solid #DADCE0", borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "10px", fontSize: "16px", background: ext.wash }}>
                {EMOJI[ext.key] ?? "🧩"}
              </div>
              <div style={{ fontWeight: 700, color: "#202124", fontSize: "14px" }}>{ext.produit}</div>
              <div style={{ fontSize: "11px", color: "#5F6368", marginTop: "2px" }}>{ext.name}</div>
              <p style={{ fontSize: "12.5px", color: "#5F6368", marginTop: "8px", flex: 1 }}>{ext.pitch}</p>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#202124", marginTop: "10px" }}>{ext.price}€/mois</div>
              <button
                onClick={() => activate(ext.key)}
                disabled={busy === ext.key}
                style={{ marginTop: "10px", padding: "9px 14px", background: ext.accent, border: "none", borderRadius: "8px", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer", opacity: busy === ext.key ? 0.7 : 1, fontFamily: "inherit" }}
              >
                {busy === ext.key ? "..." : `Ajouter ${ext.produit}`}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
