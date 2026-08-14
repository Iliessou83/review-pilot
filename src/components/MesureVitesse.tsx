"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics/client";

/**
 * Mesure la vitesse réellement ressentie par les visiteurs, une fois par
 * session. C'est cette vitesse-là que Google regarde pour le classement, pas
 * celle d'un test en laboratoire depuis une connexion parfaite.
 *
 * Trois chiffres :
 *   ttfb      — temps de réponse du serveur
 *   affichage — moment où la page devient utilisable (DOM prêt)
 *   lcp       — apparition du plus gros élément visible. Le seuil Google est
 *               2500 ms sur 75 % des visites.
 *
 * Aucune donnée personnelle : ce sont des durées.
 */
const CLE = "caela_perf_envoye";

export default function MesureVitesse() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem(CLE)) return;
    } catch {
      return;
    }

    let lcp = 0;
    let observateur: PerformanceObserver | null = null;

    try {
      observateur = new PerformanceObserver((liste) => {
        for (const e of liste.getEntries()) lcp = Math.round(e.startTime);
      });
      observateur.observe({ type: "largest-contentful-paint", buffered: true });
    } catch {
      // Navigateur sans cette mesure (Safari ancien) : on enverra sans le LCP.
    }

    function envoyer() {
      try {
        if (sessionStorage.getItem(CLE)) return;
        const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
        if (!nav) return;

        const ttfb = Math.round(nav.responseStart - nav.requestStart);
        const affichage = Math.round(nav.domContentLoadedEventEnd - nav.startTime);
        // Une valeur absurde (onglet en arrière-plan, veille de l'appareil)
        // fausserait la médiane : on l'écarte.
        if (affichage <= 0 || affichage > 60_000) return;

        sessionStorage.setItem(CLE, "1");
        track("perf", {
          ttfb: Math.max(0, ttfb),
          affichage,
          lcp: lcp > 0 && lcp < 60_000 ? lcp : null,
          type: nav.type,
        });
      } catch {
        /* jamais bloquant */
      } finally {
        observateur?.disconnect();
      }
    }

    // Le LCP se stabilise après l'interaction ou quand l'onglet passe en fond.
    const t = setTimeout(envoyer, 6000);
    const surSortie = () => envoyer();
    document.addEventListener("visibilitychange", surSortie);
    window.addEventListener("pagehide", surSortie);

    return () => {
      clearTimeout(t);
      document.removeEventListener("visibilitychange", surSortie);
      window.removeEventListener("pagehide", surSortie);
    };
  }, []);

  return null;
}
