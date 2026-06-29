import Link from "next/link";

const G = { blue: "#1A73E8", red: "#EA4335", yellow: "#FBBC04", green: "#34A853" };

export const metadata = {
  title: "Mentions légales — Caela Réputation",
  description: "Mentions légales de Caela Réputation, service édité par Caela Agency.",
};

const sections = [
  {
    title: "1. Éditeur du service",
    content: `Caela Réputation est un service édité par :

Raison sociale : Bourbouane Iliès (entreprise individuelle)
Nom commercial : Caela Réputation — marque Caela Agency
Forme juridique : Entreprise individuelle (micro-entreprise)
Nom du responsable : Iliès Bourbouane
SIRET : [À COMPLÉTER — 14 chiffres]
TVA intracommunautaire : Non assujetti — TVA non applicable, art. 293 B du CGI
Adresse : [À COMPLÉTER — adresse de l'entreprise]
Email : contact@caela.fr
Site web : https://caela-reputation.fr`,
  },
  {
    title: "2. Directeur de la publication",
    content: `Le directeur de la publication du service Caela Réputation est :

Iliès Bourbouane — contact@caela.fr`,
  },
  {
    title: "3. Hébergement",
    content: `Le service Caela Réputation est hébergé par plusieurs prestataires techniques :

Infrastructure principale (déploiement applicatif) :
Vercel Inc.
440 N Barranca Ave #4133, Covina, CA 91723 — États-Unis
https://vercel.com

Base de données :
Supabase Inc.
970 Toa Payoh North, #07-04, Singapore 318992
https://supabase.com

Serveur d'automatisation :
Oracle Cloud Infrastructure (OCI) — instance ARM A1.Flex
Oracle Corporation, 500 Oracle Parkway, Redwood City, CA 94065 — États-Unis
https://oracle.com/cloud

Ces hébergeurs traitent les données conformément à leurs propres politiques de sécurité et aux clauses contractuelles types (CCT) approuvées par la Commission Européenne pour les transferts hors UE.`,
  },
  {
    title: "4. Propriété intellectuelle",
    content: `L'ensemble des éléments constituant le service Caela Réputation — code source, design, algorithmes, textes, illustrations, logo, marque "Caela Réputation" et "Caela Agency" — sont la propriété exclusive de Caela Agency et sont protégés par le droit de la propriété intellectuelle français et international.

Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable de Caela Agency.

Toute exploitation non autorisée du site ou de l'un quelconque des éléments qu'il contient sera considérée comme constitutive d'une contrefaçon et poursuivie conformément aux dispositions des articles L.335-2 et suivants du Code de Propriété Intellectuelle.`,
  },
  {
    title: "5. Marques tierces",
    content: `Les marques suivantes, citées sur ce service, sont des marques déposées de leurs propriétaires respectifs :

— Google®, Google Business Profile®, Google Maps®, Google My Business® : marques déposées de Google LLC (Alphabet Inc.), 1600 Amphitheatre Parkway, Mountain View, CA 94043, États-Unis. Caela Réputation n'est en aucun cas affilié, approuvé, parrainé ou endossé par Google LLC.

— Trustpilot® : marque déposée de Trustpilot A/S, Pilestræde 58, 1112 Copenhagen, Danemark. Caela Réputation n'est pas affilié à Trustpilot.

— Claude®, Anthropic® : marques déposées d'Anthropic PBC, 548 Market St, San Francisco, CA 94104, États-Unis.

Ces marques sont mentionnées uniquement dans le but de décrire l'interopérabilité technique du service avec ces plateformes, conformément aux usages du droit des marques.`,
  },
  {
    title: "6. Limitation de responsabilité",
    content: `Caela Agency s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur ce service, et se réserve le droit de corriger, à tout moment et sans préavis, le contenu.

Caela Agency ne peut être tenu responsable de l'utilisation faite de ces informations, ni des interruptions temporaires de service, ni des dommages directs ou indirects résultant de l'utilisation du service ou de l'impossibilité d'y accéder.

Les liens hypertextes présents sur ce service peuvent renvoyer vers des sites tiers. Caela Agency n'est pas responsable du contenu de ces sites.`,
  },
  {
    title: "7. Données personnelles",
    content: `Le traitement des données personnelles des utilisateurs est décrit dans notre Politique de confidentialité.

Pour toute question relative à vos données personnelles : contact@caela.fr

Autorité de contrôle compétente :
Commission Nationale de l'Informatique et des Libertés (CNIL)
3 Place de Fontenoy, TSA 80715, 75334 Paris Cedex 07
https://www.cnil.fr · Tél. : 01 53 73 22 22`,
  },
  {
    title: "8. Cookies",
    content: `Ce service utilise des cookies techniques strictement nécessaires à son fonctionnement (authentification, session). Aucun cookie publicitaire ou de traçage tiers n'est utilisé.

Pour plus d'informations : voir notre Politique de cookies.`,
  },
  {
    title: "9. Droit applicable",
    content: `Les présentes mentions légales sont soumises au droit français. Tout litige relatif à l'utilisation du service sera soumis à la compétence exclusive des tribunaux français.`,
  },
  {
    title: "10. Mise à jour",
    content: `Ces mentions légales ont été mises à jour en juin 2026. Caela Agency se réserve le droit de les modifier à tout moment. L'utilisateur est invité à les consulter régulièrement.`,
  },
];

export default function MentionsLegalesPage() {
  return (
    <div style={{ fontFamily: "'Google Sans', system-ui, sans-serif", background: "#fff", color: "#202124", minHeight: "100vh" }}>
      <nav style={{ borderBottom: "1px solid #DADCE0", padding: "0 24px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "#fff", zIndex: 100 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <div style={{ display: "flex", gap: "3px" }}>
            {[G.blue, G.red, G.yellow, G.green].map((c, i) => (
              <div key={i} style={{ width: "8px", height: "8px", borderRadius: "50%", background: c }} />
            ))}
          </div>
          <span style={{ fontWeight: 700, fontSize: "15px", color: "#202124" }}>Caela Réputation</span>
        </Link>
        <Link href="/" style={{ fontSize: "13px", color: "#5F6368", textDecoration: "none" }}>← Retour</Link>
      </nav>

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "48px 24px 80px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: 800, margin: "0 0 8px", color: "#202124" }}>Mentions légales</h1>
        <p style={{ fontSize: "14px", color: "#80868B", margin: "0 0 8px" }}>Dernière mise à jour : juin 2026</p>
        <p style={{ fontSize: "13px", color: "#5F6368", margin: "0 0 48px", lineHeight: 1.6, padding: "14px 18px", background: "#F8F9FA", borderRadius: "8px", border: "1px solid #DADCE0" }}>
          Conformément aux dispositions de la loi n°2004-575 du 21 juin 2004 pour la confiance dans l&apos;économie numérique (LCEN), les présentes mentions légales sont portées à la connaissance des utilisateurs du service Caela Réputation.
        </p>

        {sections.map((section, i) => (
          <div key={i} style={{ marginBottom: "40px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#202124", margin: "0 0 14px", paddingBottom: "10px", borderBottom: "1px solid #DADCE0" }}>
              {section.title}
            </h2>
            <div style={{ fontSize: "14px", color: "#5F6368", lineHeight: 1.8, whiteSpace: "pre-line" }}>
              {section.content}
            </div>
          </div>
        ))}

        <div style={{ marginTop: "48px", padding: "20px 24px", background: "#F8F9FA", borderRadius: "12px", border: "1px solid #DADCE0", fontSize: "13px", color: "#80868B" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "center" }}>
            <Link href="/cgv" style={{ color: G.blue, textDecoration: "none" }}>Conditions générales de vente</Link>
            <span>·</span>
            <Link href="/politique-de-confidentialite" style={{ color: G.blue, textDecoration: "none" }}>Politique de confidentialité</Link>
            <span>·</span>
            <Link href="/politique-de-cookies" style={{ color: G.blue, textDecoration: "none" }}>Politique de cookies</Link>
            <span>·</span>
            <Link href="/" style={{ color: G.blue, textDecoration: "none" }}>Retour à l&apos;accueil</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
