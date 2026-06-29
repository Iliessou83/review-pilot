"use client";

import { useState } from "react";

/**
 * Résiliation en 2 clics : bouton -> confirmation -> POST.
 * Satisfait l'obligation "résilier aussi simple que souscrire" (L215-1-1).
 */
export default function CancelButton({ alreadyCancelled }: { alreadyCancelled: boolean }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(alreadyCancelled);
  const [error, setError] = useState("");

  async function cancel() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/billing/cancel", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <p style={{ fontSize: "14px", color: "#34A853", fontWeight: 600, margin: 0 }}>
        ✓ Résiliation enregistrée. Aucun nouveau prélèvement. Vous gardez l&apos;accès jusqu&apos;à la date d&apos;échéance.
      </p>
    );
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        style={{
          padding: "10px 18px", background: "#fff", border: "1px solid #DADCE0",
          color: "#5F6368", borderRadius: "6px", fontSize: "14px", fontWeight: 600, cursor: "pointer",
        }}
      >
        Résilier mon abonnement
      </button>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <p style={{ fontSize: "14px", color: "#202124", margin: 0 }}>
        Confirmer la résiliation ? Aucun prélèvement ne sera effectué. L&apos;accès reste actif jusqu&apos;à la date d&apos;échéance.
      </p>
      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={cancel}
          disabled={loading}
          style={{
            padding: "10px 18px", background: "#EA4335", border: "none",
            color: "#fff", borderRadius: "6px", fontSize: "14px", fontWeight: 600,
            cursor: loading ? "default" : "pointer", opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Résiliation…" : "Oui, résilier"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          style={{
            padding: "10px 18px", background: "#fff", border: "1px solid #DADCE0",
            color: "#5F6368", borderRadius: "6px", fontSize: "14px", fontWeight: 600, cursor: "pointer",
          }}
        >
          Garder mon abonnement
        </button>
      </div>
      {error && <p style={{ fontSize: "13px", color: "#EA4335", margin: 0 }}>{error}</p>}
    </div>
  );
}
