export const dynamic = "force-dynamic";

import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { refreshAccessToken, listAllLocations } from "@/lib/google-oauth";
import { readGoogleConnectionTicket } from "@/lib/google-connection-ticket";

// Liste les établissements Google du commerçant pour l'écran de choix.
// Le cookie g_link ne contient qu'un secret opaque ; le refresh_token chiffré
// reste dans le ticket serveur éphémère créé par le callback.
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ticket = req.cookies.get("g_link")?.value;
  if (!ticket) return NextResponse.json({ error: "no_ticket" }, { status: 400 });

  const stored = await readGoogleConnectionTicket(ticket, session.email);
  if (!stored) return NextResponse.json({ error: "expired" }, { status: 400 });

  try {
    const access = await refreshAccessToken(stored.refreshToken);
    const locations = await listAllLocations(access);
    return NextResponse.json({ locations });
  } catch {
    return NextResponse.json({ error: "google_api" }, { status: 502 });
  }
}
