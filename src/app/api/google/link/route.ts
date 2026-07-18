export const dynamic = "force-dynamic";

import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { getSession, getJwtSecret } from "@/lib/auth";
import { linkGoogleBusiness } from "@/lib/google-link";

// Rattache l'établissement Google choisi (écran multi-établissements).
// Récupère le refresh_token dans le cookie signé g_link puis crée le commerce.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ticket = req.cookies.get("g_link")?.value;
  if (!ticket) return NextResponse.json({ error: "no_ticket" }, { status: 400 });

  let email = "";
  let refreshToken = "";
  try {
    const { payload } = await jwtVerify(ticket, getJwtSecret());
    if (payload.purpose !== "g_link") return NextResponse.json({ error: "bad_ticket" }, { status: 400 });
    email = String(payload.email || "").toLowerCase();
    refreshToken = String(payload.refreshToken || "");
  } catch {
    return NextResponse.json({ error: "expired" }, { status: 400 });
  }
  if (email !== session.email.toLowerCase()) return NextResponse.json({ error: "mismatch" }, { status: 403 });
  if (!refreshToken) return NextResponse.json({ error: "no_token" }, { status: 400 });

  let body: { locationPath?: string; title?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const locationPath = String(body.locationPath || "");
  const title = String(body.title || "Mon établissement");
  // Format attendu : "accounts/X/locations/Y".
  if (!/^accounts\/[^/]+\/locations\/[^/]+$/.test(locationPath)) {
    return NextResponse.json({ error: "bad_location" }, { status: 400 });
  }

  const result = await linkGoogleBusiness({ email, locationPath, title, refreshToken });
  if (!result.ok) return NextResponse.json({ error: result.message }, { status: 403 });

  const res = NextResponse.json({ ok: true, businessId: result.businessId, duplicate: result.duplicate });
  // Le ticket a servi : on le retire.
  res.cookies.set("g_link", "", { httpOnly: true, secure: true, sameSite: "lax", maxAge: 0, path: "/" });
  return res;
}
