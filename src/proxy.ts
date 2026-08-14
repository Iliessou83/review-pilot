import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { COOKIE_ID, COOKIE_OPTOUT, DUREE_ID_SECONDES, nouvelIdAnonyme } from "@/lib/analytics/core";

// ── Caela Embed : qui a le droit d'afficher /r/[slug] en iframe ? ────────
// Le Hub signe un jeton (aud "caela-embed") qui porte l'origine autorisée.
// Sans jeton, comportement historique conservé : la roue d'avis reste
// embarquable partout (des commerçants l'ont déjà mise sur leur site à la
// main). Avec un jeton portant une origine précise, seule cette origine peut
// l'encadrer. Jeton falsifié ou expiré : encadrement refusé.

async function frameAncestorsFor(request: NextRequest): Promise<string> {
  const token = request.nextUrl.searchParams.get("ct");
  if (!token) return "*";
  const secret = process.env.CAELA_SSO_SECRET?.trim();
  if (!secret) return "*";
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
      issuer: "caela-hub",
      audience: "caela-embed",
    });
    const origin = String(payload.origin ?? "*");
    if (origin === "*") return "*";
    // Origine reconstruite par URL() : jamais de chaîne brute réinjectée dans
    // l'en-tête (un espace suffirait à injecter une directive).
    const u = new URL(origin);
    if (u.protocol !== "https:" && u.protocol !== "http:") return "'none'";
    return u.origin;
  } catch {
    return "'none'";
  }
}

// ── Mesure d'audience : identifiant anonyme en cookie ────────────────────
// Posé côté serveur pour que le serveur ET le navigateur calculent toujours
// la même variante d'A/B test (zéro clignotement au chargement).
function poserIdAnonyme(request: NextRequest, response: NextResponse): NextResponse {
  if (request.cookies.get(COOKIE_OPTOUT)?.value === "1") return response;
  if (request.cookies.get(COOKIE_ID)?.value) return response;

  response.cookies.set(COOKIE_ID, nouvelIdAnonyme(), {
    path: "/",
    maxAge: DUREE_ID_SECONDES,
    sameSite: "lax",
    httpOnly: false, // lu par le navigateur pour l'attribution des variantes
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}

export async function proxy(request: NextRequest) {
  const res = NextResponse.next({ request });

  if (request.nextUrl.pathname.startsWith("/r/")) {
    res.headers.set(
      "Content-Security-Policy",
      `frame-ancestors ${await frameAncestorsFor(request)}`,
    );
  }

  return poserIdAnonyme(request, res);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/an).*)"],
};
