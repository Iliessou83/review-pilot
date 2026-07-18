import "server-only";
import { db } from "@/lib/db";
import { businesses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { ADMIN_EMAILS } from "@/lib/auth";

// Règle unique de cloisonnement multi-locataire.
// - SUPER-ADMIN (Ilies, comptes en dur) : voit TOUS les commerces (mode agence).
// - CLIENT (arrivé par le SSO Hub) : ne voit QUE ses commerces (owner_email).
// Chaque écran/route appelle getScope() puis ownedBusinessIds() et filtre.

export interface Scope {
  email: string;
  isAdmin: boolean;
}

export async function getScope(): Promise<Scope | null> {
  const s = await getSession();
  if (!s) return null;
  const email = s.email.toLowerCase();
  const isAdmin = s.role === "admin" || ADMIN_EMAILS.includes(email);
  return { email, isAdmin };
}

// Renvoie la liste des IDs de commerces visibles.
// - "all" = aucun filtre (super-admin).
// - number[] = uniquement ces commerces (client ; [] = aucun commerce).
export async function ownedBusinessIds(scope: Scope): Promise<"all" | number[]> {
  if (scope.isAdmin) return "all";
  const rows = await db
    .select({ id: businesses.id })
    .from(businesses)
    .where(eq(businesses.ownerEmail, scope.email));
  return rows.map((r) => r.id);
}
