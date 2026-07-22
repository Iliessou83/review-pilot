import "server-only";
import { createHmac } from "crypto";

// Catalogue d'extensions Caela consultable/activable depuis Reputation, sans
// que le commerçant quitte l'app. Même modèle de confiance que le SSO/HMAC
// déjà en place ailleurs dans l'écosystème, signé avec CAELA_SSO_SECRET.
const HUB_URL = process.env.CAELA_HUB_URL || "https://caela-hub.vercel.app";

function sign(body: string): string | null {
  const secret = process.env.CAELA_SSO_SECRET;
  if (!secret) return null;
  return createHmac("sha256", secret).update(body).digest("hex");
}

export interface HubExtension {
  key: string;
  name: string;
  produit: string;
  icon: string;
  price: number;
  accent: string;
  wash: string;
  pitch: string;
  status: "active" | "available";
  openUrl?: string;
  previewImage?: string;
  landingUrl?: string;
}

// Renvoie [] si le Hub est indisponible ou le secret absent : la page marche
// sans le widget, jamais bloquée par ça.
export async function getSuggestedExtensions(ownerEmail: string): Promise<HubExtension[]> {
  try {
    const body = JSON.stringify({
      owner_email: ownerEmail.toLowerCase(),
      exclude_module: "avis",
    });
    const sig = sign(body);
    if (!sig) return [];

    const res = await fetch(`${HUB_URL}/api/extensions/status`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-caela-signature": sig },
      body,
      signal: AbortSignal.timeout(4000),
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { modules?: HubExtension[] };
    return data.modules ?? [];
  } catch {
    return [];
  }
}

export interface ActivateExtensionResult {
  ok: boolean;
  checkoutUrl?: string;
  ssoUrl?: string;
  error?: string;
}

export async function activateExtension(input: {
  ownerEmail: string;
  businessName?: string | null;
  module: string;
}): Promise<ActivateExtensionResult> {
  try {
    const body = JSON.stringify({
      owner_email: input.ownerEmail.toLowerCase(),
      business_name: input.businessName ?? undefined,
      module: input.module,
    });
    const sig = sign(body);
    if (!sig) return { ok: false, error: "secret_manquant" };

    const res = await fetch(`${HUB_URL}/api/extensions/activate`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-caela-signature": sig },
      body,
      signal: AbortSignal.timeout(8000),
    });
    const data = (await res.json()) as {
      ok?: boolean;
      checkout_url?: string;
      sso_url?: string;
      error?: string;
    };
    if (!res.ok || !data.ok) return { ok: false, error: data.error ?? "erreur_hub" };
    return { ok: true, checkoutUrl: data.checkout_url, ssoUrl: data.sso_url ?? undefined };
  } catch {
    return { ok: false, error: "hub_indisponible" };
  }
}
