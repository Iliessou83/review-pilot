export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getScope, ownedBusinessIds } from "@/lib/scope";
import { googleConfigured } from "@/lib/google-oauth";

// Onboarding client Reputation. Un nouveau client arrive par le SSO du Hub
// (module Avis) sans commerce rattaché. On l'accueille et on le guide vers la
// connexion de sa fiche Google, qui crée son commerce à SON email (owner_email).
// Le super-admin et un client déjà équipé sont renvoyés au dashboard.

const G = { blue: "#1A73E8", red: "#EA4335", yellow: "#FBBC04", green: "#34A853" };
const SHADOW = "0 1px 3px rgba(60,64,67,0.12), 0 1px 2px rgba(60,64,67,0.06)";

const STATUS_MSG: Record<string, string> = {
  unconfigured: "La connexion Google se met en place. Reviens bientôt, ou écris-nous et on te rattache ta fiche à la main.",
  denied: "Tu as refusé l'accès. Réessaie et accepte pour qu'on puisse lire et gérer tes avis.",
  nolocation: "Aucune fiche d'établissement trouvée sur ce compte Google. Vérifie que tu gères bien une fiche Google Business.",
  norefresh: "Connexion incomplète. Réessaie en autorisant l'accès permanent (sinon on ne peut pas resynchroniser).",
  quota: "Limite de commerces atteinte sur ton offre. Écris-nous pour l'augmenter.",
  state: "La session a expiré pendant la connexion. Réessaie.",
  api: "Un souci technique côté Google est survenu. Réessaie dans un instant.",
};

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ google?: string }>;
}) {
  const scope = await getScope();
  if (!scope) redirect("/");
  if (scope.isAdmin) redirect("/dashboard"); // le mode agence n'a pas d'onboarding

  const owned = await ownedBusinessIds(scope);
  if (owned === "all" || owned.length > 0) redirect("/dashboard"); // déjà équipé

  const gStatus = (await searchParams).google || null;
  const gOk = googleConfigured();
  const errorMsg = gStatus && gStatus !== "connected" ? STATUS_MSG[gStatus] : null;

  const steps = [
    { n: "1", c: G.blue, t: "Connecte ta fiche Google", d: "En un clic, sans mot de passe à nous confier." },
    { n: "2", c: G.green, t: "On récolte tes avis", d: "Historique complet et nouveaux avis en temps réel." },
    { n: "3", c: G.yellow, t: "On répond pour toi", d: "Réponses proposées ou automatiques, à ta main." },
  ];

  return (
    <main
      style={{
        minHeight: "100dvh",
        background: "#F8F9FA",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          background: "#fff",
          borderRadius: 20,
          boxShadow: SHADOW,
          padding: "36px 32px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            margin: "0 auto 18px",
            display: "grid",
            placeItems: "center",
            background: "#E8F0FE",
            fontSize: 28,
          }}
        >
          ⭐
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px", color: "#202124", letterSpacing: "-0.02em" }}>
          Bienvenue sur ta réputation
        </h1>
        <p style={{ fontSize: 15, color: "#5F6368", margin: "0 0 26px", lineHeight: 1.5 }}>
          Connecte ta fiche Google : on récupère tous tes avis et on t&apos;aide à
          y répondre. Ça prend moins d&apos;une minute.
        </p>

        {errorMsg && (
          <div
            style={{
              background: "#FCE8E6",
              color: "#C5221F",
              border: "1px solid #F5C6C2",
              borderRadius: 12,
              padding: "11px 14px",
              fontSize: 13.5,
              fontWeight: 600,
              marginBottom: 20,
              textAlign: "left",
            }}
          >
            {errorMsg}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 14, textAlign: "left", marginBottom: 28 }}>
          {steps.map((s) => (
            <div key={s.n} style={{ display: "flex", alignItems: "flex-start", gap: 13 }}>
              <span
                style={{
                  flex: "0 0 auto",
                  width: 30,
                  height: 30,
                  borderRadius: 999,
                  background: s.c,
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: 14,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                {s.n}
              </span>
              <span>
                <span style={{ display: "block", fontWeight: 700, fontSize: 14.5, color: "#202124" }}>{s.t}</span>
                <span style={{ fontSize: 13, color: "#5F6368" }}>{s.d}</span>
              </span>
            </div>
          ))}
        </div>

        {gOk ? (
          <a
            href="/api/google/connect"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              width: "100%",
              padding: "13px 18px",
              borderRadius: 12,
              background: G.blue,
              color: "#fff",
              fontWeight: 800,
              fontSize: 15,
              textDecoration: "none",
              boxShadow: "0 6px 16px -6px rgba(26,115,232,0.7)",
            }}
          >
            <GoogleGlyph /> Connecter ma fiche Google
          </a>
        ) : (
          <div
            style={{
              background: "#FEF7E0",
              color: "#B06000",
              border: "1px solid #FDE293",
              borderRadius: 12,
              padding: "13px 16px",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            La connexion Google se met en place. Écris-nous à{" "}
            <a href="mailto:support@caela.co" style={{ color: "#B06000", fontWeight: 800 }}>
              support@caela.co
            </a>{" "}
            et on rattache ta fiche à la main.
          </div>
        )}

        <p style={{ fontSize: 12, color: "#9AA0A6", margin: "18px 0 0" }}>
          Connecté en tant que <strong style={{ color: "#5F6368" }}>{scope.email}</strong>
        </p>
      </div>
    </main>
  );
}

function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#fff" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 4.1 29.6 2 24 2 12 2 2 12 2 24s10 22 22 22c11 0 21-8 21-22 0-1.2-.1-2.3-.4-3.5z" opacity="0.0" />
      <circle cx="24" cy="24" r="10" fill="#fff" opacity="0.18" />
      <text x="24" y="30" fontSize="20" fontWeight="800" textAnchor="middle" fill="#fff">G</text>
    </svg>
  );
}
