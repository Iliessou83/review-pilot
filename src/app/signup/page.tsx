import type { Metadata } from "next";
import SignupClient from "./SignupClient";

export const metadata: Metadata = {
  title: "Créer votre compte — Essai gratuit 14 jours — Caela Réputation",
  description: "Créez votre compte Caela Réputation et démarrez votre essai gratuit de 14 jours : réponses automatiques aux avis Google, plaques NFC, suggestions IA.",
};

export default function SignupPage() {
  return <SignupClient />;
}
