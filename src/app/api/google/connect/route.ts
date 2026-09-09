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

  // Un ancien lien direct ne contourne jamais l'attestation préalable.
  return NextResponse.redirect(`${origin}/businesses/google-consent`);
}

export async function POST(req: NextRequest) {
  const { origin } = new URL(req.url);

  const session = await getSession();
  if (!session) return NextResponse.redirect(`${origin}/`);

  const form = await req.formData().catch(() => null);
  const ownerOrManagerConfirmed = form?.get("ownerOrManagerConfirmed") === "yes";
  const oauthAccessGranted = form?.get("oauthAccessGranted") === "yes";
  if (!ownerOrManagerConfirmed || !oauthAccessGranted) {
    return NextResponse.redirect(`${origin}/businesses/google-consent?error=consent`);
  }

  if (!googleConfigured()) {
    return NextResponse.redirect(`${origin}/businesses?google=unconfigured`);
  }

  const state = await new SignJWT({
    email: session.email.toLowerCase(),
    purpose: "g_connect",
    ownerOrManagerConfirmed: true,
    oauthAccessGranted: true,
    termsVersion: "google-access-2026-09-v1",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(getJwtSecret());

  return NextResponse.redirect(buildAuthUrl(origin, state));
}
