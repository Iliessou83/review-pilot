import type { Metadata } from "next";
import SignalerAvisClient from "./SignalerAvisClient";

export const metadata: Metadata = {
  title: "Signaler un faux avis Google — Caela Réputation",
  description: "Faites retirer un faux avis, un avis diffamatoire ou posté par un concurrent. 19,90€ par avis retiré, satisfait ou remboursé.",
};

export default function SignalerAvisPage() {
  return <SignalerAvisClient />;
}
