"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const G = { blue: "#1A73E8", red: "#EA4335", yellow: "#FBBC04", green: "#34A853" };
const SHADOW = "0 2px 6px rgba(60,64,67,0.15), 0 1px 4px rgba(60,64,67,0.1)";
const KNOWN_PLANS = ["starter", "solo", "pro", "studio"];

function GDots({ size = 10 }: { size?: number }) {
  return (
    <div style={{ display: "flex", gap: size * 0.35 }}>
      {[G.blue, G.red, G.yellow, G.green].map((c, i) => (
        <div key={i} style={{ width: size, height: size, borderRadius: "50%", background: c }} />
      ))}
    </div>
  );
}

export default function SignupClient() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [existingModules, setExistingModules] = useState<string[] | null>(null);
  const [referralCode, setReferralCode] = useState("");
  const [planId, setPlanId] = useState("solo");

  // Pré-remplit depuis un lien de parrainage partagé (?ref=CAELA-XXXXXX) et
  // retient la formule choisie sur la page de tarifs (?plan=solo). Lu côté
  // client uniquement (comme safeNext() sur la page d'accueil) pour ne pas
  // forcer cette page en rendu dynamique côté serveur.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) setReferralCode(ref.toUpperCase());
    const plan = params.get("plan")?.toLowerCase();
    if (plan && KNOWN_PLANS.includes(plan)) setPlanId(plan);
  }, []);

  // Carte bancaire obligatoire dès l'inscription (voir CGV art. 5) : une fois
  // le compte créé, on enchaîne directement sur le Checkout Stripe — jamais
  // de retour au dashboard sans être passé par cette étape. Si la session
  // Stripe ne peut pas être créée (clés absentes, panne réseau), on bloque
  // avec un message clair plutôt que de laisser filer vers un accès gratuit
  // non prévu par les CGV.
  async function handleSubmit(e: React.FormEvent, confirmSeparate = false) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, confirmSeparate, referralCode: referralCode || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        if (data.needsLink) {
          setExistingModules(data.existingModules ?? []);
          setLoading(false);
          return;
        }
        try {
          const checkoutRes = await fetch("/api/billing/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ planId, email }),
          });
          const checkoutData = await checkoutRes.json().catch(() => ({}));
          if (checkoutRes.ok && checkoutData.url) {
            window.location.href = checkoutData.url;
            return;
          }
          setError(
            "Votre compte est créé, mais le paiement n'est pas disponible pour le moment. Connectez-vous et réessayez depuis Abonnement & facturation, ou écrivez-nous à support@caela.co."
          );
        } catch {
          setError(
            "Votre compte est créé, mais le paiement n'est pas disponible pour le moment. Connectez-vous et réessayez depuis Abonnement & facturation, ou écrivez-nous à support@caela.co."
          );
        }
      } else {
        setError(data.error || "Inscription impossible.");
      }
    } catch {
      setError("Erreur réseau. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  // Cette adresse a déjà un compte actif ailleurs dans l'écosystème Caela :
  // on prévient avant de créer un doublon, sans jamais bloquer la vente.
  if (existingModules) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(180deg,#F8F9FA,#fff)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", boxSizing: "border-box" }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 20 }}>
            <GDots size={11} />
            <span style={{ fontSize: 20, fontWeight: 700, color: "#202124", letterSpacing: "-0.3px" }}>Caela Réputation</span>
          </div>
          <div style={{ background: "#fff", border: "1px solid #DADCE0", borderRadius: 16, padding: "36px 32px", boxShadow: SHADOW, textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🧩</div>
            <h1 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 800, color: "#202124", letterSpacing: "-0.3px" }}>
              Tu fais déjà partie de l&apos;écosystème Caela
            </h1>
            <p style={{ margin: 0, color: "#5F6368", fontSize: 14, lineHeight: 1.5 }}>
              Cette adresse a déjà {existingModules.length > 1 ? "des comptes actifs" : "un compte actif"} sur{" "}
              <strong>{existingModules.join(", ")}</strong>. Connecte-toi avec ton compte Caela pour tout retrouver au même endroit.
            </p>
            <a
              href="https://caela-hub.vercel.app/api/sso/avis"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 20, padding: 13, background: G.blue, borderRadius: 10, color: "#fff", fontSize: 15, fontWeight: 700, textDecoration: "none", fontFamily: "inherit" }}
            >
              Se connecter avec Caela
            </a>
            <button
              onClick={(e) => handleSubmit(e as unknown as React.FormEvent, true)}
              disabled={loading}
              style={{ marginTop: 10, width: "100%", padding: 11, background: "transparent", border: "none", borderRadius: 8, color: "#5F6368", fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit" }}
            >
              {loading ? "..." : "Non, créer un compte Réputation séparé"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const fields = [
    { label: "Votre prénom", type: "text", value: name, setter: setName, placeholder: "Marie", required: false },
    { label: "Adresse email", type: "email", value: email, setter: setEmail, placeholder: "vous@exemple.fr", required: true },
    { label: "Mot de passe", type: "password", value: password, setter: setPassword, placeholder: "8 caractères minimum", required: true },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg,#F8F9FA,#fff)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", boxSizing: "border-box" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 20 }}>
          <GDots size={11} />
          <span style={{ fontSize: 20, fontWeight: 700, color: "#202124", letterSpacing: "-0.3px" }}>Caela Réputation</span>
        </div>

        <div style={{ background: "#fff", border: "1px solid #DADCE0", borderRadius: 16, padding: "36px 32px", boxShadow: SHADOW }}>
          <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, color: "#202124", letterSpacing: "-0.4px", textAlign: "center" }}>
            Créer votre compte
          </h1>
          <p style={{ margin: "0 0 24px", color: "#5F6368", fontSize: 14, textAlign: "center" }}>
            14 jours d&apos;essai gratuit, carte bancaire requise à l&apos;étape suivante. Aucun débit avant la fin de l&apos;essai.
          </p>

          <form onSubmit={handleSubmit}>
            {fields.map((f) => (
              <div key={f.label} style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#202124", marginBottom: 5 }}>{f.label}</label>
                <input
                  type={f.type} value={f.value} required={f.required}
                  onChange={(e) => f.setter(e.target.value)}
                  placeholder={f.placeholder}
                  autoComplete={f.type === "password" ? "new-password" : f.type === "email" ? "email" : "name"}
                  style={{ width: "100%", padding: "11px 14px", border: "1px solid #DADCE0", borderRadius: 8, fontSize: 14, color: "#202124", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                  onFocus={(e) => { e.target.style.borderColor = G.blue; e.target.style.boxShadow = `0 0 0 2px ${G.blue}20`; }}
                  onBlur={(e) => { e.target.style.borderColor = "#DADCE0"; e.target.style.boxShadow = "none"; }}
                />
              </div>
            ))}

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#202124", marginBottom: 5 }}>
                Code de parrainage <span style={{ color: "#80868B", fontWeight: 400 }}>(facultatif, -15% sur votre 1er mois)</span>
              </label>
              <input
                type="text" value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                placeholder="CAELA-XXXXXX"
                style={{ width: "100%", padding: "11px 14px", border: "1px solid #DADCE0", borderRadius: 8, fontSize: 14, color: "#202124", outline: "none", boxSizing: "border-box", fontFamily: "inherit", textTransform: "uppercase" }}
                onFocus={(e) => { e.target.style.borderColor = G.blue; e.target.style.boxShadow = `0 0 0 2px ${G.blue}20`; }}
                onBlur={(e) => { e.target.style.borderColor = "#DADCE0"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            {error && (
              <div style={{ padding: "10px 14px", background: "#FCE8E6", borderRadius: 8, color: G.red, fontSize: 13, marginBottom: 14 }}>⚠ {error}</div>
            )}

            <button type="submit" disabled={loading} style={{ width: "100%", padding: 12, background: loading ? `${G.blue}80` : G.blue, border: "none", borderRadius: 8, color: "#fff", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
              {loading ? "Création…" : "Continuer vers le paiement →"}
            </button>
          </form>

          <p style={{ margin: "16px 0 0", fontSize: 11, color: "#80868B", textAlign: "center", lineHeight: 1.5 }}>
            En créant un compte, vous acceptez nos{" "}
            <Link href="/cgv" style={{ color: "#5F6368" }}>CGV</Link> et notre{" "}
            <Link href="/politique-de-confidentialite" style={{ color: "#5F6368" }}>politique de confidentialité</Link>.
          </p>
        </div>

        <p style={{ textAlign: "center", marginTop: 18, fontSize: 14, color: "#5F6368" }}>
          Déjà un compte ?{" "}
          <Link href="/#login" style={{ color: G.blue, fontWeight: 600, textDecoration: "none" }}>Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
