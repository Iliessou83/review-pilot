"use client";

import Link from "next/link";
import { trackClic } from "@/lib/analytics/client";

/**
 * Lien qui retient d'où vient le clic. À utiliser à la place de <Link> sur tout
 * ce qui mène vers l'argent : bouton Réserver, lien Tarifs, carte d'offre.
 *
 * Le nom décrit l'élément, jamais la personne :
 *   <LienTrace href="/reserver" origine="bouton_reserver_accueil">Réserver</LienTrace>
 *
 * Le nom est ensuite rattaché automatiquement au paiement qui suit, ce qui
 * donne le taux de conversion réel de chaque bouton dans Nexus.
 */
export default function LienTrace({
  href,
  origine,
  children,
  className,
  ...reste
}: {
  href: string;
  origine: string;
  children: React.ReactNode;
  className?: string;
} & Omit<React.ComponentProps<typeof Link>, "href" | "onClick">) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => trackClic(origine)}
      // Ce repère sert à la capture automatique des vignettes : le script de
      // Nexus retrouve le bouton par son nom, pas par un sélecteur CSS qui
      // casserait à la première retouche de mise en page.
      data-suivi={origine}
      {...reste}
    >
      {children}
    </Link>
  );
}
