import Link from "next/link";
import { entity } from "@/config/legal.config";

const G = { blue: "#1A73E8", red: "#EA4335", yellow: "#FBBC04", green: "#34A853" };

export const metadata = {
  title: "Conditions générales de vente et d'utilisation — Caela Réputation",
  description: "CGV et CGU de Caela Réputation by Caela Agency. Abonnement, facturation, responsabilités, résiliation.",
};

const sections = [
  {
    title: "1. Identification de l'éditeur",
    content: `Caela Réputation est un service édité par :

Caela Agency — Entreprise individuelle
Représentée par Iliès Bourbouane
Email : contact@caela.fr
Site web : ${entity.siteUrl}

Le service est hébergé par Vercel Inc. (infrastructure applicative), Supabase Inc. (base de données) et Oracle Cloud Infrastructure (automatisation). Pour plus de détails : voir nos Mentions légales.`,
  },
  {
    title: "2. Définitions",
    content: `Dans les présentes conditions, les termes suivants désignent :

— « Service » : la plateforme SaaS Caela Réputation accessible depuis ${entity.siteUrl}, incluant le dashboard, les APIs, les automatisations et les emails associés.
— « Client » : toute personne physique ou morale utilisant le Service dans un cadre professionnel.
— « Établissement » : la fiche Google Business Profile ou Trustpilot gérée par le Client via le Service.
— « Avis » : tout contenu publié par un client de l'Établissement sur Google Maps ou Trustpilot.
— « Réponse IA » : toute réponse générée automatiquement ou suggérée par l'intelligence artificielle du Service (Claude, Anthropic).
— « Abonnement » : accès payant au Service selon les plans tarifaires en vigueur.`,
  },
  {
    title: "3. Objet du service",
    content: `Caela Réputation est une plateforme SaaS (Software as a Service) permettant aux professionnels de :

— Centraliser et consulter leurs avis Google Business Profile et Trustpilot en temps réel via les APIs officielles
— Générer automatiquement des réponses personnalisées aux avis positifs (4-5 étoiles) via l'IA Claude (Anthropic)
— Recevoir par email des suggestions de réponse pour les avis négatifs (1-3 étoiles) et les valider en un clic
— Accéder à des statistiques et analytics de réputation sur 12 mois
— Gérer plusieurs établissements depuis un tableau de bord unique

Le Service utilise l'API officielle Google My Business et l'intelligence artificielle Claude (Anthropic PBC). Caela Réputation est un outil indépendant, non affilié, non approuvé et non sponsorisé par Google LLC ou Trustpilot A/S.`,
  },
  {
    title: "4. Accès au service et conditions d'utilisation",
    content: `4.1 PRÉREQUIS TECHNIQUES
Pour accéder au Service, le Client doit disposer d'une fiche Google Business Profile valide et active dont il est l'administrateur vérifiable, d'une connexion internet et d'un navigateur récent.

4.2 AUTORISATION OAUTH GOOGLE
Le Client autorise Caela Réputation à accéder à sa fiche Google Business Profile via les mécanismes d'autorisation OAuth 2.0 fournis par Google. Cette autorisation peut être révoquée à tout moment depuis les paramètres Google du Client (myaccount.google.com). La révocation de l'autorisation suspend automatiquement les fonctionnalités liées à Google sans droit à remboursement.

4.3 USAGES INTERDITS
Le Client s'engage formellement à ne pas utiliser le Service pour :
— Solliciter des avis en échange d'une contrepartie (interdit par les CGU Google et la réglementation DGCCRF)
— Publier de faux avis ou des avis trompeurs, conformément à l'article L.121-4 du Code de la consommation
— Manipuler les avis de concurrents
— Toute activité contraire aux conditions d'utilisation de Google My Business API, de Trustpilot ou de la réglementation en vigueur
— Utiliser le Service à des fins de spam, harcèlement ou atteinte à la réputation de tiers

En cas de violation, Caela Agency se réserve le droit de suspendre immédiatement l'accès sans remboursement.

4.4 RESPONSABILITÉ DES RÉPONSES PUBLIÉES
Les réponses générées ou suggérées par l'IA sont des suggestions. Le Client reste seul responsable des réponses publiées en son nom sur Google ou Trustpilot, qu'elles aient été générées automatiquement (mode auto-réponse activé) ou validées manuellement. Caela Agency ne peut être tenu responsable du contenu des réponses approuvées ou automatiquement publiées par le Client.`,
  },
  {
    title: "5. Offres, tarifs et abonnement",
    content: `5.1 OFFRES
Les plans tarifaires (Starter, Pro, Agence) sont décrits sur la page d'accueil du Service. Les caractéristiques et tarifs exacts de chaque plan sont ceux affichés au moment de la souscription.

5.2 ESSAI GRATUIT AVEC CARTE BANCAIRE
Une période d'essai gratuit de 14 jours est proposée. L'enregistrement d'une carte bancaire valide est requis dès la souscription, via notre prestataire Stripe. Aucune somme n'est débitée pendant l'essai.

Avant toute validation, le Client se voit présenter un récapitulatif clair indiquant le tarif applicable, la date du premier prélèvement et la nature de l'engagement, qu'il doit accepter expressément (case à cocher non pré-cochée), conformément à l'article L.221-5 du Code de la consommation.

À l'issue des 14 jours, et sauf résiliation du Client avant la fin de l'essai, l'abonnement au plan choisi démarre automatiquement et la carte enregistrée est débitée du montant correspondant. Un email de rappel est systématiquement envoyé au Client 3 jours avant ce premier prélèvement. Le Client peut résilier à tout moment, sans frais, depuis son espace (voir article 11), y compris pendant l'essai. En l'absence de moyen de paiement valide à la fin de l'essai, l'abonnement n'est pas activé et l'accès est suspendu.

5.3 PAIEMENT
Le paiement est effectué via Stripe, prestataire de paiement certifié PCI-DSS. Caela Agency n'a jamais accès aux données bancaires du Client. L'abonnement est facturé mensuellement ou annuellement selon le choix du Client, par prélèvement automatique à la date anniversaire de souscription.

5.4 MODIFICATION DES TARIFS
Caela Agency se réserve le droit de modifier ses tarifs. Toute modification sera notifiée au Client par email avec un préavis de 30 jours. Le Client peut résilier sans frais pendant ce délai de préavis si la modification ne lui convient pas.

5.5 RENOUVELLEMENT AUTOMATIQUE
L'abonnement se renouvelle automatiquement à chaque échéance. Le Client peut résilier ou désactiver le renouvellement à tout moment, en ligne et en quelques clics, depuis la section « Abonnement & facturation » de son dashboard (/dashboard/billing), conformément à l'article L.215-1-1 du Code de la consommation. La résiliation prend effet à la fin de la période en cours, sans nouveau prélèvement.`,
  },
  {
    title: "6. Rétractation et remboursements",
    content: `6.1 DROIT DE RÉTRACTATION (consommateurs / micro-entrepreneurs)
Conformément à l'article L.221-18 du Code de la consommation, si le Client agit en qualité de consommateur (personne physique n'agissant pas dans le cadre d'une activité professionnelle principale), il dispose d'un délai de 14 jours calendaires à compter de la souscription pour exercer son droit de rétractation, sans avoir à justifier de motifs ni à payer de pénalités.

Pour exercer ce droit : email à contact@caela.fr avec l'objet « Rétractation » en indiquant le nom, l'email de compte et la date de souscription. Le remboursement sera effectué sous 14 jours via le même moyen de paiement.

Conformément à l'article L.221-28 du Code de la consommation, si le Client a expressément demandé le commencement de la prestation avant l'expiration du délai de rétractation et que la prestation a été entièrement exécutée, il perd son droit de rétractation.

6.2 REMBOURSEMENTS (clients professionnels)
Pour les Clients agissant dans le cadre de leur activité professionnelle (B2B), aucun remboursement n'est accordé pour une période entamée, sauf :
— Défaillance technique majeure imputable exclusivement à Caela Réputation, d'une durée supérieure à 48h consécutives, dûment constatée et notifiée dans les 48h suivant la constatation.
— Erreur de facturation de la part de Caela Agency.

6.3 RÉSILIATION ET REMBOURSEMENT PRORATA
En cas de résiliation en cours de période annuelle, aucun remboursement prorata n'est automatiquement appliqué sauf si la résiliation est motivée par une modification substantielle des présentes CGV notifiée par Caela Agency.`,
  },
  {
    title: "7. Disponibilité et niveaux de service",
    content: `7.1 DISPONIBILITÉ
Caela Agency s'engage à maintenir le Service disponible 99% du temps mensuel, hors maintenances planifiées et événements hors de son contrôle. Les maintenances planifiées sont annoncées par email au moins 24h à l'avance.

7.2 DÉPENDANCES TIERCES
Le fonctionnement du Service dépend de services tiers : l'API Google My Business, l'API Trustpilot, l'API Anthropic Claude et les services d'hébergement. Toute indisponibilité ou modification de ces services tiers peut affecter le Service sans que Caela Agency soit responsable ni tenu à remboursement. Caela Agency informera les Clients dans les meilleurs délais de toute perturbation significative.

7.3 APPROBATION GOOGLE
L'accès à l'API Google My Business est soumis à l'approbation de Google LLC. Tout changement de politique d'accès de Google peut affecter le Service sans que Caela Agency puisse en être tenu responsable.`,
  },
  {
    title: "8. Responsabilité et limitation",
    content: `8.1 Caela Agency s'engage à fournir le Service avec soin et diligence. En cas de manquement à ses obligations, la responsabilité de Caela Agency est strictement limitée au montant des sommes effectivement versées par le Client au cours des 3 derniers mois précédant l'événement dommageable.

8.2 Caela Agency ne peut être tenu responsable de :
— La suspension ou suppression d'une fiche Google Business Profile par Google LLC, quelle qu'en soit la cause
— La perte de classement ou de réputation en ligne résultant de réponses publiées par le Client
— Les conséquences de l'utilisation des suggestions IA sans relecture du Client
— Les dommages indirects, pertes de profit, pertes de clientèle, quelle qu'en soit la cause
— Toute interruption liée à un cas de force majeure (défaillance réseau, cyberattaque, catastrophe naturelle, pandémie, décision gouvernementale)

8.3 Le Client reconnaît avoir été informé des caractéristiques et limites du Service, notamment concernant l'utilisation de l'IA pour générer des réponses. Les réponses IA peuvent contenir des inexactitudes. Le Client est responsable de leur vérification avant publication.`,
  },
  {
    title: "9. Propriété intellectuelle",
    content: `9.1 L'ensemble des éléments du Service (code, design, algorithmes, textes, marques) est la propriété exclusive de Caela Agency, protégée par le droit de la propriété intellectuelle.

9.2 Le Client bénéficie d'une licence d'utilisation non exclusive, non transférable, limitée à l'usage du Service pour son propre compte pendant la durée de l'abonnement. Cette licence ne constitue pas une cession de droit.

9.3 Le Client accorde à Caela Agency une licence limitée pour traiter les données de sa fiche Google et les avis de ses clients, uniquement dans le but de fournir le Service.

9.4 Les données d'avis Google traitées par le Service (textes, notes, auteurs) restent la propriété de leurs auteurs respectifs et de Google LLC. Caela Agency n'en revendique aucune propriété.`,
  },
  {
    title: "10. Confidentialité et données personnelles",
    content: `Le traitement des données personnelles dans le cadre du Service est détaillé dans notre Politique de confidentialité, disponible à l'adresse /politique-de-confidentialite.

Points clés : nous ne revendons aucune donnée, nous utilisons Anthropic (Claude) pour générer les réponses IA (les textes d'avis lui sont transmis mais ne sont pas conservés), et vous pouvez demander la suppression de vos données à tout moment à contact@caela.fr.`,
  },
  {
    title: "11. Résiliation",
    content: `11.1 Le Client peut résilier son abonnement à tout moment, en ligne et en quelques clics, depuis la section « Abonnement & facturation » de son dashboard (/dashboard/billing). Conformément à l'article L.215-1-1 du Code de la consommation, la résiliation est aussi simple que la souscription : aucune justification, aucun frais, aucune relance téléphonique. Une fonctionnalité de résiliation est accessible en permanence depuis l'espace client. La résiliation prend effet à la fin de la période en cours (ou à la fin de l'essai si elle intervient pendant l'essai), sans nouveau prélèvement. Le Client peut également écrire à contact@caela.fr.

11.2 Caela Agency se réserve le droit de suspendre ou résilier l'accès d'un Client sans remboursement dans les cas suivants :
— Violation des présentes CGV, après mise en demeure par email restée sans effet sous 48h
— Non-paiement après relance
— Usage frauduleux ou illégal du Service
— Injonction judiciaire

11.3 En cas de résiliation ou suspension, les données du Client sont conservées 30 jours dans notre système pour permettre une éventuelle réactivation, puis supprimées définitivement. Sur demande expresse du Client, la suppression peut intervenir immédiatement.

11.4 Caela Agency se réserve le droit de mettre fin au Service dans son intégralité avec un préavis de 3 mois notifié par email. Dans ce cas, les sommes versées pour des périodes non encore entamées seront remboursées au prorata.`,
  },
  {
    title: "12. Modifications des CGV",
    content: `Caela Agency peut modifier les présentes CGV. Toute modification substantielle sera notifiée par email avec un préavis de 30 jours. Le Client qui n'accepte pas les nouvelles conditions peut résilier son abonnement sans frais pendant ce délai. La poursuite de l'utilisation du Service après ce délai vaut acceptation des nouvelles conditions.`,
  },
  {
    title: "13. Droit applicable, médiation et juridiction",
    content: `13.1 Les présentes CGV sont soumises au droit français.

13.2 MÉDIATION (consommateurs)
En cas de litige entre un consommateur et Caela Agency, et après tentative de résolution amiable par email à contact@caela.fr, le consommateur peut recourir gratuitement à un médiateur de la consommation, conformément aux articles L.616-1 et R.616-1 du Code de la consommation. Plateforme européenne de règlement en ligne des litiges : https://ec.europa.eu/consumers/odr

13.3 LITIGES PROFESSIONNELS (B2B)
Pour les litiges entre professionnels, et à défaut de résolution amiable dans les 30 jours suivant la mise en demeure, les parties conviennent de la compétence exclusive des tribunaux compétents du ressort du siège social de Caela Agency (France).

13.4 En cas de contradiction entre une version traduite et la version française des présentes CGV, la version française prévaut.`,
  },
  {
    title: "14. Contact et réclamations",
    content: `Pour toute question, réclamation ou exercice de droits :

Email : contact@caela.fr
Objet : [CGV] Votre demande
Délai de réponse garanti : 48h ouvrées

Ces CGV ont été mises à jour en juin 2026 et annulent et remplacent toutes versions antérieures.`,
  },
];

export default function CGVPage() {
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
        <h1 style={{ fontSize: "32px", fontWeight: 800, margin: "0 0 8px", color: "#202124" }}>Conditions générales de vente et d&apos;utilisation</h1>
        <p style={{ fontSize: "14px", color: "#80868B", margin: "0 0 8px" }}>Dernière mise à jour : juin 2026 — Version 2.0</p>

        <div style={{ fontSize: "13px", color: "#202124", margin: "0 0 32px", lineHeight: 1.6, padding: "16px 20px", background: "#FEF7E0", borderRadius: "8px", border: "1px solid #F9E097" }}>
          <strong>Important :</strong> Caela Réputation est un outil indépendant. Il n&apos;est ni affilié, ni approuvé, ni sponsorisé par Google LLC ou Trustpilot A/S. L&apos;utilisation de ce service n&apos;est pas garantie par Google.
        </div>

        {/* Table des matières */}
        <div style={{ marginBottom: "48px", padding: "20px 24px", background: "#F8F9FA", borderRadius: "12px", border: "1px solid #DADCE0" }}>
          <p style={{ margin: "0 0 12px", fontWeight: 600, fontSize: "14px", color: "#202124" }}>Sommaire</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
            {sections.map((s, i) => (
              <a key={i} href={`#section-${i}`} style={{ fontSize: "13px", color: G.blue, textDecoration: "none" }}>{s.title}</a>
            ))}
          </div>
        </div>

        {sections.map((section, i) => (
          <div key={i} id={`section-${i}`} style={{ marginBottom: "40px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#202124", margin: "0 0 14px", paddingBottom: "10px", borderBottom: "1px solid #DADCE0" }}>
              {section.title}
            </h2>
            <div style={{ fontSize: "14px", color: "#5F6368", lineHeight: 1.8, whiteSpace: "pre-line" }}>
              {section.content}
            </div>
          </div>
        ))}

        <div style={{ marginTop: "48px", padding: "20px 24px", background: "#F8F9FA", borderRadius: "12px", border: "1px solid #DADCE0", fontSize: "13px", color: "#80868B" }}>
          <p style={{ textAlign: "center", margin: "0 0 12px" }}>Caela Réputation est un outil indépendant, non affilié à Google LLC.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "center" }}>
            <Link href="/mentions-legales" style={{ color: G.blue, textDecoration: "none" }}>Mentions légales</Link>
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
