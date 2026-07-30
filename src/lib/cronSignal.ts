import { timingSafeEqual } from "crypto";

// ── Caela Réputation · Preuve de vie des tâches planifiées ──────────────────
//
// Quatre crons : synchronisation des avis, relances, fin d'essai, rapport
// hebdomadaire. Cas particulier de ce projet : ils tournaient peut-être déjà,
// mais jusqu'au 2026-07-30 ils n'envoyaient RIEN, faute de clé Resend en
// production. Un cron vert qui n'envoie rien est le pire des deux mondes, et
// c'est précisément ce qu'un tableau de santé doit rendre visible.
//
// Chaque tâche signale son passage à Nexus, qui affiche l'état des 34 crons de
// l'écosystème sur un seul écran.

const NEXUS = process.env.NEXUS_CRON_PING_URL?.trim()
  || "https://nexus-two-tawny-29.vercel.app/api/cron-ping";
const PROJET = "review-pilot";

/**
 * Le secret attendu, comparé à temps constant.
 *
 * Les 16 routes faisaient `auth !== \`Bearer ${process.env.CRON_SECRET}\``.
 * Deux défauts dans une seule ligne : le `!==` révèle la valeur attendue
 * caractère par caractère via le temps de réponse, et surtout, si
 * CRON_SECRET venait à manquer, la chaîne devenait littéralement
 * "Bearer undefined" — qu'il suffisait d'envoyer pour entrer. Config absente =
 * on refuse, jamais l'inverse (panne 14).
 */
export function cronAutorise(req: Request): boolean {
  const attendu = process.env.CRON_SECRET;
  if (!attendu) {
    console.error("[cron] CRON_SECRET absent : toute exécution est refusée");
    return false;
  }
  const recu = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (!recu || recu.length !== attendu.length) return false;
  try {
    return timingSafeEqual(Buffer.from(recu), Buffer.from(attendu));
  } catch {
    return false;
  }
}

/**
 * Signale un passage à Nexus. Ne lève JAMAIS et n'interrompt jamais la tâche
 * observée : un envoi d'emails ne doit pas tomber parce que le journal
 * hoquette. Si le secret de signalement manque, on se tait plutôt que d'échouer.
 */
export async function signalerCron(
  chemin: string,
  ok: boolean,
  message?: string,
  dureeMs?: number,
): Promise<void> {
  const secret = process.env.CRON_PING_SECRET?.trim();
  if (!secret) return;
  try {
    const r = await fetch(NEXUS, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-cron-ping-secret": secret },
      body: JSON.stringify({
        projet: PROJET,
        chemin,
        ok,
        message: message ? String(message).slice(0, 500) : undefined,
        duree_ms: typeof dureeMs === "number" ? Math.round(dureeMs) : undefined,
      }),
    });
    if (!r.ok) console.error(`[cron] signalement refusé (${r.status}) pour ${chemin}`);
  } catch (e) {
    console.error(`[cron] signalement impossible pour ${chemin}`, e);
  }
}

type Handler = (req: Request) => Promise<Response>;

/**
 * Enveloppe une route de cron : mesure la durée, signale le passage, laisse le
 * comportement d'origine strictement intact.
 *
 * Un `401` n'est PAS signalé : une sonde refusée n'est pas une exécution, et la
 * compter ferait passer un cron mort pour vivant. C'est précisément le mensonge
 * qu'on cherche à supprimer.
 */
export function avecSignalement(chemin: string, handler: Handler): Handler {
  return async (req: Request): Promise<Response> => {
    const debut = Date.now();
    try {
      const res = await handler(req);
      if (res.status !== 401) {
        const ok = res.status < 400;
        await signalerCron(chemin, ok, ok ? undefined : `HTTP ${res.status}`, Date.now() - debut);
      }
      return res;
    } catch (e) {
      await signalerCron(chemin, false, e instanceof Error ? e.message : String(e), Date.now() - debut);
      throw e;
    }
  };
}
