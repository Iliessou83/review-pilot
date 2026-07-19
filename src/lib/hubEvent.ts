import { createHmac } from "crypto";

// Pousse un évènement métier vers le cerveau Caela (cockpit + notifications du Hub).
// Signé HMAC-SHA256 avec le secret partagé CAELA_SSO_SECRET. Routé par owner_email.
// CÔTÉ SERVEUR UNIQUEMENT, non bloquant.
const HUB_URL = process.env.CAELA_HUB_URL || "https://caela-hub.vercel.app";

export async function pushHubEvent(input: {
  ownerEmail: string | null | undefined;
  kind: string;
  title: string;
  amount?: number | null;
  href?: string | null;
  metadata?: Record<string, unknown>;
  // Nom du commerce : sert au provisionnement du compte cerveau (business_name)
  // quand l'email n'existe pas encore côté Hub (fédération des îlots par email).
  businessName?: string | null;
}): Promise<void> {
  try {
    const secret = process.env.CAELA_SSO_SECRET;
    if (!secret || !input.ownerEmail) return;

    const body = JSON.stringify({
      owner_email: input.ownerEmail.toLowerCase(),
      module: "avis",
      kind: input.kind,
      title: input.title,
      amount: input.amount ?? null,
      href: input.href ?? "/api/sso/avis",
      metadata: input.metadata ?? {},
      ...(input.businessName ? { business_name: input.businessName } : {}),
    });
    const sig = createHmac("sha256", secret).update(body).digest("hex");

    await fetch(`${HUB_URL}/api/events/ingest`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-caela-signature": sig },
      body,
      // Ne jamais bloquer/pendre la réponse du module si le Hub est lent/indispo.
      signal: AbortSignal.timeout(4000),
    });
  } catch {
    /* non bloquant */
  }
}
