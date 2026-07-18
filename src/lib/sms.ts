import "server-only";

// Envoi de SMS via un fournisseur enfichable. Par défaut : Brevo (ex-Sendinblue,
// SMS transactionnel ~0,045 €/SMS en France). Rien n'est envoyé tant que
// BREVO_API_KEY n'est pas posée : la fonctionnalité reste en sommeil ("non configuré").
//
// Prérequis (action d'Ilies, aucun coût engagé sans son accord) :
//  - Compte Brevo + crédits SMS + clé API → BREVO_API_KEY
//  - Nom d'expéditeur SMS (max 11 caractères alphanumériques) → SMS_SENDER (ex: "Avis")
// Pour passer à Twilio/autre plus tard : remplacer sendSms() ci-dessous.

export function smsConfigured(): boolean {
  return Boolean(process.env.BREVO_API_KEY);
}

export function smsSender(): string {
  return (process.env.SMS_SENDER || "Avis").slice(0, 11);
}

// Normalise un numéro FR en E.164 (+33XXXXXXXXX). Renvoie null si invalide.
export function normalizePhoneFR(raw: string): string | null {
  if (!raw) return null;
  let s = raw.replace(/[\s.\-()]/g, "");
  if (s.startsWith("+")) {
    return /^\+\d{8,15}$/.test(s) ? s : null;
  }
  if (s.startsWith("00")) s = "+" + s.slice(2);
  else if (s.startsWith("0") && s.length === 10) s = "+33" + s.slice(1); // 06.. -> +336..
  else if (/^\d{9}$/.test(s)) s = "+33" + s; // 6xxxxxxxx
  else return null;
  return /^\+\d{8,15}$/.test(s) ? s : null;
}

export interface SmsResult {
  ok: boolean;
  id?: string;
  error?: string;
}

// Brevo attend le destinataire sans le "+".
export async function sendSms(to: string, content: string, sender?: string): Promise<SmsResult> {
  if (!smsConfigured()) return { ok: false, error: "sms_not_configured" };
  try {
    const res = await fetch("https://api.brevo.com/v3/transactionalSMS/sms", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY as string,
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: (sender || smsSender()).slice(0, 11),
        recipient: to.replace(/^\+/, ""),
        content,
        type: "transactional",
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return { ok: false, error: `brevo_${res.status}${detail ? `: ${detail.slice(0, 120)}` : ""}` };
    }
    const data = (await res.json().catch(() => ({}))) as { messageId?: string | number; reference?: string };
    return { ok: true, id: String(data.messageId ?? data.reference ?? "") };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "sms_error" };
  }
}
