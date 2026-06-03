import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const USERS: Record<string, string> = {
  "admin@caela.fr": "$2a$10$Hlqh2ODkxUVWDP8fVYYg7eZTJ9pFLRSCbMzzfwOAS0R/Wg1k.ZoDO",
  "esperenza@caela.fr": "$2a$10$qlUiW288a9CuOIpkdsJ/ou.2GX8ZmRbk1hcETNYU.kJidTGlWkTkC",
};

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "reviewpilot-secret-key-min-32-chars-2026"
);

export async function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  const bcrypt = await import("bcryptjs");
  return bcrypt.compare(plain, hash);
}

export async function validateCredentials(
  email: string,
  password: string
): Promise<boolean> {
  const hash = USERS[email];
  if (!hash) return false;
  return verifyPassword(password, hash);
}

export async function createToken(email: string): Promise<string> {
  return new SignJWT({ email, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(
  token: string
): Promise<{ email: string; role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { email: string; role: string };
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
