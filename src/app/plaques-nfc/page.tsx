import type { Metadata } from "next";
import PlaquesNfcClient from "./PlaquesNfcClient";

export const metadata: Metadata = {
  title: "Plaques NFC pour avis Google en 20 secondes — Caela Réputation",
  description: "Posez la plaque NFC sur votre comptoir : le client approche son téléphone, Google Avis s'ouvre directement. Pas d'appli, pas de QR code à scanner, zéro friction.",
};

export default function PlaquesNfcPage() {
  return <PlaquesNfcClient />;
}
