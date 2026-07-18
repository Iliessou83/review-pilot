/**
 * Détection de risque + fact-checking avant génération de réponse IA.
 *
 * Deux jobs distincts :
 * 1. Escalade : certains sujets (santé, hygiène, allergène, litige) ne doivent
 *    JAMAIS partir en auto-réponse, quelle que soit la note. Toujours forcer
 *    la validation humaine.
 * 2. Fact-check : croiser ce que dit l'avis avec la fiche produits du
 *    commerçant (ProductFact[]) pour empêcher l'IA de confirmer une
 *    accusation fausse (ex: "c'est congelé" alors que le produit est frais
 *    et annoncé comme tel).
 */
import type { ProductFact } from "@/db/schema";

// Sujets à toujours faire valider par un humain — jamais d'auto-publication.
export const DEFAULT_ESCALATION_KEYWORDS: string[] = [
  "intoxication", "malade", "vomi", "hôpital", "urgence",
  "allergie", "allergène", "allergique",
  "corps étranger", "insecte", "cheveux", "verre",
  "hygiène", "sale", "moisi", "périmé", "avarié",
  "discrimination", "raciste", "agressif", "agression", "menace",
  "vol", "arnaque", "escroquerie", "procès", "avocat", "plainte",
];

// Mots qui indiquent une allégation sur l'état du produit, à croiser avec la fiche.
const FROZEN_TERMS = ["congelé", "surgelé", "décongelé"];
const FRESH_TERMS = ["frais", "fraîche", "fraîcheur"];

export type RiskAssessment = {
  /** true = ne jamais auto-publier, toujours passer par la validation humaine */
  escalate: boolean;
  /** raisons lisibles de l'escalade (mots-clés déclencheurs) */
  reasons: string[];
  /** notes de fact-check à injecter dans le prompt IA */
  factCheckNotes: string[];
};

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, ""); // enlève les accents pour un match robuste
}

export function assessReviewRisk(
  reviewText: string,
  productFacts: ProductFact[] = [],
  customKeywords: string[] = []
): RiskAssessment {
  const normalized = normalize(reviewText);
  const reasons: string[] = [];
  const factCheckNotes: string[] = [];

  const allKeywords = [...DEFAULT_ESCALATION_KEYWORDS, ...customKeywords];
  for (const kw of allKeywords) {
    if (normalized.includes(normalize(kw))) {
      reasons.push(kw);
    }
  }

  const mentionsFrozen = FROZEN_TERMS.some(t => normalized.includes(t));
  const mentionsFresh = FRESH_TERMS.some(t => normalized.includes(t));

  if (mentionsFrozen || mentionsFresh) {
    for (const fact of productFacts) {
      const categoryMentioned = normalized.includes(normalize(fact.category));
      if (!categoryMentioned) continue;

      if (mentionsFrozen && fact.status === "frais") {
        factCheckNotes.push(
          `Le client affirme que "${fact.category}" est congelé/surgelé, mais la fiche de l'établissement indique que ce produit est FRAIS. ` +
          `NE CONFIRME PAS cette allégation. Réponds de façon factuelle et calme, invite à en discuter en direct plutôt que de t'excuser du principe.`
        );
        reasons.push(`contradiction fiche produit: ${fact.category}`);
      } else if (mentionsFrozen && (fact.status === "surgele" || fact.status === "mixte") && fact.disclosed) {
        factCheckNotes.push(
          `Le client dit que "${fact.category}" est congelé/surgelé : c'est VRAI et déjà annoncé en boutique. ` +
          `Tu peux reconnaître le fait sans t'excuser du principe (ce n'est pas une faute) — explique que c'est indiqué en rayon.`
        );
      } else if (mentionsFrozen && (fact.status === "surgele" || fact.status === "mixte") && !fact.disclosed) {
        factCheckNotes.push(
          `Le client dit que "${fact.category}" est congelé/surgelé : c'est vrai, ET ce n'est PAS annoncé en boutique. ` +
          `C'est une vraie faute de transparence. Excuse-toi sincèrement pour le manque d'annonce claire, sans dramatiser.`
        );
      }
    }
  }

  return {
    escalate: reasons.length > 0,
    reasons: Array.from(new Set(reasons)),
    factCheckNotes,
  };
}
