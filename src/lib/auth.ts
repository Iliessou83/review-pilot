import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

// Hardcoded admin accounts — acceptable for a private mono-tenant system.
// Hashes are bcrypt cost 10. Rotate passwords via bcrypt CLI if compromised.
// To add a user: bcrypt.hashSync("password", 10) and add the entry here.
const USERS: Record<string, string> = {
  "admin@caela.fr": "$2a$10$v6zJcS5w3rlau1U.xk/HtOTAFL8K4XLMa.KhktpT2TFdF5dDp5jRG",
  "esperenza@caela.fr": "$2a$10$qlUiW288a9CuOIpkdsJ/ou.2GX8ZmRbk1hcETNYU.kJidTGlWkTkC",
  "admin@reviewpilot-demo.fr": "$2a$10$CRq.ez.gg2.4UarM7qX7MO/ePD.WuNd3OC77C2p0u7VeYvIIrPfX.",
};

// Les comptes ci-dessus sont les SUPER-ADMIN (mode agence : voient tous les
// commerces). Tout autre email connecté (via SSO Hub) est un CLIENT : il ne
// voit que SON commerce (filtré par owner_email). Voir src/lib/scope.ts.
export const ADMIN_EMAILS = Object.keys(USERS);

export function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET environment variable is not set");
  return new TextEncoder().encode(secret);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  const bcrypt = await import("bcryptjs");
  return bcrypt.compare(plain, hash);
}

export async function validateCredentials(email: string, password: string): Promise<boolean> {
  const hash = USERS[email.toLowerCase()];
  if (!hash) return false;
  return verifyPassword(password, hash);
}

// Authentifie un email+mot de passe. Vérifie d'abord les super-admins en dur
// (ADMIN_EMAILS), puis la table `users` (comptes self-serve). Renvoie l'email
// normalisé + le rôle à mettre dans la session, ou null si invalide.
export async function authenticate(
  email: string,
  password: string
): Promise<{ email: string; role: "admin" | "client" } | null> {
  const normalized = email.trim().toLowerCase();

  // 1) Super-admin en dur (mode agence).
  const adminHash = USERS[normalized];
  if (adminHash) {
    return (await verifyPassword(password, adminHash)) ? { email: normalized, role: "admin" } : null;
  }

  // 2) Compte client self-serve.
  const { db } = await import("@/lib/db");
  const { users } = await import("@/db/schema");
  const { eq } = await import("drizzle-orm");
  const [user] = await db.select().from(users).where(eq(users.email, normalized)).limit(1);
  if (!user) return null;
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return null;
  return { email: normalized, role: user.role === "admin" ? "admin" : "client" };
}

export async function createToken(email: string, role: "admin" | "client" = "admin"): Promise<string> {
  return new SignJWT({ email, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(getJwtSecret());
}

export async function verifyToken(token: string): Promise<{ email: string; role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    // Validate required fields
    if (typeof payload.email !== "string" || typeof payload.role !== "string") return null;
    return { email: payload.email, role: payload.role };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<{ email: string; role: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("rp_session")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireAuth(request: NextRequest): Promise<{ email: string; role: string } | null> {
  const token = request.cookies.get("rp_session")?.value;
  if (!token) return null;
  return verifyToken(token);
}
