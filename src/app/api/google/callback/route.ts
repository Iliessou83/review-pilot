export const dynamic = "force-dynamic";

import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { getSession, getJwtSecret } from "@/lib/auth";
import { exchangeCode, listAllLocations } from "@/lib/google-oauth";
import { linkGoogleBusiness } from "@/lib/google-link";
import { createGoogleConnectionTicket } from "@/lib/google-connection-ticket";

// Retour de Google après consentement. Échange le code, lit les établissements
// de la fiche du commerçant, et rattache automatiquement (1 seul) ou propose un
// choix (plusieurs). Le refresh_token est stocké comme jeton de synchro.
export async function GET(req: NextRequest) {
  const { origin, searchParams } = new URL(req.url);
  const back = (q: string) => NextResponse.redirect(`${origin}/businesses?google=${q}`);

  if (searchParams.get("error")) return back("denied");
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  if (!code || !state) return back("state");

  // Le state signé confirme que la demande vient bien de nous et porte l'email.
  let email = "";
  let termsVersion = "";
  try {
    const { payload } = await jwtVerify(state, getJwtSecret());
    if (payload.purpose !== "g_connect") return back("state");
    if (payload.ownerOrManagerConfirmed !== true || payload.oauthAccessGranted !== true) return back("state");
    email = String(payload.email || "").toLowerCase();
    termsVersion = String(payload.termsVersion || "");
  } catch {
    return back("state");
  }
  if (!email || termsVersion !== "google-access-2026-09-v1") return back("state");

  // Défense : la session en cours doit correspondre à l'email du state.
  const session = await getSession();
  if (!session || session.email.toLowerCase() !== email) {
    return NextResponse.redirect(`${origin}/`);
  }

  // Échange code -> jetons.
  let refreshToken = "";
  let accessToken = "";
  try {
    const tokens = await exchangeCode(origin, code);
    accessToken = tokens.access_token;
    refreshToken = tokens.refresh_token || "";
  } catch {
    return back("api");
  }
  // Sans refresh_token, on ne pourra pas resynchroniser plus tard.
  if (!refreshToken) return back("norefresh");

  // Établissements gérés par ce compte Google.
  let locations;
  try {
    locations = await listAllLocations(accessToken);
  } catch {
    return back("api");
  }
  if (locations.length === 0) return back("nolocation");

  // Un seul établissement : rattachement immédiat (vrai 1 clic).
  if (locations.length === 1) {
    const res = await linkGoogleBusiness({
      email,
      locationPath: locations[0].path,
      title: locations[0].title,
      refreshToken,
      accessTermsVersion: termsVersion,
    });
    if (!res.ok) return back("quota");
    return NextResponse.redirect(`${origin}/dashboard?google=connected`);
  }

  // Plusieurs établissements : le refresh token reste chiffré côté serveur.
  // Le cookie ne contient qu'un secret opaque, aléatoire et valable 15 min.
  const ticket = await createGoogleConnectionTicket({
    actorEmail: email,
    refreshToken,
    termsVersion,
  });

  const redirect = NextResponse.redirect(`${origin}/businesses/connect`);
  redirect.cookies.set("g_link", ticket, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 15,
    path: "/",
  });
  return redirect;
}
