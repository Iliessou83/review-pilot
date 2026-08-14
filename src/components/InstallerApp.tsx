"use client";

import { useEffect, useState } from "react";
import { track } from "@/lib/analytics/client";
import { EV } from "@/lib/analytics/events";

/**
 * Bloc « installer l'app sur son téléphone ».
 *
 * Sur Android/Chrome, le navigateur propose lui-même l'installation : on
 * récupère sa proposition et on l'affiche au bon moment, avec notre design.
 * Sur iPhone, Apple n'autorise aucune installation automatique : la seule
 * voie possible est d'expliquer le geste (Partager → Sur l'écran d'accueil).
 *
 * Ne s'affiche jamais : si l'app est déjà installée, si la personne a refusé,
 * ou avant le délai (laisser le visiteur regarder le site d'abord).
 */

type PromptInstall = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const CLE_REFUS = "caela_install_refuse";
/** On attend que la personne ait vu quelque chose avant de proposer. */
const DELAI_MS = 12_000;

export default function InstallerApp({
  nomApp,
  accroche = "Installe l'app sur ton téléphone",
  detail = "Accès en un geste depuis ton écran d'accueil, sans passer par le navigateur.",
  couleur = "#111827",
}: {
  nomApp: string;
  accroche?: string;
  detail?: string;
  couleur?: string;
}) {
  const [proposition, setProposition] = useState<PromptInstall | null>(null);
  const [iphone, setIphone] = useState(false);
  const [visible, setVisible] = useState(false);
  const [expliqueIphone, setExpliqueIphone] = useState(false);

  useEffect(() => {
    // Déjà installée : on ne propose rien.
    const installee =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      (window.navigator as { standalone?: boolean }).standalone === true;
    if (installee) return;

    try {
      if (localStorage.getItem(CLE_REFUS) === "1") return;
    } catch {
      /* navigation privée */
    }

    const ua = window.navigator.userAgent;
    const estIphone = /iPhone|iPad|iPod/i.test(ua) && !/CriOS|FxiOS|EdgiOS/i.test(ua);
    setIphone(estIphone);

    const surProposition = (e: Event) => {
      e.preventDefault();
      setProposition(e as PromptInstall);
    };
    window.addEventListener("beforeinstallprompt", surProposition);

    const surInstallation = () => {
      track(EV.APP_INSTALLEE, { appareil: estIphone ? "iphone" : "android" });
      setVisible(false);
    };
    window.addEventListener("appinstalled", surInstallation);

    // iPhone : aucune proposition du navigateur, on affiche après le délai.
    const t = setTimeout(() => setVisible(true), DELAI_MS);

    return () => {
      window.removeEventListener("beforeinstallprompt", surProposition);
      window.removeEventListener("appinstalled", surInstallation);
      clearTimeout(t);
    };
  }, []);

  const affichable = visible && (proposition !== null || iphone);

  useEffect(() => {
    if (affichable) track(EV.INSTALL_PROPOSEE, { appareil: iphone ? "iphone" : "android" });
  }, [affichable, iphone]);

  if (!affichable) return null;

  function refuser() {
    try {
      localStorage.setItem(CLE_REFUS, "1");
    } catch {
      /* tant pis */
    }
    setVisible(false);
  }

  async function installer() {
    if (!proposition) {
      setExpliqueIphone(true);
      return;
    }
    await proposition.prompt();
    const { outcome } = await proposition.userChoice;
    if (outcome === "dismissed") refuser();
    setProposition(null);
  }

  return (
    <div
      role="dialog"
      aria-label={`Installer ${nomApp}`}
      style={{
        position: "fixed",
        left: "50%",
        transform: "translateX(-50%)",
        bottom: "calc(16px + env(safe-area-inset-bottom, 0px))",
        zIndex: 9998,
        width: "calc(100% - 24px)",
        maxWidth: 460,
        background: "rgba(255,255,255,0.98)",
        color: "#111827",
        border: "1px solid rgba(0,0,0,0.08)",
        borderRadius: 18,
        boxShadow: "0 10px 40px rgba(0,0,0,0.18)",
        padding: 16,
        backdropFilter: "blur(12px)",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 14.5, fontWeight: 700, lineHeight: 1.35 }}>{accroche}</p>
          <p style={{ margin: "4px 0 0", fontSize: 12.5, lineHeight: 1.5, color: "#4b5563" }}>
            {expliqueIphone
              ? "Appuie sur le bouton Partager en bas de Safari, puis choisis « Sur l'écran d'accueil »."
              : detail}
          </p>
        </div>
        <button
          onClick={refuser}
          aria-label="Fermer"
          style={{
            border: "none",
            background: "rgba(0,0,0,0.05)",
            borderRadius: 999,
            width: 30,
            height: 30,
            fontSize: 16,
            lineHeight: 1,
            color: "#6b7280",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          ×
        </button>
      </div>

      {!expliqueIphone && (
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button
            onClick={installer}
            style={{
              flex: 1,
              padding: "11px 14px",
              borderRadius: 12,
              border: "none",
              background: couleur,
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {iphone && !proposition ? "Comment faire" : "Installer"}
          </button>
          <button
            onClick={refuser}
            style={{
              padding: "11px 14px",
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.1)",
              background: "transparent",
              color: "#6b7280",
              fontSize: 13.5,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Plus tard
          </button>
        </div>
      )}
    </div>
  );
}
