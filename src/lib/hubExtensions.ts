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
export async function getSuggestedExtensions(
  ownerEmail: string,
): Promise<{ modules: HubExtension[]; memberPromoCode: string | null }> {
  try {
    const body = JSON.stringify({
      owner_email: ownerEmail.toLowerCase(),
      exclude_module: "avis",
    });
    const sig = sign(body);
    if (!sig) return { modules: [], memberPromoCode: null };

    const res = await fetch(`${HUB_URL}/api/extensions/status`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-caela-signature": sig },
      body,
      signal: AbortSignal.timeout(4000),
      cache: "no-store",
    });
    if (!res.ok) return { modules: [], memberPromoCode: null };
    const data = (await res.json()) as { modules?: HubExtension[]; memberPromoCode?: string | null };
    return { modules: data.modules ?? [], memberPromoCode: data.memberPromoCode ?? null };
  } catch {
    return { modules: [], memberPromoCode: null };
  }
}

export interface OpenHubResult {
  ok: boolean;
  url?: string;
  error?: string;
}

// URL de connexion directe au cockpit Hub, pour le bouton "Ouvrir mon compte"
// visible en permanence dans le dashboard (pas seulement à l'écran de login).
export async function openHubAccount(ownerEmail: string): Promise<OpenHubResult> {
  try {
    const body = JSON.stringify({ owner_email: ownerEmail.toLowerCase() });
    const sig = sign(body);
    if (!sig) return { ok: false, error: "secret_manquant" };

    const res = await fetch(`${HUB_URL}/api/hub/open`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-caela-signature": sig },
      body,
      signal: AbortSignal.timeout(8000),
    });
    const data = (await res.json()) as { url?: string; error?: string };
    if (!res.ok || !data.url) return { ok: false, error: data.error ?? "erreur_hub" };
    return { ok: true, url: data.url };
  } catch {
    return { ok: false, error: "hub_indisponible" };
  }
}

export interface ConfirmLinkResult {
  ok: boolean;
  error?: string;
}

// Confirme au Hub que ce commerçant, réellement connecté ici (preuve de
// possession), veut relier son compte Reputation à son compte Caela principal.
// Appelé UNIQUEMENT côté serveur, jamais avec un email fourni par le client.
export async function confirmAccountLink(input: {
  ticket: string;
  localEmail: string;
}): Promise<ConfirmLinkResult> {
  try {
    const body = JSON.stringify({
      ticket: input.ticket,
      module: "avis",
      local_email: input.localEmail.toLowerCase(),
    });
    const sig = sign(body);
    if (!sig) return { ok: false, error: "secret_manquant" };

    const res = await fetch(`${HUB_URL}/api/account-links/confirm`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-caela-signature": sig },
      body,
      signal: AbortSignal.timeout(8000),
    });
    const data = (await res.json()) as { ok?: boolean; error?: string };
    if (!res.ok || !data.ok) return { ok: false, error: data.error ?? "erreur_hub" };
    return { ok: true };
  } catch {
    return { ok: false, error: "hub_indisponible" };
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
