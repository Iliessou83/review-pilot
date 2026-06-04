"use client";

import { useState } from "react";

const G = { blue: "#1A73E8", red: "#EA4335", yellow: "#FBBC04", green: "#34A853" };
const SHADOW = "0 2px 8px rgba(60,64,67,0.15), 0 1px 4px rgba(60,64,67,0.1)";

type Candidate = {
  place_id: string;
  name: string;
  address: string;
  rating: number | null;
  reviewCount: number;
  type: string;
};

type AuditResult = {
  score: number;
  businessName: string;
  rating: number;
  reviewCount: number;
  found: boolean;
  insights: { label: string; status: "good" | "warn" | "bad"; detail: string }[];
  priorities: string[];
  recommendation: string;
};

type Step = "form" | "choose" | "email" | "result";

function Stars({ n }: { n: number }) {
  return <span>{[1,2,3,4,5].map(i => <span key={i} style={{ color: i <= Math.round(n) ? G.yellow : "#DADCE0", fontSize: "13px" }}>★</span>)}</span>;
}

export default function AuditPage() {
  const [step, setStep] = useState<Step>("form");
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [searching, setSearching] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState("");

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !city) return;

    // If user pasted a Google Maps URL, skip search and go straight to email
    const mapsUrlMatch = name.match(/place_id=([^&]+)/) || name.match(/maps\.google\.[a-z.]+\/maps\/place\/([^/]+)/) || name.match(/g\.page\/([^?]+)/);
    if (name.startsWith("http") || name.includes("google.com/maps") || name.includes("g.co/kgs") || name.includes("goo.gl/maps")) {
      const placeIdFromUrl = name.match(/place\/[^/]+\/([^/?]+)/)?.[1] || name.match(/!1s([^!]+)/)?.[1];
      const fakeCandidate: Candidate = {
        place_id: placeIdFromUrl || "url_provided",
        name: "Votre établissement (depuis lien Google)",
        address: "Lien Google Maps détecté",
        rating: null,
        reviewCount: 0,
        type: "",
      };
      setCandidates([fakeCandidate]);
      setStep("choose");
      return;
    }

    setSearching(true);
    setError("");
    try {
      const res = await fetch("/api/audit/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, city, address }),
      });
      const data = await res.json();
      setCandidates(data.candidates || []);
      setStep("choose");
    } catch {
      setError("Erreur de recherche. Réessayez.");
    } finally {
      setSearching(false);
    }
  }

  function selectBusiness(candidate: Candidate) {
    setSelected(candidate);
    setStep("email");
  }

  function notFound() {
    setSelected(null);
    setStep("email");
  }

  async function handleAudit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: selected?.name || name,
          city,
          email,
          placeId: selected?.place_id || null,
        }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      setResult(data);
      setStep("result");
    } catch {
      setError("Une erreur est survenue. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  const scoreColor = (s: number) => s >= 75 ? G.green : s >= 50 ? G.yellow : G.red;
  const scoreLabel = (s: number) => s >= 75 ? "Excellente réputation" : s >= 50 ? "À améliorer" : "Urgent";

  return (
    <div style={{ fontFamily: "'Google Sans', system-ui, sans-serif", background: "#fff", color: "#202124", minHeight: "100vh" }}>

      {/* Nav */}
      <nav style={{ borderBottom: "1px solid #DADCE0", padding: "0 24px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "#fff", zIndex: 100 }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <div style={{ display: "flex", gap: "3px" }}>
            {[G.blue, G.red, G.yellow, G.green].map((c, i) => <div key={i} style={{ width: "8px", height: "8px", borderRadius: "50%", background: c }} />)}
          </div>
          <span style={{ fontWeight: 700, fontSize: "15px", color: "#202124" }}>Caela Réputation</span>
        </a>
        <a href="/#login" style={{ padding: "8px 20px", background: G.blue, color: "#fff", borderRadius: "8px", textDecoration: "none", fontSize: "13px", fontWeight: 600 }}>
          Essai 14 jours →
        </a>
      </nav>

      <section style={{ background: "linear-gradient(160deg, #fff 0%, #F8F9FA 60%, #E8F0FE 100%)", padding: "64px 24px 72px", minHeight: "calc(100vh - 64px)" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 14px", background: "#E8F0FE", borderRadius: "24px", fontSize: "12px", fontWeight: 600, color: G.blue, marginBottom: "16px" }}>
              🔍 Audit gratuit — résultat en 30 secondes
            </div>
            <h1 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 800, lineHeight: 1.15, color: "#202124", margin: "0 0 12px" }}>
              Votre fiche Google est-elle{" "}
              <span style={{ color: G.blue }}>optimisée ?</span>
            </h1>
            <p style={{ fontSize: "15px", color: "#5F6368", margin: 0 }}>Gratuit. Sans inscription. Résultat immédiat + rapport par email.</p>
          </div>

          {/* Progress indicator */}
          {step !== "form" && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "32px" }}>
              {[
                { key: "form", label: "Recherche" },
                { key: "choose", label: "Votre fiche" },
                { key: "email", label: "Email" },
                { key: "result", label: "Résultat" },
              ].map((s, i, arr) => {
                const steps = ["form", "choose", "email", "result"];
                const current = steps.indexOf(step);
                const idx = steps.indexOf(s.key);
                const done = idx < current;
                const active = idx === current;
                return (
                  <div key={s.key} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: done ? G.green : active ? G.blue : "#DADCE0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: done || active ? "#fff" : "#80868B" }}>
                        {done ? "✓" : i + 1}
                      </div>
                      <span style={{ fontSize: "12px", fontWeight: active ? 600 : 400, color: active ? "#202124" : "#80868B" }}>{s.label}</span>
                    </div>
                    {i < arr.length - 1 && <div style={{ width: "20px", height: "1px", background: done ? G.green : "#DADCE0" }} />}
                  </div>
                );
              })}
            </div>
          )}

          {/* STEP 1 — Search form */}
          {step === "form" && (
            <form onSubmit={handleSearch} style={{ background: "#fff", borderRadius: "20px", padding: "32px 36px", boxShadow: SHADOW, border: "1px solid #DADCE0" }}>
              <h2 style={{ margin: "0 0 22px", fontSize: "18px", fontWeight: 700, color: "#202124" }}>Trouvez votre établissement</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "13px", fontWeight: 600, color: "#202124", display: "block", marginBottom: "6px" }}>Nom de votre établissement *</label>
                  <input value={name} onChange={e => setName(e.target.value)} required
                    placeholder="Le Fenix — ou collez votre lien Google Maps"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = G.blue}
                    onBlur={e => e.target.style.borderColor = "#DADCE0"}
                  />
                  <p style={{ fontSize: "11px", color: "#80868B", margin: "4px 0 0" }}>
                    💡 <strong>Astuce :</strong> Collez directement votre lien Google Maps pour un résultat immédiat et précis.
                  </p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ fontSize: "13px", fontWeight: 600, color: "#202124", display: "block", marginBottom: "6px" }}>Adresse</label>
                    <input value={address} onChange={e => setAddress(e.target.value)}
                      placeholder="12 rue de la Paix"
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor = G.blue}
                      onBlur={e => e.target.style.borderColor = "#DADCE0"}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "13px", fontWeight: 600, color: "#202124", display: "block", marginBottom: "6px" }}>Ville *</label>
                    <input value={city} onChange={e => setCity(e.target.value)} required
                      placeholder="Lyon, Paris..."
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor = G.blue}
                      onBlur={e => e.target.style.borderColor = "#DADCE0"}
                    />
                  </div>
                </div>
                {error && <div style={{ padding: "10px 14px", background: "#FCE8E6", borderRadius: "8px", fontSize: "13px", color: G.red }}>{error}</div>}
                <button type="submit" disabled={searching} style={btnStyle(searching ? "#DADCE0" : G.blue)}>
                  {searching ? "Recherche en cours..." : "Rechercher mon établissement →"}
                </button>
              </div>
            </form>
          )}

          {/* STEP 2 — Choose business */}
          {step === "choose" && (
            <div style={{ background: "#fff", borderRadius: "20px", padding: "32px 36px", boxShadow: SHADOW, border: "1px solid #DADCE0" }}>
              <h2 style={{ margin: "0 0 6px", fontSize: "18px", fontWeight: 700, color: "#202124" }}>C&apos;est lequel votre établissement ?</h2>
              <p style={{ margin: "0 0 20px", fontSize: "13px", color: "#5F6368" }}>
                {candidates.length > 0
                  ? `${candidates.length} résultat${candidates.length > 1 ? "s" : ""} trouvé${candidates.length > 1 ? "s" : ""} pour "${name}" à ${city}`
                  : `Aucun résultat exact trouvé pour "${name}" à ${city}`}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
                {candidates.map(c => (
                  <button key={c.place_id} onClick={() => selectBusiness(c)} style={{
                    display: "flex", alignItems: "center", gap: "14px", padding: "16px",
                    border: "1px solid #DADCE0", borderRadius: "12px", background: "#fff",
                    cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                    transition: "all 0.15s",
                  }}
                    onMouseEnter={e => { (e.currentTarget).style.borderColor = G.blue; (e.currentTarget).style.background = "#E8F0FE10"; }}
                    onMouseLeave={e => { (e.currentTarget).style.borderColor = "#DADCE0"; (e.currentTarget).style.background = "#fff"; }}
                  >
                    {/* Google Maps pin */}
                    <div style={{ width: "40px", height: "40px", background: "#FCE8E6", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>
                      📍
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "15px", fontWeight: 700, color: "#202124", marginBottom: "2px" }}>{c.name}</div>
                      <div style={{ fontSize: "12px", color: "#80868B", marginBottom: c.rating ? "4px" : "0" }}>{c.address}</div>
                      {c.rating && (
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <Stars n={c.rating} />
                          <span style={{ fontSize: "12px", color: "#5F6368" }}>{c.rating.toFixed(1)} · {c.reviewCount} avis</span>
                        </div>
                      )}
                    </div>
                    <div style={{ color: G.blue, fontSize: "18px", flexShrink: 0 }}>→</div>
                  </button>
                ))}
              </div>

              <div style={{ borderTop: "1px solid #DADCE0", paddingTop: "14px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button onClick={notFound} style={{
                  flex: 1, padding: "10px", background: "#F8F9FA", border: "1px solid #DADCE0",
                  borderRadius: "8px", cursor: "pointer", fontFamily: "inherit", fontSize: "13px",
                  color: "#5F6368", fontWeight: 500,
                }}>
                  Mon établissement n&apos;est pas dans la liste
                </button>
                <button onClick={() => setStep("form")} style={{
                  padding: "10px 16px", background: "#fff", border: "1px solid #DADCE0",
                  borderRadius: "8px", cursor: "pointer", fontFamily: "inherit", fontSize: "13px",
                  color: "#5F6368",
                }}>
                  ← Modifier la recherche
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 — Email */}
          {step === "email" && (
            <form onSubmit={handleAudit} style={{ background: "#fff", borderRadius: "20px", padding: "32px 36px", boxShadow: SHADOW, border: "1px solid #DADCE0" }}>
              {selected ? (
                <div style={{ display: "flex", gap: "12px", alignItems: "center", padding: "12px 14px", background: "#E6F4EA", borderRadius: "10px", marginBottom: "24px" }}>
                  <span style={{ fontSize: "20px" }}>✅</span>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#202124" }}>{selected.name}</div>
                    <div style={{ fontSize: "12px", color: "#5F6368" }}>{selected.address}</div>
                  </div>
                  <button type="button" onClick={() => setStep("choose")} style={{ marginLeft: "auto", fontSize: "12px", color: G.blue, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", textDecoration: "underline" }}>
                    Changer
                  </button>
                </div>
              ) : (
                <div style={{ padding: "12px 14px", background: "#FEF7E0", borderRadius: "10px", marginBottom: "24px", fontSize: "13px", color: "#5F6368" }}>
                  ⚠️ Fiche introuvable — on va quand même générer un rapport avec les recommandations pour créer et optimiser votre fiche.
                </div>
              )}

              <h2 style={{ margin: "0 0 6px", fontSize: "18px", fontWeight: 700, color: "#202124" }}>Où envoyer votre rapport ?</h2>
              <p style={{ margin: "0 0 18px", fontSize: "13px", color: "#5F6368" }}>Le rapport complet vous sera envoyé par email + affiché ici immédiatement.</p>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "13px", fontWeight: 600, color: "#202124", display: "block", marginBottom: "6px" }}>Votre email professionnel *</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    placeholder="vous@exemple.fr"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = G.blue}
                    onBlur={e => e.target.style.borderColor = "#DADCE0"}
                  />
                </div>
                {error && <div style={{ padding: "10px 14px", background: "#FCE8E6", borderRadius: "8px", fontSize: "13px", color: G.red }}>{error}</div>}
                <button type="submit" disabled={loading} style={btnStyle(loading ? "#DADCE0" : G.blue)}>
                  {loading ? "Analyse en cours..." : "Lancer l'audit gratuitement →"}
                </button>
                <p style={{ fontSize: "11px", color: "#80868B", textAlign: "center", margin: 0 }}>Votre email ne sera jamais partagé. Uniquement ce rapport.</p>
              </div>
            </form>
          )}

          {/* STEP 4 — Result */}
          {step === "result" && result && (
            <div style={{ background: "#fff", borderRadius: "20px", padding: "32px 36px", boxShadow: SHADOW, border: "1px solid #DADCE0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
                <div>
                  <h2 style={{ margin: "0 0 4px", fontSize: "20px", fontWeight: 800, color: "#202124" }}>{result.businessName}</h2>
                  {result.found && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Stars n={result.rating} />
                      <span style={{ fontSize: "13px", color: "#5F6368" }}>{result.rating?.toFixed(1)} · {result.reviewCount} avis</span>
                    </div>
                  )}
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: `${scoreColor(result.score)}15`, border: `3px solid ${scoreColor(result.score)}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "22px", fontWeight: 800, color: scoreColor(result.score), lineHeight: 1 }}>{result.score}</span>
                    <span style={{ fontSize: "9px", color: scoreColor(result.score), fontWeight: 600 }}>/100</span>
                  </div>
                  <div style={{ fontSize: "10px", fontWeight: 700, color: scoreColor(result.score), marginTop: "4px" }}>{scoreLabel(result.score)}</div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
                {result.insights.map((ins, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "10px 14px", background: ins.status === "good" ? "#E6F4EA" : ins.status === "warn" ? "#FEF7E0" : "#FCE8E6", borderRadius: "8px" }}>
                    <span style={{ fontSize: "14px", flexShrink: 0, marginTop: "1px" }}>{ins.status === "good" ? "✅" : ins.status === "warn" ? "⚠️" : "❌"}</span>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "#202124" }}>{ins.label}</div>
                      <div style={{ fontSize: "12px", color: "#5F6368" }}>{ins.detail}</div>
                    </div>
                  </div>
                ))}
              </div>

              {result.priorities.length > 0 && (
                <div style={{ background: "#F8F9FA", borderRadius: "12px", padding: "16px 18px", marginBottom: "20px" }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#202124", marginBottom: "10px" }}>3 actions prioritaires :</div>
                  {result.priorities.map((p, i) => (
                    <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "6px", fontSize: "13px", color: "#5F6368" }}>
                      <span style={{ color: G.blue, fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>{p}
                    </div>
                  ))}
                </div>
              )}

              <div style={{ padding: "14px 16px", background: "#E8F0FE", borderRadius: "10px", fontSize: "13px", color: G.blue, lineHeight: 1.6, marginBottom: "20px" }}>
                {result.recommendation}
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <a href="/#login" style={{ flex: 1, display: "block", textAlign: "center", padding: "12px", background: G.blue, color: "#fff", borderRadius: "8px", textDecoration: "none", fontWeight: 700, fontSize: "14px" }}>
                  Corriger ça avec Caela Réputation →
                </a>
                <a href="mailto:contact@caela.fr" style={{ padding: "12px 16px", background: "#F8F9FA", color: "#5F6368", borderRadius: "8px", textDecoration: "none", fontWeight: 600, fontSize: "13px", border: "1px solid #DADCE0" }}>
                  Nous contacter
                </a>
              </div>
              <p style={{ fontSize: "11px", color: "#80868B", textAlign: "center", margin: "12px 0 0" }}>Rapport envoyé à {email}</p>
            </div>
          )}
        </div>
      </section>

      <footer style={{ borderTop: "1px solid #DADCE0", padding: "20px 24px", textAlign: "center" }}>
        <p style={{ fontSize: "12px", color: "#80868B", margin: 0 }}>
          © 2026 Caela Réputation by Caela Agency ·{" "}
          <a href="mailto:contact@caela.fr" style={{ color: G.blue, textDecoration: "none" }}>contact@caela.fr</a>
          {" · "}Outil indépendant, non affilié à Google LLC.
        </p>
      </footer>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 14px", border: "1px solid #DADCE0",
  borderRadius: "8px", fontSize: "14px", color: "#202124", outline: "none",
  fontFamily: "inherit", boxSizing: "border-box", transition: "border-color 0.15s",
};

function btnStyle(bg: string): React.CSSProperties {
  return {
    padding: "14px", background: bg, color: "#fff", border: "none",
    borderRadius: "10px", fontWeight: 700, fontSize: "15px",
    cursor: bg === "#DADCE0" ? "not-allowed" : "pointer",
    fontFamily: "inherit",
    boxShadow: bg === "#DADCE0" ? "none" : `0 4px 16px ${bg}40`,
  };
}
