import Link from "next/link";
import { redirect } from "next/navigation";
import { getScope } from "@/lib/scope";

export const dynamic = "force-dynamic";

export default async function GoogleConsentPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const scope = await getScope();
  if (!scope) redirect("/");
  const hasError = (await searchParams).error === "consent";

  return (
    <main style={{ maxWidth: 700, margin: "48px auto", padding: "0 20px", color: "#202124" }}>
      <Link href="/businesses" style={{ color: "#5F6368", textDecoration: "none", fontSize: 13 }}>← Retour aux établissements</Link>
      <div style={{ marginTop: 18, background: "#fff", border: "1px solid #DADCE0", borderRadius: 18, padding: "30px 32px", boxShadow: "0 4px 18px rgba(32,33,36,.08)" }}>
        <div style={{ display: "inline-block", padding: "5px 10px", borderRadius: 999, background: "#EEF3FF", color: "#2457C5", fontSize: 11, fontWeight: 800, marginBottom: 12 }}>
          ÉTAPE 1 SUR 2 · AUTORISATION D’ACCÈS
        </div>
        <h1 style={{ margin: "0 0 10px", fontSize: 26 }}>Connecter votre fiche Google</h1>
        <p style={{ color: "#5F6368", lineHeight: 1.65, fontSize: 14 }}>
          Cette étape autorise Caela à consulter et gérer les fiches auxquelles votre compte Google a déjà accès. Elle n’active aucune réponse automatique : vous choisirez ce mandat séparément dans Réglages.
        </p>

        {hasError && <div style={{ padding: 12, background: "#FCE8E6", color: "#B3261E", borderRadius: 9, fontSize: 13, marginBottom: 16 }}>Les deux confirmations sont obligatoires pour continuer.</div>}

        <form method="post" action="/api/google/connect">
          <label style={{ display: "flex", alignItems: "flex-start", gap: 11, padding: "14px 0", borderTop: "1px solid #EEF0F3", cursor: "pointer", lineHeight: 1.5 }}>
            <input type="checkbox" name="ownerOrManagerConfirmed" value="yes" required style={{ width: 18, height: 18, marginTop: 2 }} />
            <span><strong>Je confirme être propriétaire de la fiche ou gérant autorisé</strong><br /><small style={{ color: "#5F6368" }}>Je dispose du droit d’autoriser Caela à agir pour cet établissement. Le commerçant reste propriétaire ou copropriétaire de sa fiche.</small></span>
          </label>
          <label style={{ display: "flex", alignItems: "flex-start", gap: 11, padding: "14px 0", borderTop: "1px solid #EEF0F3", cursor: "pointer", lineHeight: 1.5 }}>
            <input type="checkbox" name="oauthAccessGranted" value="yes" required style={{ width: 18, height: 18, marginTop: 2 }} />
            <span><strong>J’autorise la connexion sécurisée OAuth à Google</strong><br /><small style={{ color: "#5F6368" }}>Je serai redirigé vers Google pour choisir mon compte et accepter les accès affichés. Je peux retirer cet accès à tout moment.</small></span>
          </label>

          <div style={{ padding: 13, background: "#F7F9FC", borderRadius: 10, color: "#5F6368", fontSize: 12.5, lineHeight: 1.55, margin: "8px 0 18px" }}>
            Caela est un service indépendant. Google Business Profile est un service gratuit de Google. Les frais Caela rémunèrent uniquement l’accompagnement et les outils Caela.
            <br />En continuant, vous reconnaissez avoir consulté les <Link href="/cgv" target="_blank" style={{ color: "#2457C5" }}>conditions Caela</Link>, la <Link href="/politique-de-confidentialite" target="_blank" style={{ color: "#2457C5" }}>politique de confidentialité</Link> et les <a href="https://support.google.com/business/answer/7163406?hl=fr" target="_blank" rel="noopener noreferrer" style={{ color: "#2457C5" }}>informations Google sur les tiers</a>.
          </div>
          <button type="submit" style={{ width: "100%", border: 0, borderRadius: 10, background: "#2457C5", color: "#fff", padding: "13px 18px", fontWeight: 750, fontSize: 14, cursor: "pointer" }}>
            Continuer vers Google →
          </button>
        </form>
      </div>
    </main>
  );
}
