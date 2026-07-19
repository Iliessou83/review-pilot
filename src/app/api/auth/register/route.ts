export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createToken, ADMIN_EMAILS } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { pushHubEvent } from "@/lib/hubEvent";

// Inscription autonome (self-serve). Crée un compte client (email + mot de passe),
// ouvre une session role "client" (cloisonné à ses commerces). Ne touche pas aux
// super-admins en dur (ADMIN_EMAILS), qui restent réservés.
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (!rateLimit(`register:${ip}`, 5, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Trop de tentatives. Réessayez dans 15 minutes." }, { status: 429 });
  }

  let body: { email?: string; password?: string; name?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const name = body.name ? String(body.name).slice(0, 120) : null;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Le mot de passe doit faire au moins 8 caractères." }, { status: 400 });
  }
  // Un email réservé aux super-admins ne peut pas être pris par un self-serve.
  if (ADMIN_EMAILS.includes(email)) {
    return NextResponse.json({ error: "Cet email est déjà utilisé." }, { status: 409 });
  }

  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing) {
    return NextResponse.json({ error: "Un compte existe déjà avec cet email. Connectez-vous." }, { status: 409 });
  }

  const bcrypt = await import("bcryptjs");
  const passwordHash = await bcrypt.hash(password, 12);

  try {
    await db.insert(users).values({ email, passwordHash, name, role: "client" });
  } catch {
    // Course entre deux inscriptions simultanées (contrainte unique).
    return NextResponse.json({ error: "Un compte existe déjà avec cet email." }, { status: 409 });
  }

  // Fédération au cerveau Caela : le compte apparaît dans le Hub dès l'inscription
  // (provisionné par email côté Hub si inconnu). Non bloquant.
  await pushHubEvent({
    ownerEmail: email,
    kind: "contact",
    title: `Nouveau compte Réputation${name ? ` — ${name}` : ""}`,
    businessName: name,
    metadata: { event: "signup" },
  }).catch(() => {});

  const token = await createToken(email, "client");
  const res = NextResponse.json({ success: true });
  res.cookies.set("rp_session", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  });
  return res;
}
