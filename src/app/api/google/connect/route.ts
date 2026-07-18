export const dynamic = "force-dynamic";

import { NextResponse, type NextRequest } from "next/server";
import { SignJWT } from "jose";
import { getSession, getJwtSecret } from "@/lib/auth";
import { googleConfigured, buildAuthUrl } from "@/lib/google-oauth";

// Démarre la connexion Google 1 clic. Envoie le commerçant vers l'écran de
// consentement Google. Le `state` signé porte son email et bloque le CSRF.
export async function GET(req: NextRequest) {
  const { origin } = new URL(req.url);

  const session = await getSession();
  if (!session) return NextResponse.redirect(`${origin}/`);

  if (!googleConfigured()) {
    return NextResponse.redirect(`${origin}/businesses?google=unconfigured`);
  }

  const state = await new SignJWT({ email: session.email.toLowerCase(), purpose: "g_connect" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(getJwtSecret());

  return NextResponse.redirect(buildAuthUrl(origin, state));
}
