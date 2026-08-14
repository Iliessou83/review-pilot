"use client";

import { useEffect } from "react";

/**
 * Enregistre le service worker. Sans lui, Chrome ne propose JAMAIS d'installer
 * l'application sur le téléphone : il exige un manifeste ET un service worker
 * avec un gestionnaire de requêtes, même vide.
 *
 * À monter une seule fois dans le layout racine.
 */
export default function EnregistrerSW() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((reg) => reg.update().catch(() => {}))
      .catch(() => {});
  }, []);

  return null;
}
