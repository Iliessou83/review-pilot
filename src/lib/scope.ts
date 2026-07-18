import "server-only";
import { db } from "@/lib/db";
import { businesses } from "@/db/schema";
import { and, eq } from "drizzle-orm";
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

// Construit un périmètre à partir d'une session déjà lue (email + role).
// Utilisé par les routes API qui ont déjà appelé requireAuth(request).
export function scopeFrom(session: { email: string; role: string }): Scope {
  const email = session.email.toLowerCase();
  const isAdmin = session.role === "admin" || ADMIN_EMAILS.includes(email);
  return { email, isAdmin };
}

// Périmètre pour les composants serveur (lit le cookie rp_session).
export async function getScope(): Promise<Scope | null> {
  const s = await getSession();
  if (!s) return null;
  return scopeFrom(s);
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

// Vérifie qu'un commerce précis appartient au périmètre.
// Toujours vrai pour un super-admin. Pour un client, vrai seulement si owner_email correspond.
export async function ownsBusiness(scope: Scope, businessId: number): Promise<boolean> {
  if (scope.isAdmin) return true;
  const [row] = await db
    .select({ id: businesses.id })
    .from(businesses)
    .where(and(eq(businesses.id, businessId), eq(businesses.ownerEmail, scope.email)))
    .limit(1);
  return !!row;
}
