"use client";

import { useCallback, useEffect, useState } from "react";

const G = { blue: "#1A73E8", red: "#EA4335", yellow: "#FBBC04", green: "#34A853" };
const SHADOW = "0 1px 3px rgba(60,64,67,0.12), 0 1px 2px rgba(60,64,67,0.06)";

type Business = { id: number; name: string; platform: string };
type Post = {
  id: number; content: string; mediaUrl: string | null; mediaType: "image" | "video" | null;
  source: "client" | "equipe"; status: "brouillon" | "pret" | "publie" | "echec";
  errorMessage: string | null; publishedAt: string | null;
};
type QnaItem = { question: string; reponse: string; postedOnGoogle: boolean };

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background: "#fff", border: "1px solid #DADCE0", borderRadius: 12, boxShadow: SHADOW, padding: 20, ...style }}>{children}</div>;
}

const STATUS_LABEL: Record<Post["status"], { text: string; color: string; bg: string }> = {
  brouillon: { text: "Brouillon", color: "#7A5900", bg: "#FEF7E0" },
  pret: { text: "Prêt à publier", color: G.blue, bg: "#E8F0FE" },
  publie: { text: "Publié ✓", color: G.green, bg: "#E6F4EA" },
  echec: { text: "Échec", color: G.red, bg: "#FCE8E6" },
};

export default function ContentPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [qna, setQna] = useState<QnaItem[]>([]);
  const [uploadToken, setUploadToken] = useState<string | null>(null);
  const [newContent, setNewContent] = useState("");
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    fetch("/api/businesses")
      .then((r) => (r.ok ? r.json() : []))
      .then((d: Business[]) => {
        const list = Array.isArray(d) ? d : [];
        setBusinesses(list);
        if (list.length) setSelected(list[0].id);
      })
      .catch(() => setBusinesses([]));
  }, []);

  const loadPosts = useCallback(async () => {
    if (!selected) return;
    const r = await fetch(`/api/posts?businessId=${selected}`);
    const d = await r.json();
    setPosts(Array.isArray(d) ? d : []);
  }, [selected]);

  const loadQna = useCallback(async () => {
    if (!selected) return;
    const r = await fetch(`/api/qna?businessId=${selected}`);
    const d = await r.json();
    setQna(Array.isArray(d.items) ? d.items : []);
  }, [selected]);

  useEffect(() => { loadPosts(); loadQna(); }, [loadPosts, loadQna]);

  async function getLink() {
    if (!selected) return;
    setBusy("lien");
    try {
      const r = await fetch(`/api/businesses/${selected}/media-token`, { method: "POST" });
      const d = await r.json();
      if (r.ok) setUploadToken(d.token);
    } finally { setBusy(""); }
  }

  async function createPost() {
    if (!selected || !newContent.trim()) return;
    setBusy("creer"); setMsg(null);
    try {
      const r = await fetch("/api/posts", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId: selected, content: newContent.trim() }),
      });
      if (!r.ok) throw new Error((await r.json()).error);
      setNewContent("");
      await loadPosts();
      setMsg({ text: "Brouillon créé.", ok: true });
    } catch (e) {
      setMsg({ text: e instanceof Error ? e.message : "Erreur", ok: false });
    } finally { setBusy(""); }
  }

  async function publish(id: number) {
    setBusy(`pub-${id}`); setMsg(null);
    try {
      const r = await fetch(`/api/posts/${id}/publish`, { method: "POST" });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setMsg({ text: "Publié sur Google.", ok: true });
      await loadPosts();
    } catch (e) {
      setMsg({ text: e instanceof Error ? e.message : "Échec de la publication", ok: false });
    } finally { setBusy(""); }
  }

  async function removePost(id: number) {
    setBusy(`del-${id}`);
    try {
      await fetch(`/api/posts/${id}`, { method: "DELETE" });
      await loadPosts();
    } finally { setBusy(""); }
  }

  async function generateQna() {
    if (!selected) return;
    setBusy("qna"); setMsg(null);
    try {
      const r = await fetch("/api/qna", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId: selected, generate: true }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setQna(d.items || []);
      setMsg({ text: "Suggestions générées. Relisez avant de les poster sur Google.", ok: true });
    } catch (e) {
      setMsg({ text: e instanceof Error ? e.message : "Génération impossible", ok: false });
    } finally { setBusy(""); }
  }

  async function saveQna(next: QnaItem[]) {
    if (!selected) return;
    setQna(next);
    await fetch("/api/qna", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId: selected, items: next }),
    });
  }

  const appUrl = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 20px" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: "#202124", marginBottom: 4 }}>Contenu GMB</h1>
      <p style={{ color: "#5F6368", fontSize: 14, marginBottom: 20 }}>
        Posts Google, lien d&apos;envoi photos/vidéos pour vos clients, stratégie Q&amp;A.
      </p>

      <select
        value={selected ?? ""}
        onChange={(e) => setSelected(Number(e.target.value))}
        style={{ marginBottom: 20, padding: "8px 12px", borderRadius: 8, border: "1px solid #DADCE0" }}
      >
        {businesses.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
      </select>

      {msg && (
        <div style={{ marginBottom: 16, padding: 12, borderRadius: 8, background: msg.ok ? "#E6F4EA" : "#FCE8E6", color: msg.ok ? G.green : G.red, fontSize: 13 }}>
          {msg.text}
        </div>
      )}

      <Card style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Lien pour recevoir photos/vidéos</div>
        {uploadToken ? (
          <div style={{ fontSize: 13, wordBreak: "break-all", color: G.blue }}>{appUrl}/media/{uploadToken}</div>
        ) : (
          <button onClick={getLink} disabled={busy === "lien"} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: G.blue, color: "#fff", fontSize: 13, fontWeight: 600 }}>
            {busy === "lien" ? "…" : "Obtenir le lien"}
          </button>
        )}
      </Card>

      <Card style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 700, marginBottom: 12 }}>Nouveau post</div>
        <textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="Texte du post…"
          rows={3}
          style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #DADCE0", marginBottom: 10, resize: "vertical" }}
        />
        <button onClick={createPost} disabled={busy === "creer"} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: G.green, color: "#fff", fontSize: 13, fontWeight: 600 }}>
          {busy === "creer" ? "…" : "Créer le brouillon"}
        </button>
      </Card>

      <Card style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 700, marginBottom: 12 }}>Posts ({posts.length})</div>
        {posts.length === 0 && <div style={{ color: "#5F6368", fontSize: 13 }}>Aucun post pour l&apos;instant.</div>}
        {posts.map((p) => {
          const s = STATUS_LABEL[p.status];
          return (
            <div key={p.id} style={{ padding: "12px 0", borderTop: "1px solid #F1F3F4" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: s.bg, color: s.color, marginRight: 8 }}>{s.text}</span>
                  {p.source === "client" && <span style={{ fontSize: 11, color: "#5F6368" }}>déposé par le client</span>}
                  <div style={{ fontSize: 14, marginTop: 6 }}>{p.content}</div>
                  {p.mediaUrl && <div style={{ fontSize: 12, marginTop: 4 }}>{p.mediaType === "video" ? "🎬" : "🖼️"} <a href={p.mediaUrl} target="_blank" rel="noreferrer">média</a></div>}
                  {p.errorMessage && <div style={{ fontSize: 12, color: G.red, marginTop: 4 }}>{p.errorMessage}</div>}
                </div>
                {p.status !== "publie" && (
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <button onClick={() => publish(p.id)} disabled={busy === `pub-${p.id}`} style={{ padding: "6px 12px", borderRadius: 6, border: "none", background: G.blue, color: "#fff", fontSize: 12, fontWeight: 600 }}>
                      {busy === `pub-${p.id}` ? "…" : "Publier"}
                    </button>
                    <button onClick={() => removePost(p.id)} disabled={busy === `del-${p.id}`} style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #DADCE0", background: "#fff", color: "#5F6368", fontSize: 12 }}>
                      Suppr.
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </Card>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontWeight: 700 }}>Stratégie Q&amp;A</div>
          <button onClick={generateQna} disabled={busy === "qna"} style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: G.yellow, color: "#3C3000", fontSize: 12, fontWeight: 600 }}>
            {busy === "qna" ? "…" : qna.length ? "Régénérer" : "Générer des suggestions"}
          </button>
        </div>
        <p style={{ fontSize: 12, color: "#5F6368", marginBottom: 12 }}>
          À poster manuellement dans la section &quot;Questions et réponses&quot; de la fiche Google (l&apos;API n&apos;est pas fiable pour l&apos;automatiser). Cochez une fois vraiment posé.
        </p>
        {qna.map((item, i) => (
          <div key={i} style={{ padding: "10px 0", borderTop: "1px solid #F1F3F4" }}>
            <label style={{ display: "flex", gap: 8, alignItems: "flex-start", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={item.postedOnGoogle}
                onChange={(e) => {
                  const next = qna.map((q, j) => (j === i ? { ...q, postedOnGoogle: e.target.checked } : q));
                  saveQna(next);
                }}
                style={{ marginTop: 4 }}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: 13.5 }}>{item.question}</div>
                <div style={{ fontSize: 13, color: "#5F6368", marginTop: 2 }}>{item.reponse}</div>
              </div>
            </label>
          </div>
        ))}
        {qna.length === 0 && <div style={{ color: "#5F6368", fontSize: 13 }}>Aucune suggestion pour l&apos;instant.</div>}
      </Card>
    </div>
  );
}
