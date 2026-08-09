"use client";
import { useState, useEffect } from "react";

const DISMISS_DAYS = 14;

// Bandeau discret qui rappelle qu'une tâche peut être déléguée à Caela Agency
// (payant, transparent). Se ferme et reste fermé pendant DISMISS_DAYS pour ne
// jamais devenir intrusif. Palette calquée sur le thème Material du dashboard
// (bleu Google #1A73E8, cartes blanches, bordures #DADCE0).
//
// Le CTA ouvre un petit formulaire qui poste la demande directement dans la
// file Nexus (/api/delegate-request). En cas d'échec réseau, on garde le
// mailto en filet de sécurité.
export default function DelegateBanner({
  storageKey,
  icon = "✨",
  title,
  body,
  ctaLabel = "En discuter →",
  mailSubject,
  kind,
  defaultBrief,
}: {
  storageKey: string;
  icon?: string;
  title: string;
  body: string;
  ctaLabel?: string;
  mailSubject: string;
  kind: "campagne" | "visuel";
  defaultBrief?: string;
}) {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const key = `rp_delegate_dismiss_${storageKey}`;
    const dismissedAt = Number(localStorage.getItem(key) || 0);
    if (!dismissedAt || Date.now() - dismissedAt > DISMISS_DAYS * 24 * 60 * 60 * 1000) {
      setVisible(true);
    }
  }, [storageKey]);

  function dismiss() {
    localStorage.setItem(`rp_delegate_dismiss_${storageKey}`, String(Date.now()));
    setVisible(false);
  }

  if (!visible) return null;

  const mailtoHref = `mailto:contact@caela-agency.fr?subject=${encodeURIComponent(mailSubject)}`;

  return (
    <>
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 12,
        padding: "14px 18px",
        marginBottom: 16,
        background: "linear-gradient(135deg, rgba(26,115,232,0.08), #fff)",
        border: "1px solid rgba(26,115,232,0.25)",
        boxShadow: "0 1px 3px rgba(60,64,67,0.12), 0 1px 2px rgba(60,64,67,0.06)",
        display: "flex",
        alignItems: "center",
        gap: 14,
        flexWrap: "wrap",
        animation: "rpDelegateSlideIn 0.5s cubic-bezier(0.22,1,0.36,1) both",
      }}
    >
      <style>{`
        @keyframes rpDelegateSlideIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes rpDelegatePulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(26,115,232,0.3); } 50% { box-shadow: 0 0 0 6px rgba(26,115,232,0); } }
      `}</style>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          flexShrink: 0,
          background: "rgba(26,115,232,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 17,
          animation: "rpDelegatePulse 2.6s infinite",
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: "#202124", marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 12.5, color: "#5F6368", lineHeight: 1.5 }}>{body}</div>
      </div>
      <button
        onClick={() => setOpen(true)}
        style={{
          flexShrink: 0,
          padding: "9px 16px",
          borderRadius: 8,
          whiteSpace: "nowrap",
          background: "#1A73E8",
          color: "#fff",
          fontWeight: 700,
          fontSize: 12.5,
          border: "none",
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        {ctaLabel}
      </button>
      <button
        onClick={dismiss}
        aria-label="Fermer ce rappel"
        style={{
          flexShrink: 0,
          width: 24,
          height: 24,
          borderRadius: 8,
          background: "rgba(60,64,67,0.06)",
          border: "none",
          color: "#5F6368",
          cursor: "pointer",
          fontSize: 13,
          lineHeight: 1,
          fontFamily: "inherit",
        }}
      >
        ✕
      </button>
    </div>

    {/* Rendu HORS du bloc ci-dessus : ce bloc a une animation qui pose un
        transform, ce qui fait de lui le "containing block" de tout enfant en
        position:fixed (règle CSS peu connue). La modale finissait donc piégée
        dans les limites du bandeau au lieu de couvrir l'écran (bug du 08/08,
        overlap visible sur mobile et desktop). */}
    {open && (
      <DelegateForm
        title={title}
        kind={kind}
        defaultBrief={defaultBrief || body}
        mailtoHref={mailtoHref}
        onClose={() => setOpen(false)}
      />
    )}
    </>
  );
}

function DelegateForm({
  title,
  kind,
  defaultBrief,
  mailtoHref,
  onClose,
}: {
  title: string;
  kind: "campagne" | "visuel";
  defaultBrief: string;
  mailtoHref: string;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(defaultBrief);
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || status === "sending") return;
    setStatus("sending");
    try {
      const r = await fetch("/api/delegate-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, brief: message, name, email, kind }),
        signal: AbortSignal.timeout(8000),
      });
      const j = await r.json().catch(() => ({}));
      setStatus(j?.ok ? "ok" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(32,33,36,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 200,
        animation: "rpDelegateSlideIn 0.2s ease both",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#fff",
          borderRadius: 14,
          padding: 20,
          boxShadow: "0 8px 28px rgba(32,33,36,0.28)",
          fontFamily: "inherit",
        }}
      >
        {status === "ok" ? (
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#188038", marginBottom: 6 }}>
              ✓ Demande envoyée
            </div>
            <div style={{ fontSize: 13, color: "#5F6368", lineHeight: 1.5, marginBottom: 16 }}>
              L&apos;équipe Caela Agency a reçu votre demande et revient vers vous rapidement.
            </div>
            <button onClick={onClose} style={btnPrimary}>
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#202124", marginBottom: 12 }}>{title}</div>

            <label style={label}>Nom</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Votre nom"
              style={input}
            />

            <label style={label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.fr"
              style={input}
            />

            <label style={label}>Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              style={{ ...input, resize: "vertical" }}
            />

            {status === "error" && (
              <div
                style={{
                  fontSize: 12.5,
                  color: "#C5221F",
                  background: "rgba(197,34,31,0.08)",
                  borderRadius: 8,
                  padding: "8px 10px",
                  marginBottom: 12,
                  lineHeight: 1.5,
                }}
              >
                Envoi impossible pour le moment.{" "}
                <a href={mailtoHref} style={{ color: "#1A73E8", fontWeight: 700 }}>
                  Envoyer par email à la place →
                </a>
              </div>
            )}

            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button type="button" onClick={onClose} style={btnSecondary}>
                Annuler
              </button>
              <button type="submit" disabled={status === "sending"} style={btnPrimary}>
                {status === "sending" ? "Envoi…" : "Envoyer la demande"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const label: React.CSSProperties = {
  display: "block",
  fontSize: 11.5,
  fontWeight: 700,
  color: "#5F6368",
  marginBottom: 4,
  marginTop: 10,
};

const input: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "9px 11px",
  borderRadius: 8,
  border: "1px solid #DADCE0",
  fontSize: 13,
  fontFamily: "inherit",
  color: "#202124",
};

const btnPrimary: React.CSSProperties = {
  flex: 1,
  padding: "10px 14px",
  borderRadius: 8,
  background: "#1A73E8",
  color: "#fff",
  fontWeight: 700,
  fontSize: 13,
  border: "none",
  cursor: "pointer",
  fontFamily: "inherit",
};

const btnSecondary: React.CSSProperties = {
  flex: 1,
  padding: "10px 14px",
  borderRadius: 8,
  background: "rgba(60,64,67,0.06)",
  color: "#5F6368",
  fontWeight: 700,
  fontSize: 13,
  border: "none",
  cursor: "pointer",
  fontFamily: "inherit",
};
