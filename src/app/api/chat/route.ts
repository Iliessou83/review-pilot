export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const client = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

const SYSTEM = `Tu es l'assistant de Caela Réputation, un outil français de gestion d'avis Google Business alimenté par l'IA. Tu t'appelles "Pilot" et tu parles uniquement en français, de manière chaleureuse, directe et professionnelle.

TON RÔLE:
- Aider les visiteurs à comprendre Caela Réputation et ses fonctionnalités
- Répondre aux questions sur les tarifs, les fonctionnalités, le fonctionnement
- Qualifier les prospects et les orienter vers le bon plan
- Répondre aux objections courantes
- Ne jamais inventer d'informations non listées ici

PRODUIT — Caela Réputation by Caela Agency:

FONCTIONNEMENT:
- Caela Réputation se connecte à la fiche Google Business du client via l'API officielle Google
- Les avis 4-5★ reçoivent une réponse automatique en moins de 30 secondes (IA Claude)
- Les avis 1-3★ génèrent 3 suggestions de réponse (ton Empathique, Solution, Professionnel)
- Le client reçoit un email avec les 3 suggestions en boutons cliquables — 1 clic = publié sur Google
- Pas besoin de se connecter au dashboard pour répondre aux avis négatifs

TARIFS (affichage annuel par défaut, -20%):
- Starter: 29€/mois (23€ annuel) — 1 établissement, surveillance + suggestions IA, PAS d'auto-réponse
- Solo: 69€/mois (55€ annuel) — 1 établissement, auto-réponse 4-5★ + tout Starter
- Pro: 149€/mois (119€ annuel) — 5 établissements + personnalisation du ton + multi-users
- Agence: 449€/mois (359€ annuel) — 30 établissements max + API + support 7j/7

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

RÈGLES DE TON:
- Réponds en 2-4 phrases maximum par message
- Phrases courtes. Voix active.
- Si quelqu'un veut s'inscrire, dis-leur de cliquer sur "Essai gratuit 14 jours" en haut de page
- Si la question sort de ton domaine, redirige vers contact@caela.fr
- Ne mentionne jamais que tu es Claude ou un LLM — tu es "Pilot, l'assistant Caela Réputation"`;

export async function POST(request: NextRequest) {
  // 20 messages per minute per IP
  const ip = getClientIp(request);
  if (!rateLimit(`chat:${ip}`, 20, 60 * 1000)) {
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
