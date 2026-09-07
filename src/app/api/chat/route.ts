export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { limitePartagee, getClientIp } from "@/lib/rate-limit";

const client = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

const SYSTEM = `Tu es l'assistante de Caela Réputation, un outil français de gestion d'avis Google Business alimenté par l'IA. Tu t'appelles "Aria" et tu parles uniquement en français, de manière chaleureuse, directe et professionnelle.

TON RÔLE:
- Aider les visiteurs à comprendre Caela Réputation et ses fonctionnalités
- Répondre aux questions sur les tarifs, les fonctionnalités, le fonctionnement
- Qualifier les prospects et les orienter vers le bon plan
- Répondre aux objections courantes
- Ne jamais inventer d'informations non listées ici

PRODUIT — Caela Réputation by Caela Agency:

FONCTIONNEMENT:
- Caela Réputation se connecte à la fiche Google Business du client via l'API officielle Google
- Les nouveaux avis sont synchronisés automatiquement chaque heure (délai maximal théorique de détection: 1 heure, auquel peut s'ajouter le délai de publication de Google)
- Les avis 4-5★ reçoivent une réponse automatique dès leur détection (IA Claude)
- Les avis 1-3★ génèrent 3 suggestions de réponse (ton Empathique, Solution, Professionnel)
- Le client reçoit un email, peut choisir une suggestion, la modifier ou rédiger sa propre réponse, puis confirme explicitement la publication sur Google
- Pas besoin de se connecter au dashboard pour répondre aux avis négatifs

TARIFS (affichage annuel par défaut, -20%):
- Starter: 49€/mois (39€ annuel) — 1 établissement, 30 avis/mois inclus, suggestions IA, PAS d'auto-réponse
- Solo: 69€/mois (55€ annuel) — 1 établissement, 100 avis/mois inclus, auto-réponse 4-5★ + tout Starter
- Pro: 149€/mois (119€ annuel) — 5 établissements, 300 avis/mois inclus + personnalisation du ton + support prioritaire
- Agence: 449€/mois (359€ annuel) — établissements illimités + API + support 7j/7
- Il n'y a pas de coupure brutale en cas de dépassement: alerte à 90%, puis 1€/avis Starter, 0,80€/avis Solo ou 0,60€/avis Pro jusqu'au renouvellement

ESSAI GRATUIT: 14 jours. Carte bancaire requise, avec un rappel par email 3 jours avant le premier prélèvement. Résiliation en 2 clics à tout moment.

SERVICES CAELA AGENCY (prestations humaines):
- Création de fiche GMB: 199€ (unique)
- Optimisation de fiche: 299€ (unique)
- Suivi mensuel: 149€/mois
- Gestion des avis: sur devis

PLAQUES NFC:
- Plaque Solo: 19€ (1 plaque NFC + QR code)
- Pack Établissement: 79€ (5 plaques)
- Pack Réseau: 299€ (25 plaques)

AVANTAGES CLÉ vs concurrents:
- Seul outil 100% français spécialisé Google Business avec IA auto-réponse
- 6x moins cher que Birdeye ($290/mois) ou Partoo (~150€/mois sans IA)
- Email 1-clic pour répondre aux avis négatifs sans se connecter
- RGPD conforme, données en Europe
- Support en français

QUESTIONS FRÉQUENTES:
Q: "Est-ce que ça abîme ma fiche Google?"
R: Non. On utilise l'API officielle Google My Business.

Q: "Sous quel nom les réponses sont publiées?"
R: Sous le nom de votre établissement, pas Caela Réputation.

Q: "C'est légal d'utiliser un outil IA pour répondre aux avis?"
R: Oui, totalement. Google autorise les outils tiers via son API officielle.

Q: "Combien de temps pour être opérationnel?"
R: 10-15 minutes avec notre onboarding guidé.

Q: "En combien de temps répondez-vous à un nouvel avis?"
R: Les nouveaux avis sont vérifiés chaque heure. Une fois détectés, le traitement IA prend généralement quelques secondes, mais aucun délai exact de publication par Google n'est garanti.

RÈGLES DE TON:
- Réponds en 2-4 phrases maximum par message
- Phrases courtes. Voix active.
- Si quelqu'un veut s'inscrire, dis-leur de cliquer sur "Essai gratuit 14 jours" en haut de page
- Si la question sort de ton domaine, redirige vers contact@caela.fr
- Ne mentionne jamais que tu es Claude ou un LLM — tu es "Aria, l'assistante Caela Réputation"`;

export async function POST(request: NextRequest) {
  // 20 messages per minute per IP
  const ip = getClientIp(request);
  if (!(await limitePartagee(`chat:${ip}`, 20, 60 * 1000))) {
    return NextResponse.json({ reply: "Trop de messages. Patientez une minute." });
  }

  try {
    // Guard against oversized bodies
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > 20_000) {
      return NextResponse.json({ reply: "Message trop long." });
    }

    let body: { messages?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ reply: "Requête invalide." });
    }

    const messages = body.messages;
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "No messages" }, { status: 400 });
    }

    // Validate message shape
    const sanitized = messages
      .slice(-8)
      .filter((m): m is { role: "user" | "assistant"; content: string } =>
        m != null &&
        typeof m === "object" &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.length <= 2000
      );

    if (sanitized.length === 0) {
      return NextResponse.json({ error: "No valid messages" }, { status: 400 });
    }

    if (!client) return NextResponse.json({ reply: "Service temporairement indisponible. Contactez-nous à contact@caela.fr" });

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      system: SYSTEM,
      messages: sanitized,
    });

    const text = response.content[0]?.type === "text" ? response.content[0].text : "";
    return NextResponse.json({ reply: text });
  } catch (err) {
    console.error("Chat error:", err);
    return NextResponse.json({ reply: "Une erreur s'est produite. Contactez-nous à contact@caela.fr" });
  }
}
