/** Helpers purs, utilisables côté serveur comme côté navigateur. */

export const COOKIE_ID = "caela_aid";
export const COOKIE_OPTOUT = "caela_no_stats";
/** 13 mois, la durée maximale tolérée par la CNIL pour la mesure d'audience. */
export const DUREE_ID_SECONDES = 60 * 60 * 24 * 395;

/**
 * Hachage FNV-1a. Déterministe et identique serveur/navigateur : c'est ce qui
 * garantit qu'une même personne voit toujours la même variante d'un test A/B.
 */
export function hachage(texte: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < texte.length; i++) {
    h ^= texte.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Choisit une variante de façon stable pour un identifiant donné. */
export function choisirVariante(anonId: string, cle: string, variantes: readonly string[]): string {
  if (variantes.length === 0) return "A";
  return variantes[hachage(`${cle}:${anonId}`) % variantes.length];
}

export function appareilDepuisUA(ua: string | null | undefined): string {
  if (!ua) return "inconnu";
  if (/iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(ua)) return "tablette";
  if (/Mobi|Android|iPhone|iPod|Windows Phone/i.test(ua)) return "mobile";
  return "ordinateur";
}

/** Identifiant anonyme : aléatoire, sans aucune donnée personnelle dedans. */
export function nouvelIdAnonyme(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `a-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}
