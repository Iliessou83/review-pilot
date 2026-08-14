/**
 * PLAN D'ÉVÉNEMENTS COMMUN — à respecter dans TOUS les SaaS.
 *
 * Règle : on n'invente jamais un nom d'événement à la volée. Si deux produits
 * nomment la même action différemment, plus rien n'est comparable dans Nexus.
 * Un événement spécifique à un produit se nomme `produit_action` en minuscules.
 */

export const EV = {
  // ─── Le tronc commun, identique partout ───────────────────────
  /** Une page a été vue. Envoyé automatiquement par AnalyticsProvider. */
  PAGE_VUE: "page_vue",
  /** Un compte vient d'être créé. */
  INSCRIPTION: "inscription",
  /** Connexion à un compte existant. */
  CONNEXION: "connexion",
  /** Premier vrai usage du produit : la personne a compris à quoi il sert. */
  ACTIVATION: "activation",
  /** Une fonctionnalité a été utilisée. props: { nom: "..." } */
  FONCTION_UTILISEE: "fonction_utilisee",
  /** Clic sur un bouton/lien qui mène vers l'argent. Voir trackClic(). */
  CLIC: "clic",
  /** L'app a été installée sur le téléphone (PWA). */
  APP_INSTALLEE: "app_installee",
  /** Le bloc « installer l'app » a été affiché. */
  INSTALL_PROPOSEE: "install_proposee",
  /** La page ou le bloc tarifs a été affiché. */
  TARIFS_VUS: "tarifs_vus",
  /** Une bannière promo est réellement apparue à l'écran. props: { nom } */
  BANNIERE_VUE: "banniere_vue",
  /** Une bannière promo a été fermée par le visiteur. props: { nom } */
  BANNIERE_FERMEE: "banniere_fermee",
  /** Le mur payant a été affiché. props: { raison: "..." } */
  PAYWALL_VU: "paywall_vu",
  /** Le tunnel de paiement a démarré. props: { offre, montant } */
  PAIEMENT_COMMENCE: "paiement_commence",
  /** Le paiement a abouti. props: { offre, montant } */
  ACHAT: "achat",
  /** Un formulaire a été envoyé. props: { formulaire: "contact" } */
  FORMULAIRE_ENVOYE: "formulaire_envoye",
  /** Erreur visible par l'utilisateur. props: { message } */
  ERREUR_VUE: "erreur_vue",
  /** Exposition à une variante d'A/B test. Envoyé par useVariant. */
  EXP_EXPOSE: "exp_expose",
  /** Réussite d'une expérience A/B. Envoyé par convert(). */
  EXP_REUSSI: "exp_reussi",
} as const;

export type NomEvenement = (typeof EV)[keyof typeof EV] | (string & {});
