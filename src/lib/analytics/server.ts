import "server-only";
import { PRODUIT } from "./config";

/**
 * Tracking côté serveur, pour ce qu'on ne peut pas mesurer dans le navigateur :
 * un paiement confirmé par le webhook Stripe, un email envoyé, un cron.
 * Le navigateur peut mentir ou être fermé ; le serveur, non.
 *
 * ⚠️ Ne jamais passer d'identifiant de compte, d'email ou de nom : ça
 * croiserait la mesure avec le fichier client et ferait tomber l'exemption
 * de consentement (un bandeau deviendrait obligatoire sur tout le site).
 */
export async function trackServeur(
  evenement: string,
  options: {
    /** Identifiant anonyme du visiteur, s'il est connu (cookie caela_aid). */
    anonId?: string | null;
    /** Bouton/lien d'origine, s'il a été transmis dans les métadonnées Stripe. */
    origine?: string | null;
    props?: Record<string, unknown>;
    expKey?: string | null;
    variant?: string | null;
  } = {},
) {
  const url = process.env.ANALYTICS_SUPABASE_URL;
  const cle = process.env.ANALYTICS_SERVICE_KEY;
  if (!url || !cle) return;

  try {
    await fetch(`${url}/rest/v1/an_events`, {
      method: "POST",
      headers: {
        apikey: cle,
        Authorization: `Bearer ${cle}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify([
        {
          product: PRODUIT,
          event: evenement.slice(0, 60),
          anon_id: options.anonId || "srv-systeme",
          origin: options.origine ?? null,
          props: options.props ?? {},
          exp_key: options.expKey ?? null,
          variant: options.variant ?? null,
          device: "serveur",
        },
      ]),
    });
  } catch (e) {
    console.error("[analytics] serveur", e);
  }
}
