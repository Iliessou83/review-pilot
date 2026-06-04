import Link from "next/link";

const G = { blue: "#1A73E8", red: "#EA4335", yellow: "#FBBC04", green: "#34A853" };

export const metadata = {
  title: "CGV — Caela Réputation",
  description: "Conditions générales de vente et d'utilisation de Caela Réputation by Caela Agency.",
};

export default function CGVPage() {
  return (
    <div style={{ fontFamily: "'Google Sans', system-ui, sans-serif", background: "#fff", color: "#202124", minHeight: "100vh" }}>
      {/* Nav */}
      <nav style={{ borderBottom: "1px solid #DADCE0", padding: "0 24px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "#fff", zIndex: 100 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <div style={{ display: "flex", gap: "3px" }}>
            {[G.blue, G.red, G.yellow, G.green].map((c, i) => <div key={i} style={{ width: "8px", height: "8px", borderRadius: "50%", background: c }} />)}
          </div>
          <span style={{ fontWeight: 700, fontSize: "15px", color: "#202124" }}>Caela Réputation</span>
        </Link>
        <Link href="/" style={{ fontSize: "13px", color: "#5F6368", textDecoration: "none" }}>← Retour</Link>
      </nav>

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "48px 24px 80px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: 800, margin: "0 0 8px", color: "#202124" }}>Conditions générales de vente</h1>
        <p style={{ fontSize: "14px", color: "#80868B", margin: "0 0 48px" }}>Dernière mise à jour : juin 2026</p>

        {[
          {
            title: "1. Identification de l'éditeur",
            content: `Caela Réputation est un service édité par Caela Agency, entreprise individuelle enregistrée en France.
Contact : contact@caela.fr
Le service est hébergé sur l'infrastructure Vercel Inc. (États-Unis) avec données traitées conformément au RGPD.`,
          },
          {
            title: "2. Description du service",
            content: `Caela Réputation est une plateforme SaaS (Software as a Service) permettant aux professionnels de :
— Recevoir et centraliser leurs avis Google Business en temps réel
— Générer automatiquement des réponses aux avis positifs (4-5 étoiles)
— Recevoir des suggestions de réponse par email pour les avis négatifs (1-3 étoiles)
— Suivre les statistiques de leur réputation en ligne

Le service utilise l'API officielle Google My Business et l'intelligence artificielle Claude (Anthropic) pour la génération de réponses.`,
          },
          {
            title: "3. Conditions d'accès et d'utilisation",
            content: `3.1. Pour utiliser Caela Réputation, le client doit disposer d'une fiche Google Business Profile valide et en être l'administrateur vérifiable.

3.2. Le client autorise Caela Réputation à accéder à sa fiche Google Business via les mécanismes d'autorisation OAuth fournis par Google. Cette autorisation peut être révoquée à tout moment depuis les paramètres Google du client.

3.3. Le client reconnaît que Caela Réputation est un outil indépendant, non affilié à Google LLC. Google LLC n'approuve, ne sponsorise ni n'endosse ce service.

3.4. Le client s'engage à ne pas utiliser le service pour :
— Solliciter des avis en échange d'une contrepartie (interdit par les CGU Google)
— Publier de faux avis ou manipuler les avis de concurrents
— Toute activité contraire aux conditions d'utilisation Google My Business`,
          },
          {
            title: "4. Tarifs et facturation",
            content: `4.1. Les tarifs applicables sont ceux affichés sur la page d'accueil au moment de la souscription. Caela Agency se réserve le droit de modifier ses tarifs avec un préavis de 30 jours.

4.2. L'abonnement est souscrit mensuellement ou annuellement. Le paiement est effectué via Stripe, prestataire de paiement sécurisé. Caela Agency ne stocke aucune donnée bancaire.

4.3. La période d'essai gratuit de 14 jours ne nécessite pas de carte bancaire. À l'issue de la période d'essai, sans souscription, l'accès au service est suspendu automatiquement.

4.4. Aucun remboursement n'est accordé pour une période entamée, sauf défaillance technique imputable à Caela Réputation constatée et notifiée dans les 48h.`,
          },
          {
            title: "5. Données personnelles et RGPD",
            content: `5.1. Caela Agency traite les données personnelles de ses clients conformément au Règlement Général sur la Protection des Données (RGPD — Règlement EU 2016/679).

5.2. Les données collectées sont : adresse email, nom de l'établissement, identifiants de fiche Google, contenu des avis Google (données publiques), tokens d'accès OAuth Google.

5.3. Ces données sont utilisées exclusivement pour fournir le service. Elles ne sont jamais revendues ni cédées à des tiers.

5.4. Les avis Google traités par le service sont des données publiques accessibles sur Google Maps. Leur traitement automatisé est encadré par les CGU Google My Business API.

5.5. Conformément au RGPD, le client dispose d'un droit d'accès, de rectification et de suppression de ses données. Pour exercer ces droits : contact@caela.fr. Réponse sous 30 jours.

5.6. Les données sont hébergées sur des serveurs Vercel (Union Européenne ou États-Unis avec garanties adéquates) et Neon PostgreSQL. La base de données est sécurisée et chiffrée au repos.`,
          },
          {
            title: "6. Responsabilités et limites",
            content: `6.1. Caela Réputation s'engage à maintenir le service disponible 99% du temps sur une base mensuelle, hors maintenances planifiées annoncées à l'avance.

6.2. Les réponses générées par l'IA sont des suggestions. Caela Agency n'est pas responsable du contenu des réponses validées et publiées par le client via le système de validation par email ou automatiquement selon les paramètres choisis.

6.3. Le client reconnaît que l'accès à l'API Google My Business est soumis à l'approbation de Google LLC, entité indépendante. Tout changement de politique ou de disponibilité de l'API Google peut affecter le fonctionnement du service sans que Caela Agency puisse en être tenue responsable.

6.4. Caela Agency n'est pas responsable de la suspension ou suppression d'une fiche Google Business par Google LLC, quelle qu'en soit la cause.

6.5. La responsabilité de Caela Agency est limitée, dans tous les cas, au montant des sommes effectivement versées par le client au cours des 3 derniers mois précédant l'incident.`,
          },
          {
            title: "7. Résiliation",
            content: `7.1. Le client peut résilier son abonnement à tout moment depuis son dashboard ou par email à contact@caela.fr. La résiliation prend effet à la fin de la période d'abonnement en cours.

7.2. Caela Agency se réserve le droit de suspendre ou résilier l'accès d'un client en cas de violation des présentes CGV, sans remboursement, après mise en demeure restée sans effet sous 48h.

7.3. En cas de résiliation, les données du client sont conservées 30 jours puis supprimées définitivement, sur demande expresse du client.`,
          },
          {
            title: "8. Propriété intellectuelle",
            content: `8.1. L'ensemble du code, des designs, des algorithmes et des contenus de Caela Réputation sont la propriété exclusive de Caela Agency. Toute reproduction, même partielle, est interdite sans autorisation écrite préalable.

8.2. Les logos et marques Google, Google Business Profile, Google Maps sont des marques déposées de Google LLC. Caela Réputation utilise ces marques uniquement pour décrire son interopérabilité avec les services Google, conformément aux directives de Google.`,
          },
          {
            title: "9. Droit applicable et litiges",
            content: `Les présentes CGV sont soumises au droit français. En cas de litige, et après tentative de résolution amiable, les tribunaux compétents seront ceux du ressort du siège social de Caela Agency.

Pour tout litige de consommation, le client peut recourir gratuitement au médiateur de la consommation compétent conformément aux articles L.616-1 et R.616-1 du code de la consommation.`,
          },
          {
            title: "10. Contact",
            content: `Pour toute question relative aux présentes CGV :
Email : contact@caela.fr
Réponse garantie sous 48h ouvrées.`,
          },
        ].map((section, i) => (
          <div key={i} style={{ marginBottom: "40px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#202124", margin: "0 0 14px", paddingBottom: "10px", borderBottom: "1px solid #DADCE0" }}>
              {section.title}
            </h2>
            <div style={{ fontSize: "14px", color: "#5F6368", lineHeight: 1.8, whiteSpace: "pre-line" }}>
              {section.content}
            </div>
          </div>
        ))}

        <div style={{ marginTop: "48px", padding: "20px 24px", background: "#F8F9FA", borderRadius: "12px", border: "1px solid #DADCE0", fontSize: "13px", color: "#80868B", textAlign: "center" }}>
          Caela Réputation est un outil indépendant, non affilié à Google LLC. · <Link href="/" style={{ color: G.blue, textDecoration: "none" }}>Retour à l&apos;accueil</Link>
        </div>
      </div>
    </div>
  );
}
