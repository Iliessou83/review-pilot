"use client";

import { useState } from "react";

const G = { blue: "#1A73E8", green: "#34A853", grey: "#5F6368", red: "#EA4335", purple: "#7C3AED" };

/**
 * Mêmes 3 formules, mêmes chiffres que la page publique (src/app/HomeClient.tsx
 * `PLANS`) : Starter 29€, Solo 69€ (mise en avant), Pro 149€. On ne veut jamais
 * afficher un prix différent entre la landing et le dashboard.
 */
const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 29,
    annual: 23,
    desc: "1 établissement",
    color: G.green,
    best: "Moins de 30 avis/mois — débutez sans risque",
    features: [
      "1 établissement connecté",
      "Surveillance des avis 24/7",
      "3 suggestions IA par avis négatif",
      "Notifications email instantanées",
      "Dashboard centralisé",
    ],
    highlight: false,
  },
  {
    id: "solo",
    name: "Solo",
    price: 69,
    annual: 55,
    desc: "1 établissement",
    color: G.blue,
    best: "Restaurant, commerce — le plus populaire",
    features: [
      "1 établissement connecté",
      "Auto-réponse 4-5★ en 30 secondes",
      "3 suggestions IA + email 1-clic",
      "Rapport hebdomadaire par email",
      "Rappels avis sans réponse",
    ],
    highlight: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: 149,
    annual: 119,
    desc: "5 établissements",
    color: G.purple,
    best: "Chaîne locale, franchise 3-5 lieux",
    features: [
      "5 établissements connectés",
      "Tout Solo inclus",
      "Personnalisation du ton par lieu",
      "Multi-utilisateurs (3 accès)",
      "Support prioritaire",
    ],
    highlight: false,
  },
];

const REASSURANCES = [
  { icon: "🔒", text: "Paiement sécurisé" },
  { icon: "🚪", text: "Sans engagement, résiliable en 2 clics" },
  { icon: "⚡", text: "Activation immédiate" },
];

export default function PlanTiers({ currentPlanId, email }: { currentPlanId?: string; email: string }) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState(false);

  async function choose(planId: string) {
    setBusy(planId);
    setNotice(false);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, email }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      // Le paiement en ligne n'est pas encore branché (clés Stripe en attente) :
      // on ne montre jamais l'erreur technique, juste un message rassurant.
      setNotice(true);
    } catch {
      setNotice(true);
    }
    setBusy("");
  }

  return (
    <div id="tarifs" style={{ scrollMarginTop: "24px" }}>
      <div style={{ textAlign: "center", marginBottom: "8px" }}>
        <span style={{ display: "inline-block", padding: "4px 12px", background: "#E8F0FE", borderRadius: "999px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: G.blue, marginBottom: "12px" }}>
          Tarifs
        </span>
        <h2 style={{ margin: "0 0 6px", fontSize: "22px", fontWeight: 700, color: "#202124" }}>
          {currentPlanId ? "Changer de formule" : "Choisis ta formule pour démarrer"}
        </h2>
        <p style={{ margin: "0 0 20px", fontSize: "14px", color: G.grey }}>
          Sans engagement. Résiliable à tout moment en 2 clics.
        </p>
        <div style={{ display: "inline-flex", background: "#F8F9FA", border: "1px solid #DADCE0", borderRadius: "8px", padding: "3px", gap: "2px" }}>
          {(["monthly", "annual"] as const).map((b) => (
            <button
              key={b}
              onClick={() => setBillingCycle(b)}
              style={{
                padding: "8px 18px", borderRadius: "6px", border: "none", cursor: "pointer",
                fontSize: "13px", fontWeight: 500, fontFamily: "inherit",
                background: billingCycle === b ? G.blue : "transparent",
                color: billingCycle === b ? "#fff" : G.grey,
              }}
            >
              {b === "monthly" ? "Mensuel" : <span>Annuel <span style={{ color: billingCycle === b ? "#bef7d7" : G.green, fontSize: "11px", fontWeight: 700 }}>-20%</span></span>}
            </button>
          ))}
        </div>
      </div>

      {notice && (
        <div style={{ maxWidth: "480px", margin: "20px auto 0", padding: "14px 18px", background: "#E8F0FE", border: "1px solid #C2D9FB", borderRadius: "10px", textAlign: "center" }}>
          <p style={{ margin: "0 0 8px", fontSize: "13px", color: "#174ea6", lineHeight: 1.6 }}>
            Le paiement en ligne arrive très bientôt. Écris-nous pour changer de formule dès maintenant.
          </p>
          <a
            href={`mailto:contact@caela.fr?subject=${encodeURIComponent("Changer de formule Caela Réputation")}&body=${encodeURIComponent(`Bonjour, je souhaite changer de formule pour mon compte ${email}.`)}`}
            style={{ display: "inline-block", fontSize: "13px", fontWeight: 700, color: G.blue, textDecoration: "none" }}
          >
            contact@caela.fr →
          </a>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", alignItems: "start", marginTop: "28px" }}>
        {PLANS.map((plan) => {
          const price = billingCycle === "annual" ? plan.annual : plan.price;
          const savings = plan.price * 12 - plan.annual * 12;
          const isCurrent = currentPlanId === plan.id;
          return (
            <div
              key={plan.id}
              style={{
                background: plan.highlight ? `linear-gradient(180deg, ${plan.color}08 0%, #fff 60%)` : "#fff",
                border: plan.highlight ? `2px solid ${plan.color}` : "1px solid #DADCE0",
                borderRadius: "14px",
                padding: plan.highlight ? "30px 20px 22px" : "24px 20px",
                boxShadow: plan.highlight ? `0 12px 28px ${plan.color}28` : "0 1px 3px rgba(60,64,67,0.12)",
                position: "relative",
                overflow: "hidden",
                transform: plan.highlight ? "translateY(-10px)" : "none",
                zIndex: plan.highlight ? 1 : 0,
              }}
            >
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: plan.color }} />
              {plan.highlight && (
                <div style={{ position: "absolute", top: "12px", right: "14px", padding: "2px 8px", background: plan.color + "15", borderRadius: "20px", fontSize: "9px", fontWeight: 700, color: plan.color }}>
                  LE PLUS CHOISI
                </div>
              )}
              <p style={{ margin: "0 0 2px", fontSize: "11px", fontWeight: 700, color: plan.color, textTransform: "uppercase", letterSpacing: "0.5px" }}>{plan.name}</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: "3px", marginBottom: "3px" }}>
                <span style={{ fontSize: "32px", fontWeight: 700, color: "#202124", letterSpacing: "-1px" }}>{price}€</span>
                <span style={{ fontSize: "12px", color: G.grey }}>/mois</span>
              </div>
              <p style={{ margin: "0 0 4px", fontSize: "12px", color: G.grey }}>{plan.desc}</p>
              {billingCycle === "annual" && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "2px 8px", background: "#E6F4EA", borderRadius: "20px", fontSize: "11px", fontWeight: 700, color: G.green, marginBottom: "8px" }}>
                  🎁 -{savings}€/an
                </div>
              )}
              <div style={{ fontSize: "11px", color: plan.color, marginBottom: "14px", fontWeight: 500 }}>{plan.best}</div>

              <div style={{ display: "flex", flexDirection: "column", gap: "7px", marginBottom: "18px" }}>
                {plan.features.map((f) => (
                  <div key={f} style={{ display: "flex", gap: "7px" }}>
                    <span style={{ color: plan.color, fontWeight: 700, fontSize: "12px", flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: "12px", color: G.grey, lineHeight: 1.4 }}>{f}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => choose(plan.id)}
                disabled={busy === plan.id || isCurrent}
                style={{
                  width: "100%", textAlign: "center", padding: "10px",
                  background: isCurrent ? "#F8F9FA" : plan.highlight ? plan.color : plan.color + "12",
                  border: `1px solid ${isCurrent ? "#DADCE0" : plan.highlight ? plan.color + "00" : plan.color + "25"}`,
                  borderRadius: "6px",
                  color: isCurrent ? G.grey : plan.highlight ? "#fff" : plan.color,
                  fontSize: "13px", fontWeight: 600, fontFamily: "inherit",
                  cursor: isCurrent ? "default" : busy === plan.id ? "default" : "pointer",
                  opacity: busy === plan.id ? 0.6 : 1,
                }}
              >
                {isCurrent ? "Formule actuelle" : busy === plan.id ? "..." : currentPlanId ? `Passer à ${plan.name}` : `Choisir ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: "16px", textAlign: "center" }}>
        <span style={{ fontSize: "13px", color: "#80868B" }}>
          Vous gérez 5+ établissements ?{" "}
          <a href="mailto:contact@caela.fr?subject=Plan%20Agence" style={{ color: G.blue, textDecoration: "none", fontWeight: 600 }}>
            Plan Agence à partir de 449€/mois →
          </a>
        </span>
      </div>

      <div style={{ marginTop: "24px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "10px 28px" }}>
        {REASSURANCES.map(({ icon, text }) => (
          <div key={text} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: G.grey }}>
            <span>{icon}</span>
            <span>{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
