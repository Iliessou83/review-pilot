"use client";

import { useState } from "react";
import Link from "next/link";

const G = { blue: "#2457C5", red: "#D6455D", yellow: "#E0A11A", green: "#16856B" };
const SHADOW = "0 2px 8px rgba(60,64,67,0.15), 0 1px 4px rgba(60,64,67,0.1)";

const REASONS = [
  { value: "faux_avis", label: "Faux avis", desc: "La personne n'a jamais été cliente" },
  { value: "diffamatoire", label: "Diffamatoire", desc: "Insultes, accusations non étayées" },
  { value: "concurrent", label: "Posté par un concurrent", desc: "Ou un ex-salarié, un tiers sans lien réel" },
  { value: "autre", label: "Autre", desc: "Précisez ci-dessous" },
];

const ACCESS_OPTIONS = [
  { value: "deja_connecte", label: "Ma fiche est déjà connectée à Caela", icon: "✅" },
  { value: "va_ajouter_gerant", label: "Je vais vous donner l'accès", icon: "🔑" },
  { value: "ne_sait_pas", label: "Je ne sais pas comment faire", icon: "❓" },
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "block", marginBottom: "16px" }}>
      <span style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#202124", marginBottom: "6px" }}>{label}</span>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 14px", fontSize: "14px", border: "1px solid #DADCE0",
  borderRadius: "8px", fontFamily: "inherit", boxSizing: "border-box",
};

export default function SignalerAvisClient() {
  const [businessName, setBusinessName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [reviewAuthor, setReviewAuthor] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reason, setReason] = useState("faux_avis");
  const [reasonDetail, setReasonDetail] = useState("");
  const [hasGmbAccess, setHasGmbAccess] = useState("");
  const [gmbListingUrl, setGmbListingUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const canSubmit = businessName && contactEmail && reviewAuthor && reviewText && hasGmbAccess;

  const submit = async () => {
    if (!canSubmit) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/removal-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName, contactEmail, reviewAuthor, reviewText, reason, reasonDetail, hasGmbAccess, gmbListingUrl }),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8F9FA", padding: "24px" }}>
        <div style={{ maxWidth: "440px", textAlign: "center", background: "#fff", borderRadius: "16px", padding: "40px 32px", boxShadow: SHADOW }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>✅</div>
          <h1 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 10px", color: "#202124" }}>Demande reçue</h1>
          <p style={{ fontSize: "14px", color: "#5F6368", lineHeight: 1.6, margin: "0 0 20px" }}>
            On revient vers vous sous 24h ouvrées pour confirmer le dossier et le lien de paiement (19,90€, satisfait ou remboursé). Si vous nous avez indiqué ne pas savoir comment nous donner l&apos;accès, on vous guide pas à pas dans notre réponse.
          </p>
          <Link href="/" style={{ color: G.blue, fontSize: "14px", fontWeight: 600, textDecoration: "none" }}>← Retour à l&apos;accueil</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F8F9FA", padding: "40px 20px 80px" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <Link href="/" style={{ fontSize: "13px", color: "#5F6368", textDecoration: "none" }}>← Retour</Link>

        <div style={{ background: "#FCE8E6", border: `1px solid ${G.red}30`, borderRadius: "12px", padding: "18px 20px", margin: "16px 0 28px" }}>
          <h1 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 6px", color: "#202124" }}>🚫 Signaler un faux avis Google</h1>
          <p style={{ fontSize: "13px", color: "#5F6368", margin: 0, lineHeight: 1.6 }}>
            19,90€ par dossier soumis. La décision appartient à Google ; si le retrait est refusé, la prestation est remboursée.{" "}
            <a href="/blog/faire-retirer-faux-avis-google" style={{ color: G.red, fontWeight: 600 }}>Comment ça marche →</a>
          </p>
        </div>

        {/* Étape 1 : identité */}
        <div style={{ background: "#fff", borderRadius: "12px", padding: "24px", marginBottom: "16px", boxShadow: SHADOW }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: G.blue, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "16px" }}>1 · Votre établissement</div>
          <Field label="Nom de l'établissement">
            <input style={inputStyle} value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="Ex : Le Petit Bistrot" />
          </Field>
          <Field label="Votre email">
            <input type="email" style={inputStyle} value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="vous@exemple.fr" />
          </Field>
        </div>

        {/* Étape 2 : l'avis */}
        <div style={{ background: "#fff", borderRadius: "12px", padding: "24px", marginBottom: "16px", boxShadow: SHADOW }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: G.blue, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "16px" }}>2 · L&apos;avis à signaler</div>
          <Field label="Nom affiché par l'auteur de l'avis">
            <input style={inputStyle} value={reviewAuthor} onChange={e => setReviewAuthor(e.target.value)} placeholder="Ex : Jean D." />
          </Field>
          <Field label="Texte de l'avis (copiez-collez-le)">
            <textarea style={{ ...inputStyle, minHeight: "90px", resize: "vertical" }} value={reviewText} onChange={e => setReviewText(e.target.value)} />
          </Field>
          <span style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#202124", marginBottom: "8px" }}>Pourquoi cet avis doit être retiré</span>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "14px" }}>
            {REASONS.map(r => (
              <button
                key={r.value}
                type="button"
                onClick={() => setReason(r.value)}
                style={{
                  textAlign: "left", padding: "10px 12px", borderRadius: "8px", cursor: "pointer",
                  border: `1.5px solid ${reason === r.value ? G.red : "#DADCE0"}`,
                  background: reason === r.value ? "#FCE8E6" : "#fff",
                }}
              >
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#202124" }}>{r.label}</div>
                <div style={{ fontSize: "11px", color: "#80868B" }}>{r.desc}</div>
              </button>
            ))}
          </div>
          <Field label="Détail (optionnel)">
            <textarea style={{ ...inputStyle, minHeight: "60px", resize: "vertical" }} value={reasonDetail} onChange={e => setReasonDetail(e.target.value)} placeholder="Toute info qui aide à monter le dossier : dates, preuves, contexte…" />
          </Field>
        </div>

        {/* Étape 3 : accès GMB */}
        <div style={{ background: "#fff", borderRadius: "12px", padding: "24px", marginBottom: "16px", boxShadow: SHADOW }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: G.blue, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "16px" }}>3 · Accès à votre fiche Google</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "14px" }}>
            {ACCESS_OPTIONS.map(o => (
              <button
                key={o.value}
                type="button"
                onClick={() => setHasGmbAccess(o.value)}
                style={{
                  textAlign: "left", padding: "12px 14px", borderRadius: "8px", cursor: "pointer",
                  border: `1.5px solid ${hasGmbAccess === o.value ? G.blue : "#DADCE0"}`,
                  background: hasGmbAccess === o.value ? "#E8F0FE" : "#fff",
                  display: "flex", alignItems: "center", gap: "10px", fontSize: "13.5px", fontWeight: 600, color: "#202124",
                }}
              >
                <span>{o.icon}</span>{o.label}
              </button>
            ))}
          </div>

          {hasGmbAccess === "deja_connecte" && (
            <Field label="Lien de votre fiche Google (optionnel, si vous en gérez plusieurs)">
              <input style={inputStyle} value={gmbListingUrl} onChange={e => setGmbListingUrl(e.target.value)} placeholder="https://g.page/..." />
            </Field>
          )}

          {(hasGmbAccess === "va_ajouter_gerant" || hasGmbAccess === "ne_sait_pas") && (
            <div style={{ background: "#F8F9FA", borderRadius: "10px", padding: "16px 18px", marginTop: "4px" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#202124", marginBottom: "10px" }}>Comment nous donner l&apos;accès — 3 étapes</div>
              <ol style={{ margin: 0, paddingLeft: "18px", fontSize: "12.5px", color: "#5F6368", lineHeight: 1.9 }}>
                <li>Allez sur <strong>business.google.com</strong>, sélectionnez votre établissement.</li>
                <li>Menu <strong>Utilisateurs</strong> → icône <strong>+</strong> → ajoutez <strong>contact@caela.fr</strong> avec le rôle <strong>Gérant</strong>.</li>
                <li>Collez ci-dessous le lien de votre fiche (visible dans « Infos » ou en partageant votre profil).</li>
              </ol>
              <div style={{ marginTop: "14px" }}>
                <Field label="Lien de votre fiche Google">
                  <input style={inputStyle} value={gmbListingUrl} onChange={e => setGmbListingUrl(e.target.value)} placeholder="https://g.page/..." />
                </Field>
              </div>
              <p style={{ fontSize: "11.5px", color: "#80868B", margin: 0 }}>Vous restez propriétaire ou copropriétaire de la fiche. Caela reçoit uniquement un rôle de gérant révocable. Vous pourrez le faire après ce formulaire ; nous rappellerons les étapes dans notre réponse.</p>
            </div>
          )}
        </div>

        <button
          onClick={submit}
          disabled={!canSubmit || status === "sending"}
          style={{
            width: "100%", padding: "14px", background: canSubmit ? G.red : "#DADCE0", color: "#fff", border: "none",
            borderRadius: "8px", fontSize: "14.5px", fontWeight: 700, cursor: canSubmit ? "pointer" : "not-allowed",
          }}
        >
          {status === "sending" ? "Envoi…" : "Envoyer ma demande →"}
        </button>
        {status === "error" && (
          <p style={{ color: G.red, fontSize: "13px", marginTop: "10px", textAlign: "center" }}>Une erreur est survenue, réessayez ou écrivez à contact@caela.fr.</p>
        )}
      </div>
    </div>
  );
}
