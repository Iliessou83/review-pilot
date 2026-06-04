"use client";

import { useState } from "react";

const G = { blue: "#1A73E8", red: "#EA4335", yellow: "#FBBC04", green: "#34A853" };
const SHADOW = "0 2px 8px rgba(60,64,67,0.15), 0 1px 4px rgba(60,64,67,0.1)";

const CRITERIA = [
  { icon: "⭐", label: "Note Google" },
  { icon: "💬", label: "Taux de réponse aux avis" },
  { icon: "📸", label: "Photos de la fiche" },
  { icon: "📝", label: "Description & catégories" },
  { icon: "🕐", label: "Horaires & informations" },
  { icon: "📊", label: "Posts & activité récente" },
];

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

export default function AuditPage() {
  const [form, setForm] = useState({ name: "", city: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.city || !form.email) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      setResult(data);
      setSent(true);
    } catch {
      setError("Une erreur est survenue. Réessayez ou contactez contact@caela.fr");
    } finally {
      setLoading(false);
    }
  }

  const scoreColor = (s: number) => s >= 75 ? G.green : s >= 50 ? G.yellow : G.red;
  const scoreLabel = (s: number) => s >= 75 ? "Bonne réputation" : s >= 50 ? "À améliorer" : "Urgent";

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

      {/* Hero */}
      <section style={{ background: "linear-gradient(160deg, #fff 0%, #F8F9FA 60%, #E8F0FE 100%)", padding: "72px 24px 56px" }}>
        <div style={{ maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 14px", background: "#E8F0FE", borderRadius: "24px", fontSize: "12px", fontWeight: 600, color: G.blue, marginBottom: "20px" }}>
            <span>🔍</span> Audit gratuit — résultat en 30 secondes
          </div>
          <h1 style={{ fontSize: "clamp(26px, 4vw, 44px)", fontWeight: 800, lineHeight: 1.15, color: "#202124", margin: "0 0 18px" }}>
            Votre fiche Google est-elle{" "}
            <span style={{ color: G.blue }}>optimisée ?</span>
          </h1>
          <p style={{ fontSize: "17px", color: "#5F6368", lineHeight: 1.7, margin: "0 0 12px", maxWidth: "560px", marginLeft: "auto", marginRight: "auto" }}>
            On analyse votre fiche Google Business en temps réel et on vous envoie un rapport avec votre score et les 3 actions prioritaires.
          </p>
          <p style={{ fontSize: "13px", color: "#80868B", margin: "0 0 40px" }}>Gratuit. Sans inscription. Sans carte bancaire.</p>

          {/* Criteria chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center", marginBottom: "48px" }}>
            {CRITERIA.map(c => (
              <span key={c.label} style={{ padding: "6px 14px", background: "#fff", border: "1px solid #DADCE0", borderRadius: "20px", fontSize: "12px", color: "#5F6368", display: "flex", alignItems: "center", gap: "5px" }}>
                {c.icon} {c.label}
              </span>
            ))}
          </div>

          {/* Form */}
          {!sent ? (
            <form onSubmit={handleSubmit} style={{ background: "#fff", borderRadius: "20px", padding: "36px 40px", boxShadow: SHADOW, border: "1px solid #DADCE0", maxWidth: "520px", margin: "0 auto", textAlign: "left" }}>
              <h2 style={{ margin: "0 0 24px", fontSize: "18px", fontWeight: 700, color: "#202124" }}>Analysez votre fiche maintenant</h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "13px", fontWeight: 600, color: "#202124", display: "block", marginBottom: "6px" }}>
                    Nom de votre établissement *
                  </label>
                  <input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Restaurant Le Cèdre, Salon Nath Beauté..."
                    required
                    style={{ width: "100%", padding: "11px 14px", border: "1px solid #DADCE0", borderRadius: "8px", fontSize: "14px", color: "#202124", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                    onFocus={e => { e.target.style.borderColor = G.blue; e.target.style.boxShadow = `0 0 0 3px ${G.blue}18`; }}
                    onBlur={e => { e.target.style.borderColor = "#DADCE0"; e.target.style.boxShadow = "none"; }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "13px", fontWeight: 600, color: "#202124", display: "block", marginBottom: "6px" }}>
                    Ville *
                  </label>
                  <input
                    value={form.city}
                    onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                    placeholder="Lyon, Paris, Marseille..."
                    required
                    style={{ width: "100%", padding: "11px 14px", border: "1px solid #DADCE0", borderRadius: "8px", fontSize: "14px", color: "#202124", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                    onFocus={e => { e.target.style.borderColor = G.blue; e.target.style.boxShadow = `0 0 0 3px ${G.blue}18`; }}
                    onBlur={e => { e.target.style.borderColor = "#DADCE0"; e.target.style.boxShadow = "none"; }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "13px", fontWeight: 600, color: "#202124", display: "block", marginBottom: "6px" }}>
                    Email pour recevoir le rapport *
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="vous@exemple.fr"
                    required
                    style={{ width: "100%", padding: "11px 14px", border: "1px solid #DADCE0", borderRadius: "8px", fontSize: "14px", color: "#202124", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                    onFocus={e => { e.target.style.borderColor = G.blue; e.target.style.boxShadow = `0 0 0 3px ${G.blue}18`; }}
                    onBlur={e => { e.target.style.borderColor = "#DADCE0"; e.target.style.boxShadow = "none"; }}
                  />
                </div>

                {error && (
                  <div style={{ padding: "10px 14px", background: "#FCE8E6", borderRadius: "8px", fontSize: "13px", color: G.red }}>
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading} style={{
                  padding: "14px", background: loading ? "#DADCE0" : G.blue, color: "#fff", border: "none",
                  borderRadius: "10px", fontWeight: 700, fontSize: "15px", cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: "inherit", boxShadow: loading ? "none" : `0 4px 16px ${G.blue}40`,
                }}>
                  {loading ? "Analyse en cours..." : "Analyser ma fiche gratuitement →"}
                </button>
                <p style={{ fontSize: "11px", color: "#80868B", textAlign: "center", margin: 0 }}>
                  Votre email ne sera jamais partagé. Vous recevrez uniquement ce rapport.
                </p>
              </div>
            </form>
          ) : result && (
            /* Result card */
            <div style={{ background: "#fff", borderRadius: "20px", padding: "36px 40px", boxShadow: SHADOW, border: "1px solid #DADCE0", maxWidth: "560px", margin: "0 auto", textAlign: "left" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
                <div>
                  <h2 style={{ margin: "0 0 4px", fontSize: "20px", fontWeight: 800, color: "#202124" }}>{result.businessName}</h2>
                  {result.found && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ color: G.yellow, fontSize: "14px" }}>{"★".repeat(Math.round(result.rating))}</span>
                      <span style={{ fontSize: "13px", color: "#5F6368" }}>{result.rating.toFixed(1)} · {result.reviewCount} avis</span>
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
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", background: ins.status === "good" ? "#E6F4EA" : ins.status === "warn" ? "#FEF7E0" : "#FCE8E6", borderRadius: "8px" }}>
                    <span style={{ fontSize: "14px" }}>{ins.status === "good" ? "✅" : ins.status === "warn" ? "⚠️" : "❌"}</span>
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
                      <span style={{ color: G.blue, fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                      {p}
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
                <a href="mailto:contact@caela.fr?subject=Audit fiche Google" style={{ padding: "12px 16px", background: "#F8F9FA", color: "#5F6368", borderRadius: "8px", textDecoration: "none", fontWeight: 600, fontSize: "13px", border: "1px solid #DADCE0" }}>
                  Nous contacter
                </a>
              </div>

              <p style={{ fontSize: "11px", color: "#80868B", textAlign: "center", margin: "12px 0 0" }}>
                Rapport envoyé à {form.email}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Social proof */}
      <section style={{ padding: "64px 24px", borderTop: "1px solid #DADCE0" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: "14px", color: "#80868B", marginBottom: "32px" }}>Plus de 500 fiches analysées ce mois</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
            {[
              { stat: "Score moyen des fiches analysées", value: "52/100", sub: "La moitié des fiches est sous-optimisée", color: G.yellow },
              { stat: "Taux de réponse moyen constaté", value: "34%", sub: "La norme Google recommande >90%", color: G.red },
              { stat: "Amélioration note après optimisation", value: "+0.4★", sub: "En 30 jours avec notre accompagnement", color: G.green },
            ].map((s, i) => (
              <div key={i} style={{ background: "#F8F9FA", borderRadius: "12px", padding: "24px", border: "1px solid #DADCE0" }}>
                <div style={{ fontSize: "32px", fontWeight: 800, color: s.color, marginBottom: "4px" }}>{s.value}</div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#202124", marginBottom: "4px" }}>{s.stat}</div>
                <div style={{ fontSize: "12px", color: "#80868B" }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer style={{ borderTop: "1px solid #DADCE0", padding: "20px 24px", textAlign: "center" }}>
        <p style={{ fontSize: "12px", color: "#80868B", margin: 0 }}>
          © 2026 Caela Réputation by Caela Agency ·{" "}
          <a href="mailto:contact@caela.fr" style={{ color: G.blue, textDecoration: "none" }}>contact@caela.fr</a>
          {" · "}
          <a href="/cgv" style={{ color: "#80868B", textDecoration: "none" }}>CGV</a>
          {" · "}Outil indépendant, non affilié à Google LLC.
        </p>
      </footer>
    </div>
  );
}
