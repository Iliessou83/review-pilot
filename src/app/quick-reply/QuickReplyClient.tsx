"use client";

import { useState } from "react";

export default function QuickReplyClient({
  token,
  businessName,
  authorName,
  rating,
  reviewText,
  responseText,
  alreadySent,
}: {
  token: string;
  businessName: string;
  authorName: string;
  rating: number;
  reviewText: string;
  responseText: string;
  alreadySent: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function publish() {
    setLoading(true);
    setError(null);
    const response = await fetch("/api/quick-reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    if (response.ok) {
      window.location.href = "/quick-reply/success";
      return;
    }
    const data = await response.json().catch(() => ({})) as { error?: string };
    setError(data.error || "La publication a échoué. Réessayez.");
    setLoading(false);
  }

  return (
    <main style={{ minHeight: "100vh", background: "#fff", fontFamily: "'Google Sans', system-ui, sans-serif", padding: "32px 20px", color: "#202124" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <p style={{ color: "#1A73E8", fontWeight: 700, fontSize: 15 }}>Caela Réputation</p>
        <h1 style={{ fontSize: 28, margin: "24px 0 8px" }}>Confirmer la publication</h1>
        <p style={{ color: "#5F6368", lineHeight: 1.6 }}>
          Le clic dans l&apos;email n&apos;a rien publié. Vérifiez le contenu puis confirmez explicitement.
        </p>

        <section style={{ marginTop: 28, padding: 20, border: "1px solid #DADCE0", borderRadius: 12, background: "#F8F9FA" }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>{businessName} · {authorName} · {"★".repeat(Math.max(0, Math.min(5, rating)))}</div>
          <p style={{ margin: 0, color: "#5F6368", fontStyle: "italic", lineHeight: 1.6 }}>“{reviewText || "Avis sans commentaire"}”</p>
        </section>

        <section style={{ marginTop: 16, padding: 20, border: "1px solid #A8D5B5", borderRadius: 12, background: "#E6F4EA" }}>
          <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 700, color: "#137333" }}>Réponse proposée</p>
          <p style={{ margin: 0, lineHeight: 1.6 }}>{responseText}</p>
        </section>

        {error && <p style={{ marginTop: 18, padding: 12, borderRadius: 8, background: "#FCE8E6", color: "#C5221F" }}>{error}</p>}

        {alreadySent ? (
          <p style={{ marginTop: 24, color: "#137333", fontWeight: 600 }}>Cette réponse a déjà été publiée.</p>
        ) : (
          <button onClick={publish} disabled={loading} style={{ marginTop: 24, width: "100%", padding: "14px 18px", border: 0, borderRadius: 8, background: loading ? "#9AA0A6" : "#1A73E8", color: "#fff", fontWeight: 700, fontSize: 15, cursor: loading ? "wait" : "pointer" }}>
            {loading ? "Publication en cours…" : "Confirmer et publier la réponse"}
          </button>
        )}
      </div>
    </main>
  );
}
