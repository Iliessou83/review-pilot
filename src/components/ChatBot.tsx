"use client";

import { useState, useRef, useEffect } from "react";

const G = { blue: "#1A73E8", red: "#EA4335", yellow: "#FBBC04", green: "#34A853" };

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTED = [
  "C'est quoi le prix ?",
  "Comment ça fonctionne ?",
  "Est-ce risqué pour ma fiche ?",
  "Essai gratuit ?",
];

// Icône dédiée d'Aria (étincelle), réutilisée dans le header et sur chaque
// bulle de réponse — remplace l'emoji ✈ générique.
function AriaAvatar({ size = 26 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: G.blue, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none">
        <path d="M12 2.5L14.2 9.3L21 11.5L14.2 13.7L12 20.5L9.8 13.7L3 11.5L9.8 9.3L12 2.5Z" fill="#fff" />
      </svg>
    </div>
  );
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Bonjour 👋 Je suis Aria, l'assistante IA de Caela Réputation. Comment puis-je vous aider ?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(1);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setUnread(0);
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [open, messages]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const userMsg: Msg = { role: "user", content: text.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated }),
      });
      const data = await res.json() as { reply: string };
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Désolé, une erreur s'est produite. Réessayez ou contactez contact@caela.fr" }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Chat window */}
      {open && (
        <div style={{
          position: "fixed", bottom: "90px", right: "16px",
          width: "360px", maxWidth: "calc(100vw - 32px)",
          maxHeight: "min(520px, calc(100vh - 140px))",
          background: "#fff", borderRadius: "16px",
          boxShadow: "0 8px 32px rgba(60,64,67,0.24), 0 2px 8px rgba(60,64,67,0.12)",
          display: "flex", flexDirection: "column",
          zIndex: 1000, overflow: "hidden",
          border: "1px solid #DADCE0",
          fontFamily: "'Google Sans', system-ui, sans-serif",
        }}>
          {/* Header — dégradé + icône dédiée (au lieu d'un aplat bleu et d'un
              emoji avion, qui lisaient "widget de démo" plutôt que produit
              professionnel). */}
          <div style={{ background: "linear-gradient(135deg, #1A73E8, #1557b0)", padding: "18px 18px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
              <div style={{
                width: "38px", height: "38px", borderRadius: "11px",
                background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2.5L14.2 9.3L21 11.5L14.2 13.7L12 20.5L9.8 13.7L3 11.5L9.8 9.3L12 2.5Z" fill="#fff" />
                  <path d="M19 3L19.7 5.1L21.8 5.8L19.7 6.5L19 8.6L18.3 6.5L16.2 5.8L18.3 5.1L19 3Z" fill="#fff" opacity="0.85" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: "14.5px", fontWeight: 700, color: "#fff", letterSpacing: "-0.2px" }}>Aria</div>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <div className="rp-live-dot" style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80" }} />
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.85)" }}>Assistante IA · en ligne</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Fermer"
              style={{ background: "rgba(255,255,255,0.12)", border: "none", color: "#fff", fontSize: "16px", cursor: "pointer", width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}
            >×</button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                {msg.role === "assistant" && (
                  <div style={{ marginRight: "6px", alignSelf: "flex-end" }}><AriaAvatar size={26} /></div>
                )}
                <div style={{
                  maxWidth: "78%",
                  padding: "10px 14px",
                  borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  background: msg.role === "user" ? G.blue : "#F8F9FA",
                  color: msg.role === "user" ? "#fff" : "#202124",
                  fontSize: "13px",
                  lineHeight: 1.55,
                  border: msg.role === "assistant" ? "1px solid #DADCE0" : "none",
                }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <AriaAvatar size={26} />
                <div style={{ background: "#F8F9FA", border: "1px solid #DADCE0", borderRadius: "18px 18px 18px 4px", padding: "12px 16px", display: "flex", gap: "4px" }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: "6px", height: "6px", borderRadius: "50%", background: "#DADCE0",
                      animation: "pulse 1.2s ease-in-out infinite",
                      animationDelay: `${i * 0.2}s`,
                    }} />
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions (only after first message if no user msg yet) */}
            {messages.length === 1 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "4px" }}>
                {SUGGESTED.map(s => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    style={{
                      padding: "6px 12px", borderRadius: "20px",
                      border: `1px solid ${G.blue}40`,
                      background: "#E8F0FE", color: G.blue,
                      fontSize: "12px", fontWeight: 500,
                      cursor: "pointer", fontFamily: "inherit",
                    }}
                  >{s}</button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: "12px 14px", borderTop: "1px solid #DADCE0", display: "flex", gap: "8px", alignItems: "center" }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
              placeholder="Posez votre question..."
              style={{
                flex: 1, padding: "10px 14px",
                border: "1px solid #DADCE0", borderRadius: "24px",
                fontSize: "13px", outline: "none",
                color: "#202124", background: "#fff",
                fontFamily: "inherit",
              }}
              onFocus={e => { e.target.style.borderColor = G.blue; }}
              onBlur={e => { e.target.style.borderColor = "#DADCE0"; }}
              disabled={loading}
            />
            <button
              onClick={() => send(input)}
              disabled={loading || !input.trim()}
              style={{
                width: "38px", height: "38px", borderRadius: "50%",
                background: input.trim() && !loading ? G.blue : "#F8F9FA",
                border: "none", cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.15s", flexShrink: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke={input.trim() && !loading ? "#fff" : "#DADCE0"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Footer */}
          <div style={{ padding: "8px 14px", background: "#F8F9FA", borderTop: "1px solid #DADCE0", textAlign: "center" }}>
            <span style={{ fontSize: "10px", color: "#80868B" }}>
              Réponse générée par IA · une question ?{" "}
              <a href="mailto:contact@caela.fr" style={{ color: G.blue, textDecoration: "none" }}>contact@caela.fr</a>
            </span>
          </div>
        </div>
      )}

      {/* Floating button — dégradé + halo discret quand fermé (pour signaler
          une présence active plutôt qu'un simple bouton statique). */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={open ? "Fermer le chat" : "Ouvrir le chat avec Aria"}
        className={open ? "" : "rp-chat-pulse"}
        style={{
          position: "fixed", bottom: "24px", right: "24px",
          width: "58px", height: "58px", borderRadius: "50%",
          background: open ? "#5F6368" : "linear-gradient(135deg, #1A73E8, #1557b0)",
          border: "none", cursor: "pointer",
          boxShadow: "0 4px 16px rgba(26,115,232,0.4), 0 2px 6px rgba(0,0,0,0.12)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 0.2s, transform 0.2s",
          zIndex: 1001,
        }}
        onMouseEnter={e => { (e.currentTarget).style.transform = "scale(1.08)"; }}
        onMouseLeave={e => { (e.currentTarget).style.transform = "scale(1)"; }}
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2.5L14.2 9.3L21 11.5L14.2 13.7L12 20.5L9.8 13.7L3 11.5L9.8 9.3L12 2.5Z" fill="#fff" />
          </svg>
        )}
        {!open && unread > 0 && (
          <div style={{
            position: "absolute", top: "2px", right: "2px",
            width: "18px", height: "18px", borderRadius: "50%",
            background: G.red, border: "2px solid #fff",
            fontSize: "10px", fontWeight: 700, color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>{unread}</div>
        )}
      </button>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.1); }
        }
      `}</style>
    </>
  );
}
