"use client";

import { createContext, useContext, useEffect, useMemo, useRef } from "react";
import { COOKIE_ID, COOKIE_OPTOUT, choisirVariante, nouvelIdAnonyme } from "./core";
import { EXPERIENCES, PRODUIT } from "./config";
import { EV, type NomEvenement } from "./events";

// ── CONFORMITÉ ───────────────────────────────────────────────────────────────
// Ce module ne collecte JAMAIS : nom, email, téléphone, identifiant de compte,
// adresse IP, contenu de formulaire. Uniquement un identifiant anonyme propre
// au site, et des noms d'éléments d'interface. C'est ce qui permet de rester
// dans l'exemption de consentement de la CNIL (mesure d'audience) et donc de
// ne pas imposer de bandeau. Ne jamais ajouter de donnée personnelle ici.

const ENDPOINT = "/api/an";
const CLE_SESSION = "caela_sid";
const CLE_ORIGINE = "caela_origine";
const TAILLE_LOT = 12;
const DELAI_ENVOI_MS = 2500;

type Props = Record<string, unknown>;

type EvenementBrut = {
  e: string;
  t: number;
  path?: string;
  ref?: string;
  props?: Props;
  exp?: string;
  var?: string;
  org?: string;
  orgp?: string;
};

// ─── Contexte ───────────────────────────────────────────────────────────────
type Contexte = { anonId: string; suivi: boolean };

const AnalyticsCtx = createContext<Contexte>({ anonId: "", suivi: false });
export const AnalyticsContexteProvider = AnalyticsCtx.Provider;
export const useAnalytics = () => useContext(AnalyticsCtx);

// ─── File d'attente ─────────────────────────────────────────────────────────
let file: EvenementBrut[] = [];
let minuteur: ReturnType<typeof setTimeout> | null = null;
let ctxCourant: Contexte = { anonId: "", suivi: false };

export function _majContexte(c: Contexte) {
  ctxCourant = c;
}

/** Lit l'identifiant anonyme posé par le proxy. Vide si le visiteur a refusé. */
export function lireIdAnonyme(): string {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_ID}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : "";
}

function sessionId(): string {
  try {
    let s = sessionStorage.getItem(CLE_SESSION);
    if (!s) {
      s = nouvelIdAnonyme();
      sessionStorage.setItem(CLE_SESSION, s);
    }
    return s;
  } catch {
    return "sans-session";
  }
}

function refuse(): boolean {
  if (typeof document === "undefined") return true;
  return document.cookie.includes(`${COOKIE_OPTOUT}=1`);
}

// ─── Traçabilité du parcours ────────────────────────────────────────────────
// On retient le dernier bouton cliqué, et on le rattache aux événements qui
// suivent (paiement démarré, achat). C'est ce qui permet de dire : « le bouton
// Réserver de la page d'accueil amène 12 % de clients, celui du menu 2 % ».

type Origine = { nom: string; chemin: string; quand: number };

/** Validité de l'attribution : 6 heures. Au-delà, on n'attribue plus. */
const DUREE_ORIGINE_MS = 6 * 60 * 60 * 1000;

function lireOrigine(): Origine | null {
  try {
    const brut = sessionStorage.getItem(CLE_ORIGINE);
    if (!brut) return null;
    const o = JSON.parse(brut) as Origine;
    if (!o?.nom || Date.now() - o.quand > DUREE_ORIGINE_MS) return null;
    return o;
  } catch {
    return null;
  }
}

function ecrireOrigine(nom: string) {
  try {
    sessionStorage.setItem(
      CLE_ORIGINE,
      JSON.stringify({ nom, chemin: window.location.pathname, quand: Date.now() }),
    );
  } catch {
    /* navigation privée : on perd juste l'attribution */
  }
}

function empiler(brut: EvenementBrut, attribuer: boolean) {
  if (attribuer) {
    const o = lireOrigine();
    if (o) {
      brut.org = o.nom;
      brut.orgp = o.chemin;
    }
  }
  file.push(brut);
  if (file.length >= TAILLE_LOT) return envoyer();
  if (!minuteur) minuteur = setTimeout(() => envoyer(), DELAI_ENVOI_MS);
}

function envoyer(sync = false) {
  if (minuteur) {
    clearTimeout(minuteur);
    minuteur = null;
  }
  if (file.length === 0 || !ctxCourant.anonId) return;

  const charge = JSON.stringify({
    p: PRODUIT,
    aid: ctxCourant.anonId,
    sid: sessionId(),
    ev: file,
  });
  file = [];

  try {
    if (sync && typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, new Blob([charge], { type: "application/json" }));
      return;
    }
    void fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: charge,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Le tracking ne doit JAMAIS casser une page. On abandonne en silence.
  }
}

/**
 * Enregistre un événement. Ne lève jamais d'erreur, ne bloque jamais l'affichage.
 * ⚠️ Ne jamais passer de donnée personnelle dans `props`.
 */
export function track(evenement: NomEvenement, props?: Props) {
  if (typeof window === "undefined" || refuse()) return;

  empiler(
    {
      e: String(evenement).slice(0, 60),
      t: Date.now(),
      path: window.location.pathname.slice(0, 300),
      ref: document.referrer ? document.referrer.slice(0, 300) : undefined,
      props: props && Object.keys(props).length ? props : undefined,
    },
    true,
  );
}

/**
 * Enregistre un clic ET retient d'où il vient, pour rattacher les paiements
 * qui suivent. À poser sur tout bouton ou lien qui mène vers l'argent.
 *
 *   <button onClick={() => { trackClic("bouton_reserver_accueil"); ... }}>
 *
 * Le nom doit décrire l'élément, pas la personne : "bouton_reserver_accueil",
 * "lien_tarifs_menu", "carte_offre_pro".
 */
export function trackClic(nom: string, props?: Props) {
  if (typeof window === "undefined" || refuse()) return;
  const propre = nom.slice(0, 60);
  ecrireOrigine(propre);
  empiler(
    {
      e: EV.CLIC,
      t: Date.now(),
      path: window.location.pathname.slice(0, 300),
      org: propre,
      orgp: window.location.pathname.slice(0, 300),
      props,
    },
    false,
  );
}

/** Raccourci : une fonctionnalité vient d'être utilisée. */
export function trackFonction(nom: string, props?: Props) {
  track(EV.FONCTION_UTILISEE, { nom, ...props });
}

/**
 * Envoie un événement une seule fois, quand une condition devient vraie.
 * Fait pour les formulaires : `useTrackSucces(state?.ok, "inscription")`.
 */
export function useTrackSucces(condition: unknown, evenement: NomEvenement, props?: Props) {
  const propsRef = useRef(props);
  propsRef.current = props;
  const fait = useRef(false);

  useEffect(() => {
    if (!condition || fait.current) return;
    fait.current = true;
    track(evenement, propsRef.current);
  }, [condition, evenement]);
}

if (typeof window !== "undefined") {
  const vider = () => envoyer(true);
  window.addEventListener("pagehide", vider);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") vider();
  });
}

// ─── A/B testing ────────────────────────────────────────────────────────────

/**
 * Renvoie la variante à afficher pour une expérience.
 * Calcul déterministe à partir de l'identifiant anonyme : la personne verra
 * toujours la même version. Renvoie "A" (référence) si le test est arrêté.
 */
export function useVariant(cle: string): string {
  const { anonId } = useAnalytics();
  const exp = EXPERIENCES.find((x) => x.cle === cle);
  const variante = useMemo(() => {
    if (!exp || !exp.active || !anonId) return "A";
    return choisirVariante(anonId, cle, exp.variantes);
  }, [exp, anonId, cle]);

  const deja = useRef(false);
  useEffect(() => {
    if (deja.current || !exp?.active || !anonId || refuse()) return;
    deja.current = true;
    empiler(
      {
        e: EV.EXP_EXPOSE,
        t: Date.now(),
        path: window.location.pathname,
        exp: cle,
        var: variante,
        props: { objectif: exp.objectif },
      },
      false,
    );
    envoyer();
  }, [exp, anonId, cle, variante]);

  return variante;
}

/** Marque la réussite d'une expérience (la personne a fait ce qu'on visait). */
export function convert(cle: string, props?: Props) {
  const exp = EXPERIENCES.find((x) => x.cle === cle);
  if (!exp || !ctxCourant.anonId || refuse()) return;
  empiler(
    {
      e: EV.EXP_REUSSI,
      t: Date.now(),
      path: typeof window !== "undefined" ? window.location.pathname : undefined,
      exp: cle,
      var: choisirVariante(ctxCourant.anonId, cle, exp.variantes),
      props,
    },
    false,
  );
  envoyer();
}

// ─── Refus de la mesure ─────────────────────────────────────────────────────
// Obligatoire même sous exemption : la personne doit pouvoir s'opposer.

export function refuserLaMesure() {
  document.cookie = `${COOKIE_OPTOUT}=1; path=/; max-age=31536000; SameSite=Lax`;
  // On efface aussi l'identifiant déjà posé : plus aucune trace côté navigateur.
  document.cookie = `${COOKIE_ID}=; path=/; max-age=0; SameSite=Lax`;
  file = [];
  ctxCourant = { anonId: "", suivi: false };
}

export function accepterLaMesure() {
  document.cookie = `${COOKIE_OPTOUT}=; path=/; max-age=0; SameSite=Lax`;
}

export function mesureRefusee(): boolean {
  return refuse();
}
