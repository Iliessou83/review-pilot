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
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: "linear-gradient(135deg, #1A73E8, #1557b0)",
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 2px 6px rgba(26,115,232,0.35)",
    }}>
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
      {/* Chat window — refonte complète : conteneur plus grand, coins plus
          arrondis, ombre profonde (carte flottante plutôt que boîte plate),
          zone de messages teintée pour donner de la profondeur, entrée +
          pied de page fusionnés en une seule barre. */}
      {open && (
        <div className="rp-chat-window" style={{
          position: "fixed", bottom: "94px", right: "20px",
          width: "384px", maxWidth: "calc(100vw - 32px)",
          height: "min(600px, calc(100vh - 150px))",
          background: "#fff", borderRadius: "24px",
          boxShadow: "0 24px 60px -12px rgba(26,32,44,0.28), 0 8px 24px -8px rgba(26,32,44,0.16)",
          display: "flex", flexDirection: "column",
          zIndex: 1000, overflow: "hidden",
          fontFamily: "'Google Sans', system-ui, sans-serif",
        }}>
          {/* Header */}
          <div style={{
            background: "linear-gradient(135deg, #1A73E8, #1557b0)",
            padding: "20px 20px 18px", display: "flex", alignItems: "center", justifyContent: "space-between",
            position: "relative", overflow: "hidden",
          }}>
            {/* Halo décoratif discret, pour ne pas laisser le dégradé plat */}
            <div style={{ position: "absolute", top: "-40px", right: "-30px", width: "140px", height: "140px", borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: "12px", position: "relative" }}>
              <div style={{
                width: "42px", height: "42px", borderRadius: "13px",
                background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.28)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="21" height="21" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2.5L14.2 9.3L21 11.5L14.2 13.7L12 20.5L9.8 13.7L3 11.5L9.8 9.3L12 2.5Z" fill="#fff" />
                  <path d="M19 3L19.7 5.1L21.8 5.8L19.7 6.5L19 8.6L18.3 6.5L16.2 5.8L18.3 5.1L19 3Z" fill="#fff" opacity="0.85" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "#fff", letterSpacing: "-0.2px" }}>Aria</div>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <div className="rp-live-dot" style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80" }} />
                  <span style={{ fontSize: "11.5px", color: "rgba(255,255,255,0.85)" }}>Assistante IA · en ligne</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Fermer"
              style={{
                background: "rgba(255,255,255,0.14)", border: "none", color: "#fff", fontSize: "15px", cursor: "pointer",
                width: "30px", height: "30px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative", transition: "background 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.26)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.14)"; }}
            >×</button>
          </div>

          {/* Messages — fond légèrement teinté (au lieu de blanc plat) pour
              détacher les bulles et donner de la profondeur. */}
          <div style={{ flex: 1, overflowY: "auto", padding: "18px 16px", display: "flex", flexDirection: "column", gap: "12px", background: "linear-gradient(180deg, #F5F8FE, #FAFBFC 140px)" }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                {msg.role === "assistant" && (
                  <div style={{ marginRight: "8px", alignSelf: "flex-end" }}><AriaAvatar size={28} /></div>
                )}
                <div style={{
                  maxWidth: "78%",
                  padding: "11px 15px",
                  borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  background: msg.role === "user" ? "linear-gradient(135deg, #1A73E8, #1557b0)" : "#fff",
                  color: msg.role === "user" ? "#fff" : "#202124",
                  fontSize: "13.5px",
                  lineHeight: 1.55,
                  boxShadow: msg.role === "user" ? "0 3px 10px rgba(26,115,232,0.28)" : "0 1px 3px rgba(32,33,36,0.08), 0 1px 2px rgba(32,33,36,0.05)",
                }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <AriaAvatar size={28} />
                <div style={{ background: "#fff", borderRadius: "18px 18px 18px 4px", padding: "13px 17px", display: "flex", gap: "4px", boxShadow: "0 1px 3px rgba(32,33,36,0.08)" }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: "6px", height: "6px", borderRadius: "50%", background: G.blue, opacity: 0.4,
                      animation: "rp-chat-typing 1.2s ease-in-out infinite",
                      animationDelay: `${i * 0.18}s`,
                    }} />
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions (only after first message if no user msg yet) */}
            {messages.length === 1 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "7px", marginTop: "2px", marginLeft: "36px" }}>
                {SUGGESTED.map(s => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    style={{
                      padding: "7px 13px", borderRadius: "20px",
                      border: `1px solid ${G.blue}30`,
                      background: "#fff", color: G.blue,
                      fontSize: "12px", fontWeight: 600,
                      cursor: "pointer", fontFamily: "inherit",
                      boxShadow: "0 1px 3px rgba(32,33,36,0.06)",
                      transition: "background 0.15s, border-color 0.15s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#E8F0FE"; e.currentTarget.style.borderColor = G.blue + "60"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = G.blue + "30"; }}
                  >{s}</button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Entrée — pilule unique avec le bouton d'envoi intégré, plus le
              petit texte de contact en dessous : une seule zone au lieu de
              deux barres empilées (input + footer séparés). */}
          <div style={{ padding: "14px 16px 12px", borderTop: "1px solid #EEF1F4", background: "#fff" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: "6px",
              background: "#F1F3F4", borderRadius: "26px", padding: "5px 5px 5px 16px",
              border: "1.5px solid transparent", transition: "border-color 0.15s, background 0.15s",
            }}
              onFocus={e => { e.currentTarget.style.borderColor = G.blue; e.currentTarget.style.background = "#fff"; }}
              onBlur={e => { e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.background = "#F1F3F4"; }}
            >
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
                placeholder="Posez votre question…"
                style={{
                  flex: 1, padding: "8px 0",
                  border: "none", outline: "none", background: "transparent",
                  fontSize: "13.5px", color: "#202124", fontFamily: "inherit",
                }}
                disabled={loading}
              />
              <button
                onClick={() => send(input)}
                disabled={loading || !input.trim()}
                aria-label="Envoyer"
                style={{
                  width: "38px", height: "38px", borderRadius: "50%", flexShrink: 0,
                  background: input.trim() && !loading ? "linear-gradient(135deg, #1A73E8, #1557b0)" : "#E1E3E6",
                  border: "none", cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background 0.15s",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke={input.trim() && !loading ? "#fff" : "#9AA0A6"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <div style={{ textAlign: "center", marginTop: "9px" }}>
              <span style={{ fontSize: "10.5px", color: "#9AA0A6" }}>
                Réponse générée par IA · <a href="mailto:contact@caela.fr" style={{ color: "#9AA0A6", textDecoration: "underline" }}>contact@caela.fr</a>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Floating button — dégradé + halo discret quand fermé (pour signaler
          une présence active plutôt qu'un simple bouton statique). */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={open ? "Fermer le chat" : "Ouvrir le chat avec Aria"}
        className={open ? "rp-chat-button" : "rp-chat-button rp-chat-pulse"}
        style={{
          position: "fixed", bottom: "24px", right: "24px",
          width: "60px", height: "60px", borderRadius: "50%",
          background: open ? "#5F6368" : "linear-gradient(135deg, #1A73E8, #1557b0)",
          border: "none", cursor: "pointer",
          boxShadow: "0 6px 20px rgba(26,115,232,0.38), 0 2px 8px rgba(0,0,0,0.14)",
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
          <svg width="25" height="25" viewBox="0 0 24 24" fill="none">
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
        @keyframes rp-chat-typing {
          0%, 100% { opacity: 0.35; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-3px); }
        }
      `}</style>
    </>
  );
}
