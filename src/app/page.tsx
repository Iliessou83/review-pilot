import type { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "Caela Réputation — Réponses automatiques aux avis Google par IA",
  description: "L'IA détecte chaque avis Google, répond aux 4-5★ en 30 secondes et vous envoie 3 suggestions par email pour les avis négatifs. Un clic pour publier. Essai gratuit 14 jours.",
};

export default function HomePage() {
  return <HomeClient />;
}
