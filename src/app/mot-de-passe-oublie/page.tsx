"use client";

import { useState } from "react";
import Link from "next/link";

const BLUE = "#1A73E8";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } finally {
      setSent(true);
      setBusy(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F8F9FA", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ maxWidth: 400, width: "100%", background: "#fff", border: "1px solid #DADCE0", borderRadius: 16, padding: 40, textAlign: "center" }}>
        <h1 style={{ margin: "0 0 5px", fontSize: 21, fontWeight: 700, color: "#202124" }}>Mot de passe oublié</h1>
        {sent ? (
          <p style={{ color: "#5F6368", fontSize: 14, marginTop: 20 }}>
            Si un compte existe avec cet email, un lien de réinitialisation vient d&apos;être envoyé. Vérifie ta boîte (et les spams).
          </p>
        ) : (
          <form onSubmit={submit} style={{ textAlign: "left", marginTop: 20 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#202124", marginBottom: 5 }}>Adresse email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus
              placeholder="vous@exemple.fr"
              style={{ width: "100%", padding: "11px 14px", border: "1px solid #DADCE0", borderRadius: 6, fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 16 }}
            />
            <button type="submit" disabled={busy} style={{ width: "100%", padding: 12, background: BLUE, border: "none", borderRadius: 6, color: "#fff", fontSize: 14, fontWeight: 600, cursor: busy ? "not-allowed" : "pointer" }}>
              {busy ? "Envoi..." : "Envoyer le lien"}
            </button>
          </form>
        )}
        <p style={{ fontSize: 13, color: "#5F6368", marginTop: 20 }}>
          <Link href="/#login" style={{ color: BLUE, fontWeight: 600, textDecoration: "none" }}>Retour à la connexion</Link>
        </p>
      </div>
    </div>
  );
}
