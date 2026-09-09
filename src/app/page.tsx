import type { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "Caela Réputation — Réponses automatiques aux avis Google par IA",
  description: "Après autorisation et activation explicites, Caela détecte les avis Google, peut répondre aux 4-5★ et prépare des suggestions pour les avis sensibles. Essai gratuit 14 jours.",
};

// Balisage schema.org : décrit le produit (offres réelles alignées sur PLANS
// dans legal.config.ts — Starter 49€/mois (39€/mois en annuel), Solo 69€,
// Pro 149€/mois, Studio 299€/mois) pour décrire les offres disponibles.
const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Caela Réputation",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Gestion d'avis Google Business : détection planifiée, réponses 4-5 étoiles après mandat explicite et suggestions pour les avis sensibles.",
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "EUR",
    lowPrice: "39",
    highPrice: "299",
    offerCount: "4",
  },
  provider: {
    "@type": "Organization",
    name: "Caela Réputation",
    url: "https://review-pilot-iota.vercel.app",
  },
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <HomeClient />
    </>
  );
}
