import type { Metadata } from "next";
import ParrainageClient from "./ParrainageClient";

export const metadata: Metadata = {
  title: "Parrainage — 1 mois offert par filleul — Caela Réputation",
  description: "Parrainez un ami commerçant et gagnez 1 mois d'abonnement offert dès qu'il s'abonne à Caela Réputation. Simple, cumulable, sans limite.",
};

export default function ParrainagePage() {
  return <ParrainageClient />;
}
