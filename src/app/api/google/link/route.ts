export const dynamic = "force-dynamic";

import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { linkGoogleBusiness } from "@/lib/google-link";
import { deleteGoogleConnectionTicket, readGoogleConnectionTicket } from "@/lib/google-connection-ticket";
import { listAllLocations, refreshAccessToken } from "@/lib/google-oauth";

// Rattache l'établissement Google choisi (écran multi-établissements).
// Récupère le refresh_token via le ticket serveur opaque référencé par g_link.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ticket = req.cookies.get("g_link")?.value;
  if (!ticket) return NextResponse.json({ error: "no_ticket" }, { status: 400 });

  const email = session.email.toLowerCase();
  const stored = await readGoogleConnectionTicket(ticket, email);
  if (!stored) return NextResponse.json({ error: "expired" }, { status: 400 });

  let body: { locationPath?: string; title?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const locationPath = String(body.locationPath || "");
  // Format attendu : "accounts/X/locations/Y".
  if (!/^accounts\/[^/]+\/locations\/[^/]+$/.test(locationPath)) {
    return NextResponse.json({ error: "bad_location" }, { status: 400 });
  }

  // Ne jamais faire confiance au chemin ou au nom envoyés par le navigateur :
  // la fiche doit réellement appartenir à la liste autorisée par ce jeton OAuth.
  let authorizedLocation;
  try {
    const access = await refreshAccessToken(stored.refreshToken);
    const locations = await listAllLocations(access);
    authorizedLocation = locations.find((location) => location.path === locationPath);
  } catch {
    return NextResponse.json({ error: "google_api" }, { status: 502 });
  }
  if (!authorizedLocation) return NextResponse.json({ error: "unauthorized_location" }, { status: 403 });

  const result = await linkGoogleBusiness({
    email,
    locationPath,
    title: authorizedLocation.title,
    refreshToken: stored.refreshToken,
    accessTermsVersion: stored.termsVersion,
  });
  if (!result.ok) return NextResponse.json({ error: result.message }, { status: 403 });

  await deleteGoogleConnectionTicket(stored.id);

  const res = NextResponse.json({ ok: true, businessId: result.businessId, duplicate: result.duplicate });
  // Le ticket a servi : on le retire.
  res.cookies.set("g_link", "", { httpOnly: true, secure: true, sameSite: "lax", maxAge: 0, path: "/" });
  return res;
}
