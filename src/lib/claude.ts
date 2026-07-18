import Anthropic from "@anthropic-ai/sdk";
import type { ProductFact } from "@/db/schema";

function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

/** Contexte anti-hallucination transmis à chaque génération. */
export type FactContext = {
  productFacts?: ProductFact[];
  factCheckNotes?: string[];
  compensationEnabled?: boolean;
  compensationText?: string | null;
};

function buildFactBlock(ctx?: FactContext): string {
  if (!ctx) return "";

  const parts: string[] = [];

  parts.push(`
RÈGLE FACTUELLE ABSOLUE — priorité sur tout le reste:
• Tu ne dois JAMAIS admettre, valider, ou t'excuser pour un fait matériel (produit périmé, congelé non annoncé, problème d'hygiène, etc.) qui n'est pas explicitement confirmé ci-dessous.
• Si le client affirme quelque chose qui CONTREDIT la fiche de référence, ne t'excuse jamais du principe. Réponds de façon factuelle, calme, non défensive, et invite à en discuter en direct (téléphone/message privé) plutôt que d'assumer une faute non confirmée.
• Une excuse ne porte QUE sur le ressenti du client ("je comprends votre déception"), jamais sur un fait que tu ne peux pas vérifier.`);

  if (ctx.productFacts && ctx.productFacts.length > 0) {
    const lines = ctx.productFacts.map(f => {
      const statusLabel = f.status === "frais" ? "FRAIS" : f.status === "surgele" ? "SURGELÉ" : "FRAIS ET SURGELÉ (selon la pièce)";
      const disclosureLabel = f.disclosed ? "annoncé clairement en boutique" : "PAS annoncé clairement en boutique";
      return `- ${f.category} : ${statusLabel}, ${disclosureLabel}${f.note ? ` — ${f.note}` : ""}`;
    });
    parts.push(`\nFICHE DE RÉFÉRENCE DE L'ÉTABLISSEMENT (source de vérité, ne jamais contredire):\n${lines.join("\n")}`);
  }

  if (ctx.factCheckNotes && ctx.factCheckNotes.length > 0) {
    parts.push(`\nNOTES DE VÉRIFICATION POUR CET AVIS PRÉCIS:\n${ctx.factCheckNotes.map(n => `- ${n}`).join("\n")}`);
  }

  if (ctx.compensationEnabled && ctx.compensationText) {
    parts.push(`
GESTE COMMERCIAL (uniquement si une faute réelle est confirmée par la fiche ou les notes ci-dessus, jamais en échange d'un futur avis):
• Si tu proposes un geste commercial, utilise EXACTEMENT ce texte, ne l'invente jamais autrement: "${ctx.compensationText}"
• Ne propose JAMAIS ce geste comme récompense pour avoir laissé un avis, ni conditionné à une future note.`);
  } else {
    parts.push(`\nNe propose aucun geste commercial, remise ou cadeau : aucun n'est configuré pour cet établissement.`);
  }

  return parts.join("\n");
}

export const TONE_LABELS = [
  { key: "EMPATHIQUE", color: "#EA4335", bg: "#FCE8E6", border: "rgba(234,67,53,0.3)", icon: "💛", desc: "Chaleur & validation émotionnelle" },
  { key: "SOLUTION",   color: "#34A853", bg: "#E6F4EA", border: "rgba(52,168,83,0.3)",  icon: "🎯", desc: "Résolution concrète, tourné vers l'avenir" },
  { key: "PRO",        color: "#1A73E8", bg: "#E8F0FE", border: "rgba(26,115,232,0.3)", icon: "🏆", desc: "Mesuré, image de marque impeccable" },
];

const CORE_RULES = `
RÈGLES ABSOLUES — ne jamais enfreindre:
• Commence TOUJOURS par le prénom du client (jamais "Cher client", jamais "Bonjour,")
• Maximum 3 phrases pour avis positifs. Maximum 5 phrases pour avis négatifs.
• Zéro phrases génériques: bannir "merci de votre retour", "nous sommes désolés pour les inconvénients causés", "n'hésitez pas à revenir"
• Ton humain. Jamais corporate, jamais robotique.
• Mentionne AU MOINS 1 détail spécifique tiré de l'avis — prouve que tu l'as vraiment lu
• Jamais défensif. Jamais d'excuse creuse sans action concrète.
• Vouvoiement systématique sauf si le client tutoie dans son avis
• Signe avec un prénom humain d'un membre de l'équipe (varie: Sophie, Thomas, Leila, Marc, etc.)
• Réponds dans la même langue que l'avis

TECHNIQUES PSYCHOLOGIQUES:
• Mirroir lexical: réutilise 1-2 mots exacts du client (connexion inconsciente, sentiment d'être compris)
• Validation émotionnelle: nomme l'émotion avant de répondre sur le fond (ex: "Votre déception est tout à fait compréhensible.")
• Spécificité radicale: cite un élément précis de l'avis (plat, produit, membre de l'équipe, moment)
• CTA doux et naturel: une invitation, jamais un ordre (ex: "On espère vous revoir" vs "Revenez nous voir")
• Futur-focus pour avis négatifs: toujours tourner vers l'avenir, jamais s'enliser dans le passé

PROTOCOLES PAR NOTE:
★★★★★ Gratitude authentique + mirroring mot-clé positif + 1 détail spécifique + invitation naturelle
★★★★ Remerciement chaleureux + curiosité bienveillante sur le 5ème point manquant + invitation retour concret
★★★ Empathie immédiate + reconnaissance du décalage + étape concrète + ouverture bienveillante
★★ Validation émotion + propriété totale + résolution concrète + engagement de suivi
★ Empathie profonde + propriété totale + action immédiate (contact direct) + engagement personnel et nominatif

INTERDICTIONS ABSOLUES:
• "Nous prenons note de votre retour" → INTERDIT
• "Votre satisfaction est notre priorité" → INTERDIT
• "N'hésitez pas à nous contacter" → INTERDIT (trop passif — donne un contact direct)
• Terminer par "Cordialement" seul → INTERDIT (trop froid)
• Copier-coller le même début pour des avis différents → INTERDIT
`;

function detectContext(rating: number): string {
  if (rating <= 2) return "CRISE: client frustré ou en colère. Priorité absolue: désarmer, valider, proposer une action concrète immédiate. Ne jamais se défendre.";
  if (rating === 3) return "RÉCUPÉRATION: client déçu mais pas fermé. Opportunité de reconquête. Montrer qu'on entend le manque, inviter à revenir pour corriger l'expérience.";
  if (rating === 4) return "FIDÉLISATION: client satisfait mais pas fan. Comprendre ce qui manque pour le 5ème étoile. Créer un lien qui donne envie de revenir.";
  return "AMBASSADEUR: client ravi, potentiel de bouche-à-oreille fort. Renforcer le lien, créer un sentiment d'appartenance, encourager sans demander explicitement.";
}

export async function generateAutoResponse(
  reviewText: string,
  authorName: string,
  businessName: string,
  rating: number,
  factContext?: FactContext
): Promise<string> {
  const firstName = authorName.split(" ")[0];
  const context = detectContext(rating);

  const message = await getClient().messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 400,
    system: `Tu es le responsable e-réputation de ${businessName}. Tu maîtrises la psychologie de la relation client à un niveau expert.

${CORE_RULES}

STYLE:
• Phrases courtes qui claquent. Alterne avec une phrase plus longue si le sens le demande.
• Voix active uniquement. Sujet-Verbe-Complément.
• Zéro adverbes inutiles: "vraiment", "totalement", "effectivement" sont bannis
• Naturel et chaud — comme si c'était un vrai humain qui écrit depuis son téléphone, pas un bot

CONTEXTE DE CET AVIS: ${context}
${buildFactBlock(factContext)}`,
    messages: [
      {
        role: "user",
        content: `Écris UNE réponse parfaite à cet avis ${rating}/5 étoile(s) de ${firstName}:

"${reviewText}"

Établissement: ${businessName}
Prénom client: ${firstName}

Écris UNIQUEMENT la réponse. Rien d'autre.`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");
  return content.text.trim();
}

export async function generateResponseSuggestions(
  reviewText: string,
  authorName: string,
  businessName: string,
  rating: number,
  factContext?: FactContext
): Promise<string[]> {
  const firstName = authorName.split(" ")[0];
  const context = detectContext(rating);

  const message = await getClient().messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
    system: `Tu es un expert en psychologie de la relation client et gestion de e-réputation pour ${businessName}.

${CORE_RULES}
${buildFactBlock(factContext)}

Tu vas générer 3 réponses radicalement distinctes — même fond, 3 approches psychologiques différentes:

1. EMPATHIQUE: Chaleur maximale. Validation émotionnelle profonde. Ton proche, presque intime mais respectueux. Le client doit se sentir vraiment entendu.
2. SOLUTION: 100% tourné vers la résolution et l'avenir. Propose une étape concrète dès la 2ème phrase. Forward-looking. Ne reste pas dans le passé.
3. PRO: Ton mesuré et élégant. Formel mais pas froid. Image de marque premium. Dignité et assurance calme.

RÈGLES POUR CHAQUE RÉPONSE:
• Commence par: "${firstName},"
• Contient 1 détail spécifique de l'avis
• En mode: ${context}
• Vraiment différente des 2 autres par le TON et le CONTENU
• Sous 150 mots maximum
• Signée d'un prénom humain différent pour chaque suggestion

Retourne UNIQUEMENT un tableau JSON valide de 3 strings. Aucun texte avant ou après.`,
    messages: [
      {
        role: "user",
        content: `Génère 3 réponses distinctes pour cet avis ${rating}/5 de ${firstName}:

"${reviewText}"

Établissement: ${businessName}
Contexte: ${context}

Format attendu: ["réponse EMPATHIQUE", "réponse SOLUTION", "réponse PRO"]`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");

  const text = content.text.trim();
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error("Could not parse suggestions JSON");

  const suggestions = JSON.parse(jsonMatch[0]) as string[];
  if (!Array.isArray(suggestions) || suggestions.length !== 3) {
    throw new Error("Expected exactly 3 suggestions");
  }

  return suggestions;
}
