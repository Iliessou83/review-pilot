/**
 * Configuration locale du tracking. C'est LE SEUL fichier du kit à modifier
 * dans chaque projet. Tout le reste est identique partout.
 */

/** Nom court du produit dans Nexus. Une seule valeur, jamais changée après coup. */
export const PRODUIT = "reputation";

/**
 * Expériences A/B définies en dur, dans le code.
 *
 * Pourquoi en dur plutôt qu'en base : l'attribution de la variante se calcule
 * dans le navigateur sans aller-retour réseau. Zéro clignotement au chargement,
 * et donc zéro biais sur le test. La ligne en base est créée automatiquement
 * à la première exposition, Nexus voit l'expérience sans rien faire de plus.
 *
 * Pour arrêter un test : passer `active: false`. Les données restent en base.
 */
export type Experience = {
  /** Identifiant stable, jamais réutilisé. Convention : produit_zone_sujet */
  cle: string;
  nom: string;
  hypothese: string;
  /** L'événement qui compte comme réussite. */
  objectif: string;
  /** Toujours "A" en premier : A est la version actuelle, celle de référence. */
  variantes: readonly [string, string, ...string[]];
  active: boolean;
};

export const EXPERIENCES: readonly Experience[] = [
  // Exemple, à décommenter et adapter le jour où on lance le premier test :
  // {
  //   cle: "anhaya_accueil_titre",
  //   nom: "Titre d'accueil : bénéfice contre promesse",
  //   hypothese: "Un titre centré sur le résultat fait plus réserver qu'un titre poétique.",
  //   objectif: "reservation_commencee",
  //   variantes: ["A", "B"],
  //   active: false,
  // },
] as const;
