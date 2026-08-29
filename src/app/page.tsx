import type { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "Caela Réputation — Réponses automatiques aux avis Google par IA",
  description: "L'IA détecte chaque avis Google, répond aux 4-5★ en 30 secondes et vous envoie 3 suggestions par email pour les avis négatifs. Un clic pour publier. Essai gratuit 14 jours.",
};

// Balisage schema.org : décrit le produit (offres réelles alignées sur PLANS
// dans HomeClient.tsx — Starter 39€, Solo 69€, Pro 149€/mois) pour que Google
// puisse afficher un extrait enrichi (prix, note) dans les résultats.
const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Caela Réputation",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "IA de gestion d'avis Google Business : réponses automatiques aux avis 4-5 étoiles, suggestions pour les avis négatifs, surveillance 24/7.",
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "EUR",
    lowPrice: "39",
    highPrice: "149",
    offerCount: "3",
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
