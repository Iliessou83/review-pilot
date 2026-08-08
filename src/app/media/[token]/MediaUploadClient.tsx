"use client";

import { useRef, useState } from "react";

export default function MediaUploadClient({ token, businessName }: { token: string; businessName: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState("");
  const [sending, setSending] = useState(false);
  const [sentCount, setSentCount] = useState(0);
  const [erreur, setErreur] = useState<string | null>(null);

  async function envoyer() {
    const file = inputRef.current?.files?.[0];
    if (!file) {
      setErreur("Choisissez d'abord une photo ou une vidéo.");
      return;
    }
    setSending(true);
    setErreur(null);
    try {
      const form = new FormData();
      form.set("file", file);
      form.set("caption", caption);
      const res = await fetch(`/api/media-upload?token=${encodeURIComponent(token)}`, { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Envoi impossible");
      setSentCount((n) => n + 1);
      setCaption("");
      if (inputRef.current) inputRef.current.value = "";
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Envoi impossible");
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0b0d10", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 420, background: "#15181d", borderRadius: 20, padding: 28, color: "#fff" }}>
        <div style={{ fontSize: 13, color: "#9aa3af", marginBottom: 4 }}>{businessName}</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 8px" }}>Envoyez-nous une photo ou une vidéo</h1>
        <p style={{ fontSize: 14, color: "#9aa3af", margin: "0 0 20px" }}>
          On s&apos;en sert pour publier sur votre fiche Google. Vous pouvez en envoyer plusieurs, une par une.
        </p>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,video/mp4,video/quicktime,video/webm"
          style={{ width: "100%", marginBottom: 14, color: "#fff" }}
        />
        <textarea
          placeholder="Un mot sur ce que ça montre (optionnel)"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={3}
          style={{ width: "100%", borderRadius: 12, border: "1px solid #2a2f37", background: "#0b0d10", color: "#fff", padding: 12, marginBottom: 14, resize: "vertical" }}
        />
        {erreur && <div style={{ color: "#f87171", fontSize: 13, marginBottom: 12 }}>{erreur}</div>}
        <button
          onClick={envoyer}
          disabled={sending}
          style={{ width: "100%", padding: "14px 0", borderRadius: 999, border: "none", background: "#22c55e", color: "#04240f", fontWeight: 800, fontSize: 15, cursor: sending ? "default" : "pointer", opacity: sending ? 0.7 : 1 }}
        >
          {sending ? "Envoi…" : "Envoyer"}
        </button>
        {sentCount > 0 && (
          <div style={{ marginTop: 14, fontSize: 13, color: "#4ade80" }}>
            {sentCount} envoyé{sentCount > 1 ? "s" : ""}. Vous pouvez en ajouter un autre.
          </div>
        )}
      </div>
    </div>
  );
}
