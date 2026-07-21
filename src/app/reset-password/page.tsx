"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const BLUE = "#1A73E8";
const RED = "#EA4335";

function ResetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("6 caractères minimum."); return; }
    if (password !== confirm) { setError("Les deux mots de passe ne correspondent pas."); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Erreur"); setBusy(false); return; }
      setDone(true);
      setTimeout(() => router.push("/#login"), 2000);
    } catch {
      setError("Impossible d'enregistrer le mot de passe.");
      setBusy(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F8F9FA", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ maxWidth: 400, width: "100%", background: "#fff", border: "1px solid #DADCE0", borderRadius: 16, padding: 40, textAlign: "center" }}>
        <h1 style={{ margin: "0 0 5px", fontSize: 21, fontWeight: 700, color: "#202124" }}>Nouveau mot de passe</h1>
        {!token ? (
          <p style={{ color: "#5F6368", fontSize: 14, marginTop: 20 }}>Lien invalide. Redemande un email depuis la page de connexion.</p>
        ) : done ? (
          <p style={{ color: "#5F6368", fontSize: 14, marginTop: 20 }}>Mot de passe mis à jour. Redirection…</p>
        ) : (
          <form onSubmit={submit} style={{ textAlign: "left", marginTop: 20 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#202124", marginBottom: 5 }}>Nouveau mot de passe</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} autoFocus
              style={{ width: "100%", padding: "11px 14px", border: "1px solid #DADCE0", borderRadius: 6, fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 14 }}
            />
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#202124", marginBottom: 5 }}>Confirmer</label>
            <input
              type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required minLength={6}
              style={{ width: "100%", padding: "11px 14px", border: "1px solid #DADCE0", borderRadius: 6, fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 16 }}
            />
            {error && <div style={{ padding: "10px 14px", background: "#FCE8E6", borderRadius: 6, color: RED, fontSize: 13, marginBottom: 14 }}>⚠ {error}</div>}
            <button type="submit" disabled={busy} style={{ width: "100%", padding: 12, background: BLUE, border: "none", borderRadius: 6, color: "#fff", fontSize: 14, fontWeight: 600, cursor: busy ? "not-allowed" : "pointer" }}>
              {busy ? "Enregistrement..." : "Enregistrer"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
