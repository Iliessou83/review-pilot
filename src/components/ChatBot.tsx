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

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Bonjour 👋 Je suis Pilot, l'assistant ReviewPilot. Comment puis-je vous aider ?" },
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
          position: "fixed", bottom: "90px", right: "24px",
          width: "360px", maxHeight: "520px",
          background: "#fff", borderRadius: "16px",
          boxShadow: "0 8px 32px rgba(60,64,67,0.24), 0 2px 8px rgba(60,64,67,0.12)",
          display: "flex", flexDirection: "column",
          zIndex: 1000, overflow: "hidden",
          border: "1px solid #DADCE0",
          fontFamily: "'Google Sans', system-ui, sans-serif",
        }}>
          {/* Header */}
          <div style={{ background: G.blue, padding: "16px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "50%",
                background: "rgba(255,255,255,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "18px",
              }}>✈</div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>Pilot</div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#4ade80" }} />
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.8)" }}>En ligne</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{ background: "none", border: "none", color: "rgba(255,255,255,0.8)", fontSize: "20px", cursor: "pointer", padding: "2px 6px", borderRadius: "4px" }}
            >×</button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                {msg.role === "assistant" && (
                  <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: G.blue, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", marginRight: "6px", flexShrink: 0, alignSelf: "flex-end" }}>✈</div>
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
                <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: G.blue, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", flexShrink: 0 }}>✈</div>
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
              Propulsé par ReviewPilot ·{" "}
              <a href="mailto:contact@caela.fr" style={{ color: G.blue, textDecoration: "none" }}>contact@caela.fr</a>
            </span>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: "fixed", bottom: "24px", right: "24px",
          width: "56px", height: "56px", borderRadius: "50%",
          background: open ? "#5F6368" : G.blue,
          border: "none", cursor: "pointer",
          boxShadow: "0 4px 16px rgba(26,115,232,0.4), 0 2px 6px rgba(0,0,0,0.12)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.2s",
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
            <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="white"/>
            <circle cx="8" cy="11" r="1.5" fill={G.blue}/>
            <circle cx="12" cy="11" r="1.5" fill={G.blue}/>
            <circle cx="16" cy="11" r="1.5" fill={G.blue}/>
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
