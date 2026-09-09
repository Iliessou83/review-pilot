import type { Metadata } from "next";
import AuditClient from "./AuditClient";

export const metadata: Metadata = {
  title: "Audit de votre fiche Google ou Trustpilot — Caela Réputation",
  description: "Audit de réputation Caela. Les connexions Google et Trustpilot restent désactivées tant que leurs autorisations et licences ne sont pas validées.",
};

export default function AuditPage() {
  return (
    <AuditClient
      googleAuditEnabled={process.env.ENABLE_GOOGLE_PLACES_AUDIT === "true"}
      trustpilotAuditEnabled={process.env.ENABLE_TRUSTPILOT_AUDIT === "true"}
    />
  );
}
