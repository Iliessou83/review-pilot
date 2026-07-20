export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { authenticate, createToken } from "@/lib/auth";
import { rateLimit, dbRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  // 5 tentatives / 15 min par IP — compteur partagé en base (login_attempts),
  // pas en mémoire : sur Vercel chaque instance serverless a sa propre mémoire,
  // un Map ne bloquait donc rien en pratique en prod (voir rate-limit.ts).
  const ip = getClientIp(request);
  let allowed: boolean;
  try {
    allowed = await dbRateLimit(`login:${ip}`, 5, 15 * 60 * 1000);
  } catch (err) {
    // Table login_attempts pas encore créée (migration manuelle non exécutée) ou
    // base indisponible : on ne bloque pas tout le monde, on retombe sur le
    // compteur en mémoire (protection partielle mais mieux que rien) et on log
    // pour qu'Ilies voie qu'il faut lancer la migration.
    console.error("dbRateLimit failed, falling back to in-memory rate limit:", err);
    allowed = rateLimit(`login:${ip}`, 5, 15 * 60 * 1000);
  }
  if (!allowed) {
    return NextResponse.json({ error: "Trop de tentatives. Réessayez dans 15 minutes." }, { status: 429 });
  }

  try {
    let body: { email?: string; password?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { email, password } = body;
    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const auth = await authenticate(email, password);
    if (!auth) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await createToken(auth.email, auth.role);

    const response = NextResponse.json({ success: true });
    response.cookies.set("rp_session", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24h — matches token expiry
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
