"use client";

import { useEffect } from "react";

// Pont Caela Embed : la page annonce sa hauteur réelle au site qui l'affiche
// en iframe. Ne s'active que si l'URL porte ?embed=1 (posé par le Hub).
// Aucun contenu ne sort d'ici, seulement un nombre.
export default function EmbedBridge() {
  useEffect(() => {
    if (typeof window === "undefined" || window.parent === window) return;
    try {
      if (new URLSearchParams(window.location.search).get("embed") !== "1") return;
    } catch {
      return;
    }

    // On NE mesure PAS documentElement.scrollHeight : dans une iframe, la page
    // s'étire à la hauteur du cadre, donc la mesure ne redescend jamais et le
    // widget reste bloqué à sa taille maximale.
    const contentHeight = (): number => {
      const kids = Array.from(document.body?.children ?? []);
      let bottom = 0;
      for (const k of kids) {
        const el = k as HTMLElement;
        if (getComputedStyle(el).position === "fixed") continue;
        const b = el.getBoundingClientRect().bottom + window.scrollY;
        if (b > bottom) bottom = b;
      }
      return bottom > 0 ? Math.ceil(bottom) : document.documentElement.scrollHeight;
    };

    let last = 0;
    const send = () => {
      const h = contentHeight();
      if (Math.abs(h - last) < 2) return;
      last = h;
      try {
        window.parent.postMessage({ type: "caela:height", height: h }, "*");
      } catch {
        /* le site hôte a disparu */
      }
    };

    send();
    const ro = new ResizeObserver(send);
    Array.from(document.body?.children ?? []).forEach((k) => ro.observe(k));
    const mo = new MutationObserver(() => {
      Array.from(document.body?.children ?? []).forEach((k) => ro.observe(k));
      send();
    });
    if (document.body) mo.observe(document.body, { childList: true });

    const t = window.setInterval(send, 600);
    window.addEventListener("load", send);

    return () => {
      ro.disconnect();
      mo.disconnect();
      window.clearInterval(t);
      window.removeEventListener("load", send);
    };
  }, []);

  return null;
}
