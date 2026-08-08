"use client";

import { useState, useEffect } from "react";
import { entity } from "@/config/legal.config";

const G = { blue: "#1A73E8", red: "#EA4335", yellow: "#FBBC04", green: "#34A853" };
const SHADOW = "0 2px 8px rgba(60,64,67,0.15), 0 1px 4px rgba(60,64,67,0.1)";

type ReferralState =
  | { status: "loading" }
  | { status: "anon" }
  | { status: "ineligible" }
  | { status: "ready"; code: string; referredCount: number; rewardedCount: number };

export default function ParrainageClient() {
  const [copied, setCopied] = useState(false);
  // Le code vient TOUJOURS de /api/referral/me (persisté en base côté
  // compte connecté) — jamais généré côté client. Trois états distincts
  // (chargement / non connecté / prêt) pour ne jamais confondre "vide" et
  // "pas encore chargé".
  const [state, setState] = useState<ReferralState>({ status: "loading" });

  useEffect(() => {
    fetch("/api/referral/me")
      .then(async (res) => {
        if (res.status === 401) return setState({ status: "anon" });
        const data = await res.json();
        if (!data.eligible) return setState({ status: "ineligible" });
        setState({ status: "ready", code: data.code, referredCount: data.referredCount, rewardedCount: data.rewardedCount });
      })
      .catch(() => setState({ status: "anon" }));
  }, []);

  const code = state.status === "ready" ? state.code : "";

  function copyCode() {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

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
        <a href="/dashboard" style={{ fontSize: "13px", color: "#5F6368", textDecoration: "none" }}>← Mon dashboard</a>
      </nav>

      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "64px 24px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎁</div>
          <h1 style={{ fontSize: "36px", fontWeight: 800, margin: "0 0 14px", color: "#202124" }}>
            Parrainez un ami,<br />
            <span style={{ color: G.blue }}>gagnez 1 mois offert</span>
          </h1>
          <p style={{ fontSize: "16px", color: "#5F6368", lineHeight: 1.7, margin: 0 }}>
            Pour chaque client que vous amenez, vous gagnez un mois d&apos;abonnement gratuit.
            Votre filleul bénéficie de 15% sur son premier mois.
          </p>
        </div>

        {/* How it works */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "48px" }}>
          {[
            { step: "1", icon: "🔗", title: "Partagez votre code", desc: "Envoyez votre code à un restaurateur, gérant ou artisan." },
            { step: "2", icon: "✅", title: "Il s'inscrit", desc: "Il crée son compte et saisit votre code lors de l'essai gratuit." },
            { step: "3", icon: "🎁", title: "Vous êtes payés", desc: "21 jours après son premier paiement, votre mois offert est crédité." },
          ].map(s => (
            <div key={s.step} style={{ background: "#F8F9FA", borderRadius: "14px", padding: "20px", border: "1px solid #DADCE0", textAlign: "center" }}>
              <div style={{ width: "32px", height: "32px", background: G.blue, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 800, color: "#fff", margin: "0 auto 12px" }}>{s.step}</div>
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>{s.icon}</div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#202124", marginBottom: "6px" }}>{s.title}</div>
              <div style={{ fontSize: "12px", color: "#5F6368", lineHeight: 1.5 }}>{s.desc}</div>
            </div>
          ))}
        </div>

        {/* Advantage boxes */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "40px" }}>
          <div style={{ background: "#E8F0FE", borderRadius: "14px", padding: "22px", border: "1px solid rgba(26,115,232,0.2)" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: G.blue, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Vous (le parrain)</div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "#202124", marginBottom: "4px" }}>1 mois offert</div>
            <div style={{ fontSize: "13px", color: "#5F6368" }}>Jusqu&apos;à 149€ de valeur selon votre plan. Crédité automatiquement.</div>
          </div>
          <div style={{ background: "#E6F4EA", borderRadius: "14px", padding: "22px", border: "1px solid rgba(52,168,83,0.2)" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: G.green, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Votre filleul</div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "#202124", marginBottom: "4px" }}>-15% mois 1</div>
            <div style={{ fontSize: "13px", color: "#5F6368" }}>Sur n&apos;importe quel plan. S&apos;applique après la période d&apos;essai gratuit.</div>
          </div>
        </div>

        {/* Code card */}
        <div style={{ background: "#fff", border: "2px solid #DADCE0", borderRadius: "16px", padding: "28px", boxShadow: SHADOW, marginBottom: "32px" }}>
          {state.status === "loading" && (
            <div style={{ padding: "24px 0", textAlign: "center", fontSize: "14px", color: "#80868B" }}>Chargement de votre code…</div>
          )}

          {state.status === "anon" && (
            <div style={{ textAlign: "center", padding: "12px 0" }}>
              <div style={{ fontSize: "14px", color: "#5F6368", marginBottom: "16px" }}>Connectez-vous pour récupérer votre code de parrainage personnel.</div>
              <a href="/signup" style={{ display: "inline-block", padding: "12px 24px", background: G.blue, color: "#fff", borderRadius: "8px", textDecoration: "none", fontWeight: 600, fontSize: "14px", marginRight: "10px" }}>Créer un compte</a>
              <a href="/#login" style={{ display: "inline-block", padding: "12px 24px", background: "#F8F9FA", color: "#202124", borderRadius: "8px", textDecoration: "none", fontWeight: 600, fontSize: "14px", border: "1px solid #DADCE0" }}>Se connecter</a>
            </div>
          )}

          {state.status === "ineligible" && (
            <div style={{ textAlign: "center", padding: "12px 0", fontSize: "14px", color: "#5F6368" }}>Le parrainage s&apos;applique aux comptes clients, pas aux comptes agence.</div>
          )}

          {state.status === "ready" && (
            <>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "#5F6368", marginBottom: "12px" }}>Votre code parrainage personnel :</div>
              <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "16px" }}>
                <div style={{ flex: 1, padding: "14px 20px", background: "#F8F9FA", borderRadius: "10px", border: "2px dashed #DADCE0", fontFamily: "monospace", fontSize: "22px", fontWeight: 800, color: "#202124", letterSpacing: "2px", textAlign: "center" }}>
                  {code}
                </div>
                <button onClick={copyCode} style={{
                  padding: "14px 20px", background: copied ? G.green : G.blue, color: "#fff", border: "none",
                  borderRadius: "10px", fontWeight: 700, fontSize: "14px", cursor: "pointer", fontFamily: "inherit",
                  flexShrink: 0, transition: "background 0.2s",
                }}>
                  {copied ? "✓ Copié !" : "Copier"}
                </button>
              </div>

              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "14px" }}>
                {[
                  { label: "📱 WhatsApp", href: `https://wa.me/?text=J'utilise Caela Réputation pour gérer mes avis Google automatiquement. Essaie avec mon code ${code} pour -15% : ${entity.siteUrl}` },
                  { label: "📧 Email", href: `mailto:?subject=Un outil pour tes avis Google&body=Utilise mon code ${code} pour -15% sur Caela Réputation.` },
                ].map(s => (
                  <a key={s.label} href={s.href} target="_blank" rel="noreferrer" style={{ padding: "8px 16px", background: "#F8F9FA", border: "1px solid #DADCE0", borderRadius: "8px", textDecoration: "none", fontSize: "13px", color: "#202124", fontWeight: 500 }}>
                    {s.label}
                  </a>
                ))}
              </div>

              <div style={{ fontSize: "12px", color: "#80868B" }}>
                {state.referredCount} filleul{state.referredCount !== 1 ? "s" : ""} inscrit{state.referredCount !== 1 ? "s" : ""} · {state.rewardedCount} mois offert{state.rewardedCount !== 1 ? "s" : ""} crédité{state.rewardedCount !== 1 ? "s" : ""}
              </div>
            </>
          )}
        </div>

        {/* Rules */}
        <div style={{ background: "#FEF7E0", border: "1px solid rgba(251,188,4,0.3)", borderRadius: "12px", padding: "18px 20px", marginBottom: "32px" }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "#202124", marginBottom: "10px" }}>⚠️ Conditions importantes</div>
          <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "13px", color: "#5F6368", lineHeight: 1.8 }}>
            <li>Le mois offert est crédité <strong>21 jours après le premier paiement</strong> du filleul (14j essai + 7j délai remboursement).</li>
            <li>Un email ne peut être filleul qu&apos;une seule fois.</li>
            <li>Le parrainage ne s&apos;applique pas aux comptes déjà inscrits.</li>
            <li>En cas d&apos;annulation du filleul avant J+21, aucun avantage n&apos;est accordé.</li>
            <li>Abus de parrainage (faux comptes) = suspension du compte parrain.</li>
          </ul>
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center" }}>
          <a href="/dashboard" style={{ display: "inline-block", padding: "12px 28px", background: "#F8F9FA", color: "#202124", borderRadius: "10px", textDecoration: "none", fontWeight: 600, fontSize: "14px", border: "1px solid #DADCE0" }}>
            ← Retour au dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
