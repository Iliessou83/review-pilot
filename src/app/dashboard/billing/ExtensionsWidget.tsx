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
  previewImage?: string;
  landingUrl?: string;
};

const EMOJI: Record<string, string> = {
  avis: "⭐",
  reservation: "📅",
  jeux: "🎲",
  fidelite: "🎁",
  campagnes: "📣",
  qr: "🔗",
};

function ExtCard({ ext, busy, onActivate, promoCode }: { ext: Extension; busy: string; onActivate: (key: string) => void; promoCode: string | null }) {
  return (
    <div
      className="rp-ext-card"
      style={{
        position: "relative",
        flexShrink: 0,
        width: "256px",
        borderRadius: "16px",
        overflow: "hidden",
        background: "#fff",
        border: "1px solid #DADCE0",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {ext.previewImage && (
        <div className="rp-ext-imgwrap" style={{ position: "relative", overflow: "hidden", aspectRatio: "16/9", borderBottom: "1px solid #DADCE0" }}>
          {ext.landingUrl ? (
            <a href={ext.landingUrl} target="_blank" rel="noopener noreferrer" title={`Voir ${ext.produit}`}>
              <img
                src={ext.previewImage}
                alt={`Aperçu ${ext.produit}`}
                loading="lazy"
                className="rp-ext-img"
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block" }}
              />
            </a>
          ) : (
            <img
              src={ext.previewImage}
              alt={`Aperçu ${ext.produit}`}
              loading="lazy"
              className="rp-ext-img"
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block" }}
            />
          )}
          <div
            className="rp-ext-overlay"
            style={{
              pointerEvents: "none",
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0) 60%)",
              opacity: 0,
              transition: "opacity 0.3s",
              display: "flex",
              alignItems: "flex-end",
              padding: "10px",
            }}
          >
            <span style={{ fontSize: "10px", fontWeight: 700, color: "#fff", background: "rgba(0,0,0,0.5)", padding: "4px 8px", borderRadius: "999px" }}>
              Aperçu du dashboard
            </span>
          </div>
        </div>
      )}
      <div style={{ padding: "16px", display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px", marginBottom: "8px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", background: ext.wash, flexShrink: 0 }}>
            {EMOJI[ext.key] ?? "🧩"}
          </div>
          {ext.landingUrl && (
            <div className="rp-ext-infowrap" style={{ position: "relative", flexShrink: 0 }}>
              <a
                href={ext.landingUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`En savoir plus sur ${ext.produit}`}
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  border: "1px solid #DADCE0",
                  color: "#5F6368",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  fontSize: "12px",
                  fontWeight: 700,
                  fontFamily: "Georgia, serif",
                  transition: "background 0.15s, border-color 0.15s",
                }}
              >
                i
              </a>
              <div
                className="rp-ext-bubble"
                style={{
                  pointerEvents: "none",
                  position: "absolute",
                  bottom: "100%",
                  right: 0,
                  marginBottom: "8px",
                  width: "208px",
                  opacity: 0,
                  transition: "opacity 0.15s",
                  zIndex: 30,
                }}
              >
                <div style={{ background: "#202124", color: "#fff", fontSize: "11px", lineHeight: 1.5, borderRadius: "8px", padding: "8px 12px", boxShadow: "0 4px 16px rgba(0,0,0,0.25)" }}>
                  {ext.pitch}
                </div>
                <div style={{ width: "8px", height: "8px", background: "#202124", position: "absolute", right: "12px", bottom: "-4px", transform: "rotate(45deg)" }} />
              </div>
            </div>
          )}
        </div>
        <div style={{ fontWeight: 700, color: "#202124", fontSize: "14px" }}>{ext.produit}</div>
        <div style={{ fontSize: "11px", color: "#5F6368", marginTop: "2px" }}>{ext.name}</div>

        <div style={{ marginTop: "auto", paddingTop: "12px" }}>
          {ext.status === "active" ? (
            <>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 700, color: "#34A853", marginBottom: "8px" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#34A853" }} /> Actif
              </span>
              {ext.openUrl && (
                <a
                  href={ext.openUrl}
                  style={{ display: "block", borderRadius: "8px", padding: "9px 12px", fontSize: "13px", fontWeight: 700, textAlign: "center", textDecoration: "none", background: ext.accent, color: "#fff", fontFamily: "inherit" }}
                >
                  Ouvrir {ext.produit}
                </a>
              )}
            </>
          ) : (
            <>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#202124", margin: "0 0 4px" }}>À partir de {ext.price}€/mois</p>
              {promoCode && (
                <div className="rp-ext-promowrap" style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: "4px", marginBottom: "8px" }}>
                  <span style={{ fontSize: "10px", fontWeight: 700, color: "#B06000" }}>🎁 -10% avec {promoCode}</span>
                  <div
                    className="rp-ext-promobubble"
                    style={{
                      pointerEvents: "none",
                      position: "absolute",
                      bottom: "100%",
                      left: 0,
                      marginBottom: "6px",
                      width: "224px",
                      opacity: 0,
                      transition: "opacity 0.15s",
                      zIndex: 30,
                    }}
                  >
                    <div style={{ background: "#202124", color: "#fff", fontSize: "11px", lineHeight: 1.5, borderRadius: "8px", padding: "8px 12px", boxShadow: "0 4px 16px rgba(0,0,0,0.25)" }}>
                      Code exclusif réservé aux membres Caela : parce que tu es déjà client Caela Réputation, tu bénéficies de -10% sur {ext.produit}. Colle-le sur la page de paiement.
                    </div>
                  </div>
                </div>
              )}
              <button
                onClick={() => onActivate(ext.key)}
                disabled={busy === ext.key}
                style={{
                  width: "100%",
                  borderRadius: "8px",
                  padding: "9px 12px",
                  fontSize: "13px",
                  fontWeight: 700,
                  textAlign: "center",
                  border: "none",
                  background: ext.accent,
                  color: "#fff",
                  cursor: "pointer",
                  opacity: busy === ext.key ? 0.6 : 1,
                  fontFamily: "inherit",
                }}
              >
                {busy === ext.key ? "..." : `Ajouter ${ext.produit}`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Le reste de l'écosystème Caela, sans quitter Reputation : les modules déjà
// actifs s'ouvrent en un clic (connecté), les autres s'ajoutent en un clic
// (paiement Stripe si payant, sinon connexion directe). Défilement continu
// façon bandeau, en pause au survol — évite l'effet "grille avec des trous"
// quand le nombre de modules ne tombe pas juste sur 3 colonnes.
export default function ExtensionsWidget() {
  const [extensions, setExtensions] = useState<Extension[] | null>(null);
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [hubBusy, setHubBusy] = useState(false);

  useEffect(() => {
    fetch("/api/extensions")
      .then((r) => (r.ok ? r.json() : { modules: [] }))
      .then((d) => { setExtensions(d.modules ?? []); setPromoCode(d.memberPromoCode ?? null); })
      .catch(() => setExtensions([]));
  }, []);

  const items = extensions ?? [];
  if (extensions !== null && items.length === 0) return null;

  async function openHub() {
    setHubBusy(true);
    setError("");
    try {
      const res = await fetch("/api/hub/open", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      setError(data.error || "Erreur");
    } catch {
      setError("Connexion impossible");
    }
    setHubBusy(false);
  }

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

  const activeCount = items.filter((e) => e.status === "active").length;
  const availableCount = items.filter((e) => e.status === "available").length;
  const marqueeItems = items.length ? [...items, ...items] : [];

  return (
    <div style={{ marginBottom: "24px" }}>
      <style>{`
        @keyframes rp-ext-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .rp-ext-track { animation: rp-ext-marquee linear infinite; }
        .rp-ext-track:hover { animation-play-state: paused; }
        .rp-ext-card:hover .rp-ext-img { transform: scale(1.1); }
        .rp-ext-img { transition: transform 0.5s; }
        .rp-ext-card:hover .rp-ext-overlay { opacity: 1; }
        .rp-ext-card:hover .rp-ext-bubble { opacity: 1; }
        .rp-ext-infowrap a:hover { background: #F1F3F4; border-color: #5F6368 !important; }
        .rp-ext-promowrap:hover .rp-ext-promobubble { opacity: 1; }
        @media (prefers-reduced-motion: reduce) { .rp-ext-track { animation: none !important; } }
      `}</style>

      <div
        style={{
          borderRadius: "20px",
          background: "linear-gradient(135deg, #E8F0FE 0%, #E6F4EA 100%)",
          padding: "24px",
          border: "1px solid #DADCE0",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", borderRadius: "14px", background: "#fff", border: "1px solid #DADCE0", padding: "12px 14px", marginBottom: "20px" }}>
          <span style={{ flexShrink: 0, width: "32px", height: "32px", borderRadius: "8px", background: "#1A73E8", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "14px" }}>
            C
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "#202124" }}>Caela Hub</p>
            <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#5F6368", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              Ton compte central : facturation groupée et vue d&apos;ensemble de tous tes outils.
            </p>
          </div>
          <button
            onClick={openHub}
            disabled={hubBusy}
            style={{ flexShrink: 0, borderRadius: "8px", padding: "8px 14px", fontSize: "12px", fontWeight: 700, border: "none", background: "#1A73E8", color: "#fff", cursor: hubBusy ? "not-allowed" : "pointer", opacity: hubBusy ? 0.7 : 1, fontFamily: "inherit" }}
          >
            {hubBusy ? "..." : "Ouvrir mon compte"}
          </button>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "20px" }}>
          <div>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#1A73E8", marginBottom: "6px" }}>
              🧩 Écosystème Caela
            </span>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#202124", margin: 0 }}>Un compte, tous tes outils</h2>
            <p style={{ fontSize: "13px", color: "#5F6368", margin: "4px 0 0", maxWidth: "420px" }}>
              Ajoute d&apos;autres outils Caela sans ressaisir tes infos, connectés à ton compte Reputation.
            </p>
          </div>
          {extensions !== null && (
            <span style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: "6px", background: "#fff", border: "1px solid #DADCE0", padding: "6px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: 600, color: "#202124" }}>
              {activeCount} actif{activeCount > 1 ? "s" : ""} · {availableCount} à découvrir
            </span>
          )}
        </div>

        {error && <p style={{ textAlign: "center", fontSize: "13px", color: "#EA4335", marginBottom: "16px" }}>{error}</p>}

        {extensions === null ? (
          <div style={{ display: "flex", gap: "16px", overflow: "hidden" }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ width: "256px", height: "208px", borderRadius: "16px", background: "rgba(255,255,255,0.6)", flexShrink: 0 }} />
            ))}
          </div>
        ) : (
          <div
            style={{
              margin: "0 -24px",
              overflow: "hidden",
              WebkitMaskImage: "linear-gradient(to right, transparent, black 5%, black 95%, transparent)",
              maskImage: "linear-gradient(to right, transparent, black 5%, black 95%, transparent)",
            }}
          >
            <div
              className="rp-ext-track"
              style={{ display: "flex", gap: "16px", width: "max-content", padding: "0 24px", animationDuration: `${Math.max(items.length * 8, 25)}s` }}
            >
              {marqueeItems.map((ext, i) => (
                <ExtCard key={`${ext.key}-${i}`} ext={ext} busy={busy} onActivate={activate} promoCode={promoCode} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
