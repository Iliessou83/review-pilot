import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

// ── Caela Embed : qui a le droit d'afficher /r/[slug] en iframe ? ────────
// Le Hub signe un jeton (aud "caela-embed") qui porte l'origine autorisée.
// Sans jeton, comportement historique conservé : la roue d'avis reste
// embarquable partout (des commerçants l'ont déjà mise sur leur site à la
// main). Avec un jeton portant une origine précise, seule cette origine peut
// l'encadrer. Jeton falsifié ou expiré : encadrement refusé.
//
// Ce middleware ne fait QUE ça : aucune session, aucune redirection.

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

export async function middleware(request: NextRequest) {
  const res = NextResponse.next({ request });
  res.headers.set(
    "Content-Security-Policy",
    `frame-ancestors ${await frameAncestorsFor(request)}`,
  );
  return res;
}

export const config = {
  matcher: ["/r/:path*"],
};
