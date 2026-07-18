export const dynamic = "force-dynamic";

import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { createToken } from "@/lib/auth";

// Récepteur SSO Caela pour Reputation (module "avis"). Vérifie le ticket signé
// par le Hub, ouvre une session CLIENT (ne voit que son commerce). Le
// cloisonnement est appliqué par src/lib/scope.ts sur chaque écran.
// Secret partagé = CAELA_SSO_SECRET.
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const ticket = searchParams.get("ticket");
  if (!ticket) return NextResponse.redirect(`${origin}/?error=sso`);

  const secret = process.env.CAELA_SSO_SECRET;
  if (!secret) return NextResponse.redirect(`${origin}/?error=sso_config`);

  let email = "";
  try {
    const { payload } = await jwtVerify(ticket, new TextEncoder().encode(secret), {
      issuer: "caela-hub",
      audience: "avis",
    });
    email = String(payload.email ?? "").trim().toLowerCase();
  } catch {
    return NextResponse.redirect(`${origin}/?error=sso_invalid`);
  }
  if (!email) return NextResponse.redirect(`${origin}/?error=sso_email`);

  const token = await createToken(email, "client");
  const res = NextResponse.redirect(`${origin}/dashboard`);
  res.cookies.set("rp_session", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  });
  return res;
}
