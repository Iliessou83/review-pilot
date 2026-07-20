import type { Metadata } from "next";
import AuditClient from "./AuditClient";

export const metadata: Metadata = {
  title: "Audit gratuit de votre fiche Google ou Trustpilot — Caela Réputation",
  description: "Analysez gratuitement votre réputation en ligne en 30 secondes. Sans inscription, résultat immédiat et rapport détaillé par email pour votre fiche Google Business ou Trustpilot.",
};

export default function AuditPage() {
  return <AuditClient />;
}
