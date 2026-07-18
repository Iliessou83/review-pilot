import "server-only";

// Connexion Google Business Profile en 1 clic (OAuth 2.0).
// Le commerçant autorise l'accès à sa fiche ; on stocke son refresh_token
// (dans businesses.platform_token) et on en tire un jeton d'accès frais à
// chaque synchro / réponse. Aucune clé technique à copier-coller à la main.
//
// Prérequis côté Google Cloud (à faire une fois par Ilies) :
//  1. Projet + API "Business Profile" activées (Account Management + Business
//     Information + la v4 mybusiness pour les avis, sur liste d'autorisation).
//  2. Écran de consentement OAuth (scope sensible business.manage vérifié).
//  3. Identifiants OAuth "Application Web" → GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET.
//  4. URI de redirection autorisée : https://<domaine>/api/google/callback

const AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/business.manage";

export interface GoogleLocation {
  path: string; // "accounts/123/locations/456" — parent attendu par l'API avis v4
  title: string;
  address: string;
}

export function googleConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function redirectUri(origin: string): string {
  return `${origin}/api/google/callback`;
}

// URL de consentement Google. `state` = JWT signé (anti-CSRF + porte l'email client).
export function buildAuthUrl(origin: string, state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID as string,
    redirect_uri: redirectUri(origin),
    response_type: "code",
    scope: SCOPE,
    access_type: "offline", // pour obtenir un refresh_token
    prompt: "consent", // force la remise d'un refresh_token à chaque connexion
    include_granted_scopes: "true",
    state,
  });
  return `${AUTH_ENDPOINT}?${params.toString()}`;
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

// Échange le code d'autorisation contre les jetons (access + refresh).
export async function exchangeCode(origin: string, code: string): Promise<TokenResponse> {
  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID as string,
      client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri(origin),
    }),
  });
  if (!res.ok) throw new Error(`Google token exchange failed: ${res.status}`);
  return (await res.json()) as TokenResponse;
}

// Régénère un jeton d'accès court à partir du refresh_token stocké.
export async function refreshAccessToken(refreshToken: string): Promise<string> {
  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID as string,
      client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error(`Google token refresh failed: ${res.status}`);
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

// Jeton Bearer à utiliser pour un commerce Google.
// - OAuth (cas normal) : platform_token = refresh_token → on régénère un accès frais.
// - Fallback legacy : si le refresh échoue (jeton d'accès collé à la main jadis),
//   on retente avec la valeur brute pour ne rien casser.
export async function googleAccessToken(business: { platformToken: string }): Promise<string> {
  if (googleConfigured()) {
    try {
      return await refreshAccessToken(business.platformToken);
    } catch {
      // On retombe sur la valeur brute (ancienne saisie manuelle).
    }
  }
  return business.platformToken;
}

// Liste les comptes Business Profile accessibles (mybusinessaccountmanagement v1).
async function listAccounts(accessToken: string): Promise<string[]> {
  const res = await fetch(
    "https://mybusinessaccountmanagement.googleapis.com/v1/accounts?pageSize=20",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok) throw new Error(`Google accounts failed: ${res.status}`);
  const data = (await res.json()) as { accounts?: { name: string }[] };
  return (data.accounts || []).map((a) => a.name); // "accounts/123"
}

// Liste les établissements d'un compte (mybusinessbusinessinformation v1).
async function locationsOfAccount(accessToken: string, account: string): Promise<GoogleLocation[]> {
  const readMask = "name,title,storefrontAddress";
  const url = `https://mybusinessbusinessinformation.googleapis.com/v1/${account}/locations?pageSize=100&readMask=${encodeURIComponent(readMask)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) throw new Error(`Google locations failed: ${res.status}`);
  const data = (await res.json()) as {
    locations?: { name: string; title?: string; storefrontAddress?: { addressLines?: string[]; locality?: string } }[];
  };
  return (data.locations || []).map((loc) => {
    const addr = loc.storefrontAddress;
    const address = [addr?.addressLines?.join(" "), addr?.locality].filter(Boolean).join(", ");
    return {
      // L'API avis v4 attend le chemin complet "accounts/X/locations/Y".
      path: `${account}/${loc.name}`,
      title: loc.title || "Mon établissement",
      address,
    };
  });
}

// Tous les établissements que ce compte Google peut gérer.
export async function listAllLocations(accessToken: string): Promise<GoogleLocation[]> {
  const accounts = await listAccounts(accessToken);
  const all: GoogleLocation[] = [];
  for (const account of accounts) {
    try {
      all.push(...(await locationsOfAccount(accessToken, account)));
    } catch {
      // Un compte sans droit de lecture ne bloque pas les autres.
    }
  }
  return all;
}
