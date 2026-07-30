/**
 * SOURCE UNIQUE DE VÉRITÉ — Conformité légale & facturation.
 *
 * Tout le contenu juridique (mentions légales, CGV, confidentialité, cookies)
 * et le tunnel d'essai/abonnement lisent CE fichier. Pour changer d'entité
 * (micro-entreprise -> LTD), on modifie UNIQUEMENT le bloc `entity` ci-dessous.
 *
 * Réutilisable tel quel sur tous les SaaS Caela : copier ce fichier, adapter
 * `product`, `entity` et `plans`. Le reste de la logique de conformité suit.
 */

// ── 1. ENTITÉ JURIDIQUE ──────────────────────────────────────────────────────
// Statut actuel : micro-entreprise. Passage LTD : remplacer `type` par "ltd"
// et remplir le bloc `ltd`. Les pages légales s'adaptent automatiquement.

type EntityType = "micro" | "ltd";

export const entity = {
  type: "micro" as EntityType,

  // Commun aux deux statuts
  tradeName: "Caela Réputation", // nom commercial du service
  brand: "Caela Agency", // marque mère
  publisher: "Iliès Bourbouane", // directeur de la publication
  contactEmail: "contact@caela.fr",
  supportEmail: "contact@caela.fr",

  // Adresse PUBLIQUE du service, celle qu'un visiteur peut réellement ouvrir.
  // Les pages légales, les CGV et le lien de parrainage annonçaient
  // `caela-reputation.fr`, qui ne résout pas (aucun DNS, `curl` rend 000) :
  // le texte légal citait un site inexistant, et le lien de parrainage partagé
  // par les clients en WhatsApp menait dans le vide, donc filleul perdu.
  // Le jour où un vrai domaine existe, il suffit de poser NEXT_PUBLIC_APP_URL.
  siteUrl: process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://review-pilot-iota.vercel.app",

  // Statut micro-entreprise (FR)
  micro: {
    legalName: "Bourbouane Iliès", // raison sociale = nom de l'EI
    legalForm: "Entreprise individuelle (micro-entreprise)",
    siret: "À_RENSEIGNER", // OBLIGATOIRE et visible (LCEN art. 6). Ne pas masquer.
    vatNumber: "Non assujetti à la TVA — art. 293 B du CGI",
    address: "À_RENSEIGNER", // adresse de l'EI (peut être domiciliation)
    country: "France",
  },

  // Statut société UK (à remplir si bascule LTD)
  ltd: {
    legalName: "À_RENSEIGNER LTD",
    companyNumber: "À_RENSEIGNER", // Companies House number
    registeredOffice: "À_RENSEIGNER, United Kingdom",
    vatNumber: "À_RENSEIGNER", // si enregistré
    // RGPD : une LTD sans établissement UE DOIT nommer un représentant UE (art. 27).
    euRepresentative: "À_RENSEIGNER",
    country: "United Kingdom",
  },
} as const;

// Helper : renvoie les champs d'affichage selon le statut actif.
export function legalIdentity() {
  if (entity.type === "ltd") {
    return {
      legalName: entity.ltd.legalName,
      legalForm: "Private Company Limited by Shares (UK LTD)",
      registration: `Companies House n° ${entity.ltd.companyNumber}`,
      office: entity.ltd.registeredOffice,
      vat: entity.ltd.vatNumber,
      country: entity.ltd.country,
      euRepresentative: entity.ltd.euRepresentative,
    };
  }
  return {
    legalName: entity.micro.legalName,
    legalForm: entity.micro.legalForm,
    registration: `SIRET ${entity.micro.siret}`,
    office: entity.micro.address,
    vat: entity.micro.vatNumber,
    country: entity.micro.country,
    euRepresentative: null,
  };
}

// ── 2. HÉBERGEMENT ───────────────────────────────────────────────────────────
export const hosting = {
  provider: "Vercel Inc.",
  address: "340 S Lemon Ave #4133, Walnut, CA 91789, USA",
  contact: "privacy@vercel.com",
  // Données hébergées en région UE + transferts encadrés par les CCT (clauses
  // contractuelles types) approuvées par la Commission européenne.
} as const;

// ── 3. CONDITIONS D'ESSAI & FACTURATION (le cœur anti-problème) ──────────────
// Modèle : essai gratuit AVEC carte bancaire obligatoire, prélèvement
// automatique à la fin de l'essai SAUF résiliation. 100% légal à condition de
// respecter les garde-fous ci-dessous (ils sont obligatoires, pas optionnels).

export const billing = {
  currency: "eur",
  trialDays: 14,

  // Garde-fous légaux activés (DGCCRF / Code de la consommation / Code Chatel).
  // NE PAS désactiver : ce sont eux qui rendent le prélèvement opposable et
  // évitent chargebacks + sanctions.
  guards: {
    requireCardOnTrial: true, // CB obligatoire dès l'inscription
    showBillingDisclosureBeforePay: true, // récap prix + date avant validation
    explicitConsentCheckbox: true, // case à cocher non pré-cochée
    reminderEmailDaysBefore: 3, // email de rappel J-3 avant prélèvement
    cancelInThreeClicks: true, // résiliation en ligne ≤ 3 clics (loi 2023)
  },

  // Droit de rétractation : pour un service numérique exécuté immédiatement,
  // le client renonce à la rétractation 14j en cochant le consentement, sinon
  // il conserve 14 jours. On l'expose clairement dans les CGV.
  withdrawalDays: 14,

  // Médiateur de la consommation (obligatoire B2C FR). À souscrire (CM2C, etc.).
  mediator: {
    name: "À_RENSEIGNER (ex: CM2C — Centre de la médiation de la consommation)",
    url: "https://www.cm2c.net",
    address: "À_RENSEIGNER",
  },

  // Plateforme RLL européenne (obligatoire en lien sur le site B2C).
  odrPlatform: "https://ec.europa.eu/consumers/odr",
} as const;

// ── 4. OFFRES ────────────────────────────────────────────────────────────────
// `priceEnv` = nom de la variable d'env contenant le Price ID Stripe.
// On ne hardcode jamais un Price ID : il vit dans les env Vercel.
// `maxBusinesses` = nombre d'établissements inclus (null = illimité).
// `monthlyReviewQuota` = avis traités/mois inclus (null = illimité).
// `overagePricePerReview` = supplément facturé par avis au-delà du quota
// (null = pas de dépassement possible, soit illimité soit non applicable).
// Décision produit (2026-07-19) : jamais de blocage sec au dépassement —
// alerte à 90% du quota, puis service continu + petit supplément jusqu'au
// renouvellement plutôt qu'un système de crédits à la carte.
// Ces champs sont la source unique de vérité pour l'application des
// limites (voir src/lib/plan-limits.ts) — cohérent avec les chiffres déjà
// annoncés sur la page d'accueil (cartes plans + calculateur + comparatif).

export const plans = [
  {
    id: "starter",
    name: "Starter",
    priceMonthly: 29,
    priceEnv: "STRIPE_PRICE_STARTER",
    quota: "Jusqu'à 30 avis/mois",
    maxBusinesses: 1,
    monthlyReviewQuota: 30,
    overagePricePerReview: 1,
  },
  {
    id: "solo",
    name: "Solo",
    priceMonthly: 69,
    priceEnv: "STRIPE_PRICE_SOLO",
    quota: "Jusqu'à 100 avis/mois",
    maxBusinesses: 1,
    monthlyReviewQuota: 100,
    overagePricePerReview: 0.8,
  },
  {
    id: "pro",
    name: "Pro",
    priceMonthly: 149,
    priceEnv: "STRIPE_PRICE_PRO",
    quota: "Jusqu'à 300 avis/mois — 5 établissements",
    maxBusinesses: 5,
    monthlyReviewQuota: 300,
    overagePricePerReview: 0.6,
  },
  {
    id: "studio",
    name: "Studio",
    priceMonthly: 299,
    priceEnv: "STRIPE_PRICE_STUDIO",
    quota: "Avis illimités — 5 établissements",
    maxBusinesses: 5,
    monthlyReviewQuota: null,
    overagePricePerReview: null,
  },
  {
    id: "agence",
    name: "Agence",
    priceMonthly: 449,
    priceEnv: "STRIPE_PRICE_AGENCE",
    quota: "Avis illimités — établissements illimités",
    maxBusinesses: null,
    monthlyReviewQuota: null,
    overagePricePerReview: null,
  },
] as const;

export type Plan = (typeof plans)[number];

export function planById(id: string): Plan | undefined {
  return plans.find((p) => p.id === id);
}

// Phrase de divulgation standardisée affichée avant tout paiement d'essai.
// Conforme à l'obligation d'information précontractuelle (art. L221-5 C. conso).
export function trialDisclosure(plan: Plan): string {
  return (
    `Essai gratuit de ${billing.trialDays} jours. ` +
    `Carte bancaire requise. À la fin de l'essai, votre abonnement ${plan.name} ` +
    `démarre automatiquement à ${plan.priceMonthly}€/mois, sauf résiliation ` +
    `avant la fin de l'essai. Résiliable à tout moment en ligne en 2 clics. ` +
    `Email de rappel envoyé ${billing.guards.reminderEmailDaysBefore} jours ` +
    `avant le premier prélèvement.`
  );
}
