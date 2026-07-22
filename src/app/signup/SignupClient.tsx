"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const G = { blue: "#1A73E8", red: "#EA4335", yellow: "#FBBC04", green: "#34A853" };
const SHADOW = "0 2px 6px rgba(60,64,67,0.15), 0 1px 4px rgba(60,64,67,0.1)";

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
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [existingModules, setExistingModules] = useState<string[] | null>(null);

  async function handleSubmit(e: React.FormEvent, confirmSeparate = false) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, confirmSeparate }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        if (data.needsLink) {
          setExistingModules(data.existingModules ?? []);
          setLoading(false);
          return;
        }
        router.push("/dashboard");
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
            14 jours d&apos;essai. Gérez vos avis Google en quelques minutes.
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

            {error && (
              <div style={{ padding: "10px 14px", background: "#FCE8E6", borderRadius: 8, color: G.red, fontSize: 13, marginBottom: 14 }}>⚠ {error}</div>
            )}

            <button type="submit" disabled={loading} style={{ width: "100%", padding: 12, background: loading ? `${G.blue}80` : G.blue, border: "none", borderRadius: 8, color: "#fff", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
              {loading ? "Création…" : "Créer mon compte"}
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
