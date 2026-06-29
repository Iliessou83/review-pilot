export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { subscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { planById, billing } from "@/config/legal.config";
import CancelButton from "./CancelButton";

const G = { blue: "#1A73E8", green: "#34A853", grey: "#5F6368" };

function fmt(d: Date | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

const STATUS_LABEL: Record<string, string> = {
  trialing: "Essai en cours",
  active: "Abonnement actif",
  past_due: "Paiement en attente",
  canceled: "Résilié",
  incomplete: "En attente de paiement",
  unpaid: "Impayé",
};

export default async function BillingPage() {
  const session = await getSession();
  if (!session) redirect("/");

  const rows = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.email, session.email))
    .limit(1);
  const sub = rows[0];
  const plan = sub?.planId ? planById(sub.planId) : undefined;
  const isTrial = sub?.status === "trialing";
  const endDate = isTrial ? sub?.trialEndsAt : sub?.currentPeriodEnd;

  return (
    <div style={{ maxWidth: "720px", margin: "0 auto", padding: "48px 24px", fontFamily: "system-ui,-apple-system,sans-serif" }}>
      <Link href="/dashboard" style={{ fontSize: "14px", color: G.blue, textDecoration: "none" }}>← Retour au dashboard</Link>
      <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#202124", margin: "16px 0 32px" }}>Abonnement & facturation</h1>

      {!sub || !sub.stripeSubscriptionId ? (
        <div style={{ padding: "24px", background: "#F8F9FA", borderRadius: "12px", border: "1px solid #DADCE0" }}>
          <p style={{ fontSize: "15px", color: G.grey, margin: "0 0 16px" }}>
            Aucun abonnement actif. Démarrez votre essai gratuit de {billing.trialDays} jours.
          </p>
          <Link href="/#pricing" style={{ display: "inline-block", padding: "10px 18px", background: G.blue, color: "#fff", textDecoration: "none", borderRadius: "6px", fontSize: "14px", fontWeight: 600 }}>
            Voir les formules
          </Link>
        </div>
      ) : (
        <div style={{ padding: "28px", background: "#fff", borderRadius: "12px", border: "1px solid #DADCE0", boxShadow: "0 1px 3px rgba(60,64,67,0.12)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <div style={{ fontSize: "13px", color: G.grey, marginBottom: "4px" }}>Formule</div>
              <div style={{ fontSize: "20px", fontWeight: 700, color: "#202124" }}>
                {plan?.name ?? sub.planId} {plan && <span style={{ fontSize: "14px", color: G.grey, fontWeight: 500 }}>· {plan.priceMonthly}€/mois</span>}
              </div>
            </div>
            <span style={{ padding: "6px 12px", background: isTrial ? "#E8F0FE" : "#E6F4EA", color: isTrial ? G.blue : G.green, borderRadius: "20px", fontSize: "13px", fontWeight: 600 }}>
              {STATUS_LABEL[sub.status] ?? sub.status}
            </span>
          </div>

          <div style={{ padding: "16px", background: "#F8F9FA", borderRadius: "8px", marginBottom: "24px" }}>
            <p style={{ fontSize: "14px", color: G.grey, margin: 0, lineHeight: 1.6 }}>
              {isTrial ? (
                <>Fin de l&apos;essai gratuit : <strong style={{ color: "#202124" }}>{fmt(endDate)}</strong>.<br/>
                À cette date, votre abonnement {plan?.name} démarre à {plan?.priceMonthly}€/mois, sauf résiliation.</>
              ) : (
                <>Prochain prélèvement : <strong style={{ color: "#202124" }}>{fmt(endDate)}</strong>.</>
              )}
            </p>
          </div>

          <CancelButton alreadyCancelled={sub.cancelAtPeriodEnd} />
        </div>
      )}

      <p style={{ fontSize: "12px", color: "#80868B", marginTop: "24px", lineHeight: 1.6 }}>
        Résiliation libre à tout moment, en ligne, sans frais ni justification (art. L215-1-1 du Code de la consommation).
        Détails dans les <Link href="/cgv" style={{ color: G.blue, textDecoration: "none" }}>CGV</Link>.
      </p>
    </div>
  );
}
