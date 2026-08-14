import Link from "next/link";
import RefusMesure from "@/components/RefusMesure";

const G = { blue: "#1A73E8", red: "#EA4335", yellow: "#FBBC04", green: "#34A853" };

export const metadata = {
  title: "Politique de confidentialité — Caela Réputation",
  description: "Comment Caela Réputation collecte, utilise et protège vos données personnelles. Conformité RGPD.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "40px" }}>
      <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#202124", margin: "0 0 14px", paddingBottom: "10px", borderBottom: "1px solid #DADCE0" }}>
        {title}
      </h2>
      <div style={{ fontSize: "14px", color: "#5F6368", lineHeight: 1.8 }}>
        {children}
      </div>
    </div>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div style={{ overflowX: "auto", margin: "16px 0" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
        <thead>
          <tr style={{ background: "#F8F9FA" }}>
            {headers.map((h, i) => (
              <th key={i} style={{ padding: "10px 14px", textAlign: "left", border: "1px solid #DADCE0", fontWeight: 600, color: "#202124" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#FAFAFA" }}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: "10px 14px", border: "1px solid #DADCE0", color: "#5F6368", verticalAlign: "top" }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PolitiqueConfidentialitePage() {
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
        <h1 style={{ fontSize: "32px", fontWeight: 800, margin: "0 0 8px", color: "#202124" }}>Politique de confidentialité</h1>
        <p style={{ fontSize: "14px", color: "#80868B", margin: "0 0 8px" }}>Dernière mise à jour : juin 2026</p>

        <div style={{ fontSize: "13px", color: "#202124", margin: "0 0 48px", lineHeight: 1.6, padding: "16px 20px", background: "#E8F0FE", borderRadius: "8px", border: "1px solid #C5D9FB" }}>
          <strong>Résumé :</strong> Caela Réputation collecte vos données uniquement pour faire fonctionner le service. Nous ne revendons aucune donnée. Nous ne faisons pas de publicité ciblée. Vous pouvez demander la suppression de vos données à tout moment.
        </div>

        <Section title="1. Responsable du traitement">
          <p>Le responsable du traitement des données à caractère personnel est :</p>
          <p style={{ margin: "12px 0", padding: "14px 18px", background: "#F8F9FA", borderRadius: "8px", border: "1px solid #DADCE0" }}>
            <strong>Caela Agency</strong> — Entreprise individuelle<br />
            Représentée par Iliès Bourbouane<br />
            Email : <a href="mailto:contact@caela.fr" style={{ color: G.blue }}>contact@caela.fr</a><br />
            Pour les demandes relatives à vos données personnelles, utilisez l&apos;objet email : <strong>[RGPD] Votre demande</strong>
          </p>
          <p>Il n&apos;y a pas de Délégué à la Protection des Données (DPO) désigné formellement pour cette structure. Iliès Bourbouane assume directement ces responsabilités. Si votre demande concerne un droit RGPD, la réponse vous sera apportée sous 30 jours calendaires.</p>
        </Section>

        <Section title="2. Données collectées">
          <p style={{ marginBottom: "12px" }}>Nous collectons et traitons les données suivantes, selon leur source :</p>

          <p style={{ fontWeight: 600, color: "#202124", margin: "20px 0 8px" }}>2.1 Données que vous nous fournissez directement</p>
          <Table
            headers={["Donnée", "Pourquoi", "Base légale (RGPD Art. 6)"]}
            rows={[
              ["Adresse email professionnelle", "Identification, notifications, envoi des suggestions de réponse", "Exécution du contrat (6.1.b)"],
              ["Nom de l'établissement", "Personnalisation des réponses IA", "Exécution du contrat (6.1.b)"],
              ["Email du responsable / propriétaire", "Destinataire des alertes et rapports", "Exécution du contrat (6.1.b)"],
              ["Token OAuth Google My Business", "Accès à l'API Google pour récupérer les avis et publier les réponses", "Exécution du contrat (6.1.b)"],
              ["Identifiant de fiche Google (Place ID)", "Liaison entre l'établissement et sa fiche Google", "Exécution du contrat (6.1.b)"],
              ["Code de parrainage", "Gestion du programme de parrainage", "Intérêt légitime (6.1.f)"],
            ]}
          />

          <p style={{ fontWeight: 600, color: "#202124", margin: "20px 0 8px" }}>2.2 Données collectées automatiquement via l&apos;API Google</p>
          <p style={{ marginBottom: "8px" }}>Ces données sont publiquement accessibles sur Google Maps. Nous les collectons via l&apos;API Google My Business à votre demande, pour vous en permettre la gestion.</p>
          <Table
            headers={["Donnée", "Origine", "Base légale"]}
            rows={[
              ["Prénom et nom de l'auteur d'un avis", "Profil public Google de l'auteur", "Intérêt légitime du responsable d'établissement (6.1.f)"],
              ["Texte de l'avis", "Contenu public sur Google Maps", "Intérêt légitime (6.1.f)"],
              ["Note (1 à 5 étoiles)", "Contenu public sur Google Maps", "Intérêt légitime (6.1.f)"],
              ["Date de publication de l'avis", "Métadonnée publique", "Intérêt légitime (6.1.f)"],
              ["Identifiant unique de l'avis (review ID)", "Référence technique Google", "Exécution du contrat (6.1.b)"],
            ]}
          />

          <p style={{ fontWeight: 600, color: "#202124", margin: "20px 0 8px" }}>2.3 Données techniques</p>
          <Table
            headers={["Donnée", "Pourquoi", "Base légale"]}
            rows={[
              ["Cookie de session (JWT)", "Maintien de votre connexion au dashboard", "Nécessité technique / Consentement implicite"],
              ["Logs d'erreurs techniques", "Diagnostic et maintenance du service", "Intérêt légitime (6.1.f)"],
            ]}
          />

          <p style={{ fontWeight: 600, color: "#202124", margin: "20px 0 8px" }}>2.4 Ce que nous ne collectons PAS</p>
          <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
            <li>Données bancaires (traitées exclusivement par Stripe, nous n&apos;y avons pas accès)</li>
            <li>Numéro de téléphone (sauf si vous nous le communiquez volontairement)</li>
            <li>Adresse IP (nous ne loggons pas les IPs des utilisateurs)</li>
            <li>Données de navigation ou comportementales à des fins marketing</li>
            <li>Données sensibles (origine ethnique, santé, convictions, etc.)</li>
          </ul>
        </Section>

        <Section title="3. Sous-traitants et transferts de données">
          <p style={{ marginBottom: "12px" }}>Conformément à l&apos;article 28 du RGPD, nous faisons appel aux sous-traitants suivants. Chacun dispose de garanties adéquates pour les transferts hors UE (clauses contractuelles types ou décision d&apos;adéquation) :</p>

          <Table
            headers={["Sous-traitant", "Rôle", "Pays", "Données transférées", "Garanties"]}
            rows={[
              ["Vercel Inc.", "Hébergement de l'application web", "États-Unis", "Toutes les données transitant par l'application", "CCT Commission Européenne"],
              ["Supabase Inc.", "Base de données PostgreSQL", "Singapour / UE", "Toutes les données stockées (avis, établissements, réponses)", "CCT — Serveurs EU disponibles"],
              ["Oracle Cloud (OCI)", "Serveur d'automatisation (worker cron)", "États-Unis", "Requêtes API, logs d'exécution", "CCT Commission Européenne"],
              ["Anthropic PBC", "Génération IA des réponses (Claude API)", "États-Unis", "Texte des avis Google (prénom auteur + contenu)", "CCT — Zero data retention option"],
              ["Resend Inc.", "Envoi d'emails transactionnels", "États-Unis", "Adresse email, contenu des suggestions de réponse", "CCT Commission Européenne"],
              ["Stripe Inc.", "Paiement en ligne", "États-Unis", "Données de paiement (traitement direct, hors notre accès)", "CCT + EU-US Data Privacy Framework (DPF)"],
              ["Google LLC", "API Google My Business (récupération avis)", "États-Unis", "Tokens OAuth, identifiants de fiche", "CCT + Google's own DPA"],
            ]}
          />

          <div style={{ marginTop: "16px", padding: "14px 18px", background: "#FEF7E0", borderRadius: "8px", border: "1px solid #F9E097", fontSize: "13px" }}>
            <strong>Note importante — Anthropic :</strong> Lorsque l&apos;IA génère une réponse à un avis, le texte de l&apos;avis (incluant le prénom de l&apos;auteur et le contenu public) est transmis à l&apos;API Anthropic Claude aux États-Unis. Anthropic traite ces données en mode &quot;zero data retention&quot; (aucune conservation après traitement) selon nos accords contractuels. Ces données sont des données publiques accessibles sur Google Maps.
          </div>
        </Section>

        <Section title="4. Durée de conservation">
          <Table
            headers={["Catégorie de données", "Durée de conservation"]}
            rows={[
              ["Données de compte (email, établissements)", "Durée de l'abonnement + 30 jours après résiliation (sauf demande de suppression anticipée)"],
              ["Avis Google et réponses publiées", "Durée de l'abonnement + 30 jours"],
              ["Suggestions de réponse en attente", "90 jours maximum, puis suppression automatique"],
              ["Logs d'erreurs techniques", "30 jours glissants"],
              ["Données de facturation", "10 ans (obligation légale comptable, L.123-22 Code de commerce)"],
              ["Cookie de session JWT", "7 jours (expiration automatique)"],
            ]}
          />
        </Section>

        <Section title="5. Vos droits RGPD">
          <p style={{ marginBottom: "16px" }}>Conformément au RGPD (Articles 15 à 22), vous disposez des droits suivants sur vos données personnelles :</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
            {[
              { droit: "Droit d'accès (Art. 15)", desc: "Obtenir la confirmation que vos données sont traitées et en recevoir une copie." },
              { droit: "Droit de rectification (Art. 16)", desc: "Corriger des données inexactes ou incomplètes vous concernant." },
              { droit: "Droit à l'effacement (Art. 17)", desc: "Demander la suppression de vos données (« droit à l'oubli »)." },
              { droit: "Droit à la portabilité (Art. 20)", desc: "Recevoir vos données dans un format structuré et lisible par machine." },
              { droit: "Droit d'opposition (Art. 21)", desc: "Vous opposer au traitement basé sur notre intérêt légitime." },
              { droit: "Droit à la limitation (Art. 18)", desc: "Demander la suspension temporaire du traitement de vos données." },
            ].map((r, i) => (
              <div key={i} style={{ padding: "14px", background: "#F8F9FA", borderRadius: "8px", border: "1px solid #DADCE0" }}>
                <div style={{ fontWeight: 600, color: "#202124", marginBottom: "4px", fontSize: "13px" }}>{r.droit}</div>
                <div style={{ fontSize: "12px", color: "#5F6368" }}>{r.desc}</div>
              </div>
            ))}
          </div>

          <p>Pour exercer vos droits, envoyez un email à <a href="mailto:contact@caela.fr" style={{ color: G.blue }}>contact@caela.fr</a> avec l&apos;objet <strong>[RGPD] + votre demande</strong>. Nous répondons sous <strong>30 jours calendaires</strong>. Une preuve d&apos;identité peut être demandée.</p>

          <p style={{ marginTop: "12px" }}>Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de la <strong>CNIL</strong> : <a href="https://www.cnil.fr" style={{ color: G.blue }} target="_blank" rel="noopener noreferrer">www.cnil.fr</a> · 01 53 73 22 22.</p>
        </Section>

        <Section title="6. Sécurité des données">
          <p style={{ marginBottom: "12px" }}>Nous mettons en œuvre les mesures de sécurité suivantes :</p>
          <ul style={{ paddingLeft: "20px", margin: "8px 0" }}>
            <li style={{ marginBottom: "6px" }}><strong>Chiffrement en transit :</strong> toutes les communications sont chiffrées via TLS 1.2+ (HTTPS).</li>
            <li style={{ marginBottom: "6px" }}><strong>Chiffrement au repos :</strong> la base de données Supabase est chiffrée au repos (AES-256).</li>
            <li style={{ marginBottom: "6px" }}><strong>Tokens OAuth :</strong> les tokens Google sont stockés en base de données chiffrée. Ils ne sont jamais exposés côté client.</li>
            <li style={{ marginBottom: "6px" }}><strong>Authentification :</strong> les accès au dashboard sont protégés par JWT avec expiration à 7 jours. Les mots de passe sont hachés avec bcrypt (coût 12).</li>
            <li style={{ marginBottom: "6px" }}><strong>Variables d&apos;environnement :</strong> les clés API tierces (Anthropic, Resend, Google) sont stockées dans des variables d&apos;environnement Vercel chiffrées, jamais dans le code source.</li>
            <li style={{ marginBottom: "6px" }}><strong>Accès restreint :</strong> seul le responsable (Iliès Bourbouane) a accès à l&apos;infrastructure de production.</li>
          </ul>
          <p style={{ marginTop: "12px" }}>En cas de violation de données susceptible d&apos;engendrer un risque pour vos droits et libertés, vous en serez notifié dans les <strong>72 heures</strong> suivant sa détection, conformément à l&apos;article 33 du RGPD.</p>
        </Section>

        <Section title="7. Cookies">
          <p>Caela Réputation utilise un cookie de session technique (JWT) strictement nécessaire au fonctionnement du dashboard. Ce cookie :</p>
          <ul style={{ paddingLeft: "20px", margin: "8px 0 12px" }}>
            <li>Ne contient pas de données personnelles en clair (token opaque signé)</li>
            <li>Expire automatiquement après 7 jours</li>
            <li>N&apos;est pas accessible côté JavaScript (httpOnly)</li>
            <li>Est transmis uniquement en HTTPS (secure)</li>
          </ul>
          <p>Aucun cookie publicitaire, analytique tiers ou de traçage inter-sites n&apos;est déposé. Voir notre <Link href="/politique-de-cookies" style={{ color: G.blue }}>Politique de cookies</Link> complète.</p>
        </Section>

        <Section title="8. Mesure d'audience">
          <p style={{ marginBottom: "12px" }}>
            Nous mesurons la fréquentation de ce site pour comprendre ce qui est consulté et améliorer ce qui fonctionne mal. Cette mesure n&apos;utilise aucun service publicitaire et ne demande pas votre consentement, car elle respecte les conditions d&apos;exemption fixées par la CNIL.
          </p>
          <p style={{ marginBottom: "16px" }}>
            Concrètement : un identifiant aléatoire est déposé sur votre appareil pour ne pas compter deux fois la même visite. Il ne contient ni votre nom, ni votre email, ni aucune information vous concernant. Il est effacé au bout de 13 mois. Ces données ne sont jamais recoupées avec d&apos;autres traitements, ni transmises à des tiers, ni utilisées pour de la publicité.
          </p>
          <div style={{ padding: "16px 20px", background: "#F8F9FA", borderRadius: "8px", border: "1px solid #DADCE0" }}>
            <RefusMesure />
          </div>
        </Section>

        <Section title="9. Pages publiques et formulaires">
          <p>Le <strong>formulaire d&apos;audit gratuit</strong> (/audit) collecte l&apos;adresse email fournie volontairement pour envoyer le rapport d&apos;audit. Cette adresse est utilisée uniquement pour l&apos;envoi de ce rapport et n&apos;est pas ajoutée à une liste marketing sans consentement explicite.</p>
          <p style={{ marginTop: "12px" }}>Le <strong>formulaire de parrainage</strong> collecte les adresses email des contacts que vous souhaitez inviter. Ces personnes reçoivent un unique email d&apos;invitation. En utilisant cette fonctionnalité, vous certifiez avoir l&apos;accord de ces personnes pour leur transmettre cette invitation.</p>
        </Section>

        <Section title="10. Modifications de cette politique">
          <p>Nous nous réservons le droit de modifier cette politique à tout moment. En cas de modification substantielle, vous serez informé par email (si vous êtes client) avec un préavis de <strong>15 jours</strong>. La version en vigueur est toujours accessible à l&apos;adresse <strong>/politique-de-confidentialite</strong>.</p>
          <p style={{ marginTop: "8px" }}>La poursuite de l&apos;utilisation du service après notification constitue une acceptation des modifications.</p>
        </Section>

        <Section title="11. Contact et réclamations">
          <p>Pour toute question relative à cette politique ou à vos données personnelles :</p>
          <div style={{ margin: "12px 0", padding: "16px 20px", background: "#F8F9FA", borderRadius: "8px", border: "1px solid #DADCE0" }}>
            <strong>Caela Agency — Traitement des données personnelles</strong><br />
            Email : <a href="mailto:contact@caela.fr" style={{ color: G.blue }}>contact@caela.fr</a><br />
            Objet : [RGPD] Votre demande<br />
            Délai de réponse : 30 jours calendaires
          </div>
          <p>Autorité de contrôle : <a href="https://www.cnil.fr" style={{ color: G.blue }} target="_blank" rel="noopener noreferrer">CNIL</a> — 3 Place de Fontenoy, 75334 Paris Cedex 07 — 01 53 73 22 22</p>
        </Section>

        <div style={{ marginTop: "48px", padding: "20px 24px", background: "#F8F9FA", borderRadius: "12px", border: "1px solid #DADCE0", fontSize: "13px", color: "#80868B" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "center" }}>
            <Link href="/mentions-legales" style={{ color: G.blue, textDecoration: "none" }}>Mentions légales</Link>
            <span>·</span>
            <Link href="/cgv" style={{ color: G.blue, textDecoration: "none" }}>CGV</Link>
            <span>·</span>
            <Link href="/politique-de-cookies" style={{ color: G.blue, textDecoration: "none" }}>Cookies</Link>
            <span>·</span>
            <Link href="/" style={{ color: G.blue, textDecoration: "none" }}>Retour à l&apos;accueil</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
