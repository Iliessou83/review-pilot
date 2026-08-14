"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { AnalyticsContexteProvider, _majContexte, lireIdAnonyme, track } from "@/lib/analytics/client";
import { EV } from "@/lib/analytics/events";

/**
 * À monter une seule fois, dans le layout racine, autour de toute l'app.
 * Envoie automatiquement les pages vues.
 *
 * L'identifiant anonyme est lu dans le cookie CÔTÉ NAVIGATEUR, jamais dans le
 * layout serveur : un `cookies()` dans le layout racine ferait basculer tout le
 * site en rendu à la demande et lui ferait perdre ses pages statiques (mesuré
 * sur Anhaya : 13 pages statiques tombaient à 2).
 *
 * Pour un test A/B sans clignotement, voir README : la page concernée, et elle
 * seule, lit le cookie côté serveur et passe `anonIdServeur`.
 */
export default function AnalyticsProvider({
  anonIdServeur,
  children,
}: {
  anonIdServeur?: string;
  children: React.ReactNode;
}) {
  const [anonId, setAnonId] = useState(anonIdServeur ?? "");

  useEffect(() => {
    if (!anonId) setAnonId(lireIdAnonyme());
  }, [anonId]);

  const contexte = useMemo(() => ({ anonId, suivi: Boolean(anonId) }), [anonId]);
  _majContexte(contexte);

  const chemin = usePathname();

  useEffect(() => {
    _majContexte(contexte);
  }, [contexte]);

  useEffect(() => {
    if (!anonId) return;
    // On garde uniquement les paramètres de campagne, jamais le reste de l'URL
    // (elle peut contenir un email, un jeton, une donnée personnelle).
    const p = new URLSearchParams(window.location.search);
    const source = p.get("utm_source") ?? p.get("ref") ?? undefined;
    const campagne = p.get("utm_campaign") ?? undefined;
    track(EV.PAGE_VUE, source || campagne ? { source, campagne } : undefined);
  }, [chemin, anonId]);

  return <AnalyticsContexteProvider value={contexte}>{children}</AnalyticsContexteProvider>;
}
