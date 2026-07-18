export const dynamic = "force-dynamic";

import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { getSession, getJwtSecret } from "@/lib/auth";
import { refreshAccessToken, listAllLocations } from "@/lib/google-oauth";

// Liste les établissements Google du commerçant pour l'écran de choix.
// Utilise le refresh_token stocké dans le cookie signé g_link (posé par le callback).
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ticket = req.cookies.get("g_link")?.value;
  if (!ticket) return NextResponse.json({ error: "no_ticket" }, { status: 400 });

  let refreshToken = "";
  try {
    const { payload } = await jwtVerify(ticket, getJwtSecret());
    if (payload.purpose !== "g_link") return NextResponse.json({ error: "bad_ticket" }, { status: 400 });
    if (String(payload.email || "").toLowerCase() !== session.email.toLowerCase()) {
      return NextResponse.json({ error: "mismatch" }, { status: 403 });
    }
    refreshToken = String(payload.refreshToken || "");
  } catch {
    return NextResponse.json({ error: "expired" }, { status: 400 });
  }
  if (!refreshToken) return NextResponse.json({ error: "no_token" }, { status: 400 });

  try {
    const access = await refreshAccessToken(refreshToken);
    const locations = await listAllLocations(access);
    return NextResponse.json({ locations });
  } catch {
    return NextResponse.json({ error: "google_api" }, { status: 502 });
  }
}
