import { Resend } from "resend";

// ── Envoi d'emails, un seul endroit ─────────────────────────────────────────
//
// CE QUI A CHANGÉ (2026-07-30) ET POURQUOI
//
// Huit fichiers écrivaient chacun `new Resend(process.env.RESEND_API_KEY ||
// "placeholder")` et chacun son adresse d'expéditeur en dur. Deux pannes en
// découlaient, toutes deux muettes :
//
// 1. `RESEND_API_KEY` n'était PAS posée en production. Le repli "placeholder"
//    construisait un client parfaitement valide qui échouait à chaque envoi.
//    Aucun email n'est parti de ce projet : ni « mot de passe oublié », ni
//    rapport d'audit, ni relance, ni rapport hebdomadaire.
// 2. L'expéditeur était `@caela.fr`, un domaine NON vérifié dans ce compte
//    Resend. Vérifié en vrai le 30/07 : l'API répond
//    `403 The caela.fr domain is not verified`. Même en posant la clé, rien
//    ne serait parti. Seul `caelenda.fr` est vérifié.
//
// Règle qui en découle : la clé et l'expéditeur vivent ICI, nulle part ailleurs.
// Voir les pannes 72 et 86 du catalogue `pannes-silencieuses`.

function cle(): string {
  const k = process.env.RESEND_API_KEY?.trim();
  if (k) return k;
  // Un repli silencieux transforme une variable absente en panne invisible.
  // On préfère une erreur lisible dans les journaux.
  if (process.env.NODE_ENV === "production") {
    throw new Error("RESEND_API_KEY absente en production : aucun email ne peut partir");
  }
  return "placeholder-dev";
}

let client: Resend | null = null;

/** Client Resend partagé, construit au premier envoi (jamais au chargement du module). */
export function resend(): Resend {
  if (!client) client = new Resend(cle());
  return client;
}

// `caelenda.fr` est le SEUL domaine vérifié de ce compte Resend. Ne pas
// remettre `@caela.fr` sans l'avoir vérifié sur resend.com/domains d'abord.
const DOMAINE = "caelenda.fr";

/** Transactionnel : mot de passe, audit, relances. */
export const EXPEDITEUR =
  process.env.EMAIL_FROM?.trim() || `Caela Réputation <reputation@${DOMAINE}>`;

/** Notifications produit : nouvel avis, limite de palier atteinte. */
export const EXPEDITEUR_NOTIF =
  process.env.EMAIL_FROM_NOTIF?.trim() || `Caela Réputation <notifications@${DOMAINE}>`;

/** L'envoi est-il seulement possible ? À appeler avant une boucle d'envois. */
export function envoiConfigure(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

type OptionsEnvoi = Parameters<Resend["emails"]["send"]>[0];

/**
 * Envoie, et LIT la réponse.
 *
 * Le SDK Resend ne lève pas d'exception quand l'API refuse : il renvoie
 * `{ data: null, error }`. Un `try/catch` autour de `emails.send` n'attrape
 * donc rien, et une clé absente, un domaine non vérifié ou un quota dépassé
 * passent pour un succès. C'est ce qui a masqué la panne pendant des mois.
 *
 * Renvoie `true` seulement si Resend a rendu un identifiant de message.
 */
export async function envoyer(options: OptionsEnvoi): Promise<boolean> {
  const destinataire = Array.isArray(options.to) ? options.to.join(", ") : options.to;
  try {
    const { data, error } = await resend().emails.send(options);
    if (error) {
      console.error(`[email] Resend a refusé l'envoi vers ${destinataire} :`, error);
      return false;
    }
    if (!data?.id) {
      console.error(`[email] aucun identifiant renvoyé pour ${destinataire} : envoi non confirmé`);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[email] appel impossible vers ${destinataire} :`, err);
    return false;
  }
}
