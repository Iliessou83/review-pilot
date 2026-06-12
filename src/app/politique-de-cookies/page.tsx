import Link from "next/link";

const G = { blue: "#1A73E8", red: "#EA4335", yellow: "#FBBC04", green: "#34A853" };

export const metadata = {
  title: "Politique de cookies — Caela Réputation",
  description: "Informations sur les cookies utilisés par Caela Réputation et comment les gérer.",
};

export default function PolitiqueCookiesPage() {
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
        <h1 style={{ fontSize: "32px", fontWeight: 800, margin: "0 0 8px", color: "#202124" }}>Politique de cookies</h1>
        <p style={{ fontSize: "14px", color: "#80868B", margin: "0 0 8px" }}>Dernière mise à jour : juin 2026</p>

        <div style={{ fontSize: "13px", color: "#202124", margin: "0 0 48px", lineHeight: 1.6, padding: "16px 20px", background: "#E6F4EA", borderRadius: "8px", border: "1px solid #A8D5B5" }}>
          <strong>En résumé :</strong> Caela Réputation utilise <strong>uniquement un cookie technique strictement nécessaire</strong> à votre connexion au dashboard. Aucun cookie publicitaire, aucun tracker tiers, aucune analyse comportementale.
        </div>

        {[
          {
            title: "1. Qu'est-ce qu'un cookie ?",
            content: (
              <p>Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur, smartphone, tablette) par un site web lors de votre visite. Il permet au site de mémoriser des informations sur votre session.</p>
            ),
          },
          {
            title: "2. Les cookies que nous utilisons",
            content: (
              <>
                <p style={{ marginBottom: "16px" }}>Caela Réputation utilise <strong>un seul cookie</strong> :</p>
                <div style={{ border: "1px solid #DADCE0", borderRadius: "8px", overflow: "hidden" }}>
                  <div style={{ padding: "14px 18px", background: "#F8F9FA", display: "grid", gridTemplateColumns: "180px 1fr", gap: "8px", borderBottom: "1px solid #DADCE0" }}>
                    <div style={{ fontWeight: 600, color: "#202124", fontSize: "13px" }}>Nom</div>
                    <div style={{ fontSize: "13px", color: "#5F6368" }}><code style={{ background: "#E8F0FE", padding: "2px 6px", borderRadius: "4px" }}>caela_session</code></div>
                  </div>
                  <div style={{ padding: "14px 18px", display: "grid", gridTemplateColumns: "180px 1fr", gap: "8px", borderBottom: "1px solid #DADCE0" }}>
                    <div style={{ fontWeight: 600, color: "#202124", fontSize: "13px" }}>Type</div>
                    <div style={{ fontSize: "13px", color: "#5F6368" }}>Cookie de session (authentification) — Strictement nécessaire</div>
                  </div>
                  <div style={{ padding: "14px 18px", background: "#F8F9FA", display: "grid", gridTemplateColumns: "180px 1fr", gap: "8px", borderBottom: "1px solid #DADCE0" }}>
                    <div style={{ fontWeight: 600, color: "#202124", fontSize: "13px" }}>Finalité</div>
                    <div style={{ fontSize: "13px", color: "#5F6368" }}>Maintenir votre connexion au dashboard après authentification. Sans ce cookie, il vous serait impossible de rester connecté entre les pages.</div>
                  </div>
                  <div style={{ padding: "14px 18px", display: "grid", gridTemplateColumns: "180px 1fr", gap: "8px", borderBottom: "1px solid #DADCE0" }}>
                    <div style={{ fontWeight: 600, color: "#202124", fontSize: "13px" }}>Contenu</div>
                    <div style={{ fontSize: "13px", color: "#5F6368" }}>Un token JWT signé (opaque — ne contient pas de données personnelles en clair). Le token contient uniquement un identifiant de session et une date d&apos;expiration.</div>
                  </div>
                  <div style={{ padding: "14px 18px", background: "#F8F9FA", display: "grid", gridTemplateColumns: "180px 1fr", gap: "8px", borderBottom: "1px solid #DADCE0" }}>
                    <div style={{ fontWeight: 600, color: "#202124", fontSize: "13px" }}>Durée</div>
                    <div style={{ fontSize: "13px", color: "#5F6368" }}>7 jours (expiration automatique)</div>
                  </div>
                  <div style={{ padding: "14px 18px", display: "grid", gridTemplateColumns: "180px 1fr", gap: "8px", borderBottom: "1px solid #DADCE0" }}>
                    <div style={{ fontWeight: 600, color: "#202124", fontSize: "13px" }}>Sécurité</div>
                    <div style={{ fontSize: "13px", color: "#5F6368" }}><code style={{ background: "#E8F0FE", padding: "2px 6px", borderRadius: "4px", fontSize: "12px" }}>HttpOnly</code> (inaccessible via JavaScript) · <code style={{ background: "#E8F0FE", padding: "2px 6px", borderRadius: "4px", fontSize: "12px" }}>Secure</code> (HTTPS uniquement) · <code style={{ background: "#E8F0FE", padding: "2px 6px", borderRadius: "4px", fontSize: "12px" }}>SameSite=Strict</code></div>
                  </div>
                  <div style={{ padding: "14px 18px", background: "#F8F9FA", display: "grid", gridTemplateColumns: "180px 1fr", gap: "8px" }}>
                    <div style={{ fontWeight: 600, color: "#202124", fontSize: "13px" }}>Tiers</div>
                    <div style={{ fontSize: "13px", color: "#5F6368" }}>Cookie interne — aucune donnée transmise à un tiers</div>
                  </div>
                </div>

                <p style={{ marginTop: "16px" }}>Ce cookie est classé comme <strong>« strictement nécessaire »</strong> au sens de la directive ePrivacy 2002/58/CE et des recommandations CNIL. Il est exempté de consentement préalable car il est indispensable au fonctionnement du service demandé.</p>
              </>
            ),
          },
          {
            title: "3. Ce que nous n'utilisons PAS",
            content: (
              <>
                <p style={{ marginBottom: "12px" }}>Caela Réputation <strong>ne dépose aucun</strong> des cookies suivants :</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {[
                    ["❌ Cookies analytiques", "Pas de Google Analytics, Matomo, Hotjar ou équivalent"],
                    ["❌ Cookies publicitaires", "Pas de pixel Facebook/Meta, Google Ads, TikTok ou équivalent"],
                    ["❌ Cookies de réseaux sociaux", "Pas de bouton \"J'aime\" ou \"Partager\" avec tracking"],
                    ["❌ Cookies de personnalisation tiers", "Pas de service de personnalisation externe"],
                    ["❌ Fingerprinting", "Pas d'empreinte numérique de votre navigateur"],
                    ["❌ Trackers inter-sites", "Nous ne vous suivons pas sur d'autres sites"],
                  ].map(([label, desc], i) => (
                    <div key={i} style={{ display: "flex", gap: "12px", padding: "12px 16px", background: "#F8F9FA", borderRadius: "6px", border: "1px solid #DADCE0" }}>
                      <div style={{ fontWeight: 600, color: "#202124", fontSize: "13px", minWidth: "220px" }}>{label}</div>
                      <div style={{ fontSize: "13px", color: "#5F6368" }}>{desc}</div>
                    </div>
                  ))}
                </div>
              </>
            ),
          },
          {
            title: "4. Comment gérer ou supprimer ce cookie",
            content: (
              <>
                <p style={{ marginBottom: "12px" }}>Le cookie de session est automatiquement supprimé :</p>
                <ul style={{ paddingLeft: "20px", marginBottom: "16px" }}>
                  <li style={{ marginBottom: "6px" }}>Quand vous cliquez sur <strong>« Déconnexion »</strong> dans le dashboard (suppression côté serveur et côté client)</li>
                  <li style={{ marginBottom: "6px" }}>Automatiquement après <strong>7 jours</strong> d&apos;inactivité</li>
                </ul>
                <p style={{ marginBottom: "12px" }}>Vous pouvez également le supprimer manuellement depuis votre navigateur :</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {[
                    ["Google Chrome", "Paramètres → Confidentialité et sécurité → Effacer les données → Cookies"],
                    ["Mozilla Firefox", "Paramètres → Vie privée et sécurité → Cookies et données de sites"],
                    ["Safari", "Préférences → Confidentialité → Gérer les données des sites"],
                    ["Microsoft Edge", "Paramètres → Confidentialité, recherche et services → Effacer les données"],
                  ].map(([browser, path], i) => (
                    <div key={i} style={{ padding: "10px 14px", background: "#F8F9FA", borderRadius: "6px", border: "1px solid #DADCE0", fontSize: "13px" }}>
                      <strong style={{ color: "#202124" }}>{browser} :</strong> <span style={{ color: "#5F6368" }}>{path}</span>
                    </div>
                  ))}
                </div>
                <p style={{ marginTop: "12px", fontSize: "13px", color: "#80868B" }}>
                  Attention : la suppression du cookie de session vous déconnectera automatiquement du dashboard. Vous devrez vous reconnecter.
                </p>
              </>
            ),
          },
          {
            title: "5. Pages publiques",
            content: (
              <p>Les pages publiques de Caela Réputation (accueil, audit, parrainage, plaques NFC, CGV, mentions légales) <strong>ne déposent aucun cookie</strong>. Aucune bannière de consentement n&apos;est donc nécessaire pour ces pages.</p>
            ),
          },
          {
            title: "6. Évolution de cette politique",
            content: (
              <p>Si nous venions à utiliser de nouveaux cookies (par exemple des outils d&apos;analyse anonymisés), cette politique sera mise à jour et une bannière de consentement sera affichée avant tout dépôt non nécessaire. Vous serez informé par email si vous êtes client.</p>
            ),
          },
          {
            title: "7. Contact",
            content: (
              <p>Pour toute question sur notre utilisation des cookies : <a href="mailto:contact@caela.fr" style={{ color: G.blue }}>contact@caela.fr</a></p>
            ),
          },
        ].map((section, i) => (
          <div key={i} style={{ marginBottom: "40px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#202124", margin: "0 0 14px", paddingBottom: "10px", borderBottom: "1px solid #DADCE0" }}>
              {section.title}
            </h2>
            <div style={{ fontSize: "14px", color: "#5F6368", lineHeight: 1.8 }}>
              {section.content}
            </div>
          </div>
        ))}

        <div style={{ marginTop: "48px", padding: "20px 24px", background: "#F8F9FA", borderRadius: "12px", border: "1px solid #DADCE0", fontSize: "13px", color: "#80868B" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "center" }}>
            <Link href="/mentions-legales" style={{ color: G.blue, textDecoration: "none" }}>Mentions légales</Link>
            <span>·</span>
            <Link href="/cgv" style={{ color: G.blue, textDecoration: "none" }}>CGV</Link>
            <span>·</span>
            <Link href="/politique-de-confidentialite" style={{ color: G.blue, textDecoration: "none" }}>Confidentialité</Link>
            <span>·</span>
            <Link href="/" style={{ color: G.blue, textDecoration: "none" }}>Retour à l&apos;accueil</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
