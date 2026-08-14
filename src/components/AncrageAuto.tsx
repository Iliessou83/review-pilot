"use client";

import { useEffect } from "react";

/**
 * Fait atterrir tous les ancrages au bon endroit, sous la barre fixe.
 *
 * Le problème corrigé : un lien vers `#tarifs` amène le navigateur pile sur le
 * titre, que la barre fixe recouvre ensuite. On voit le milieu de la section et
 * on croit que le bouton est cassé.
 *
 * Plutôt que d'écrire une hauteur en dur (fausse dès qu'on change le header ou
 * qu'on passe sur mobile), on MESURE la barre au chargement et à chaque
 * redimensionnement, et on écrit sa hauteur dans une variable CSS.
 *
 * Corrige aussi le cas que Next ne gère pas seul : arriver sur une autre page
 * avec un `#ancre` dans l'URL ne déclenche aucun défilement.
 */
export default function AncrageAuto({ marge = 12 }: { marge?: number }) {
  useEffect(() => {
    const racine = document.documentElement;

    /** Hauteur réelle de la barre collée en haut, 0 s'il n'y en a pas. */
    function mesurer(): number {
      const candidats = Array.from(
        document.querySelectorAll<HTMLElement>("header, nav, [data-barre-fixe]"),
      );
      let max = 0;
      for (const el of candidats) {
        const st = getComputedStyle(el);
        if (st.position !== "fixed" && st.position !== "sticky") continue;
        const r = el.getBoundingClientRect();
        // Seulement ce qui est collé EN HAUT : une tab bar en bas ne compte pas.
        if (r.top > 4 || r.height === 0 || r.height > 200) continue;
        max = Math.max(max, r.height);
      }
      return Math.round(max);
    }

    function appliquer() {
      racine.style.setProperty("--ancrage", `${mesurer() + marge}px`);
    }

    appliquer();
    window.addEventListener("resize", appliquer);
    const t = setTimeout(appliquer, 600); // après le chargement des polices

    /** Défilement vers l'ancre présente dans l'URL, avec le bon décalage. */
    function versAncre() {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) return;
      const cible = document.getElementById(id);
      if (!cible) return;
      const haut = cible.getBoundingClientRect().top + window.scrollY - (mesurer() + marge);
      window.scrollTo({ top: Math.max(0, haut), behavior: "smooth" });
    }

    // Au premier rendu, la cible peut ne pas être encore montée.
    const t2 = setTimeout(versAncre, 250);
    window.addEventListener("hashchange", versAncre);

    return () => {
      window.removeEventListener("resize", appliquer);
      window.removeEventListener("hashchange", versAncre);
      clearTimeout(t);
      clearTimeout(t2);
    };
  }, [marge]);

  return null;
}
