import "server-only";
import { db } from "@/lib/db";
import { businesses } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { checkBusinessQuota } from "@/lib/plan-limits";
import { ADMIN_EMAILS } from "@/lib/auth";
import { pushHubEvent } from "@/lib/hubEvent";

export type LinkResult =
  | { ok: true; businessId: number; duplicate: boolean }
  | { ok: false; reason: "quota"; message: string };

// Rattache un établissement Google au compte du client (owner_email = son email).
// Idempotent : si le même établissement (platform_id) est déjà lié à cet email,
// on renvoie l'existant sans doublon. Respecte le quota du plan (hors super-admin).
export async function linkGoogleBusiness(params: {
  email: string;
  locationPath: string; // "accounts/X/locations/Y"
  title: string;
  refreshToken: string;
}): Promise<LinkResult> {
  const email = params.email.toLowerCase().trim();

  // Déjà lié ? On ne recrée pas.
  const [existing] = await db
    .select({ id: businesses.id })
    .from(businesses)
    .where(and(eq(businesses.platformId, params.locationPath), eq(businesses.ownerEmail, email)))
    .limit(1);
  if (existing) return { ok: true, businessId: existing.id, duplicate: true };

  // Quota du plan (le super-admin n'est jamais bridé).
  if (!ADMIN_EMAILS.includes(email)) {
    const quota = await checkBusinessQuota(email);
    if (!quota.allowed) {
      const message = quota.planName
        ? `Limite atteinte : le plan ${quota.planName} inclut ${quota.max} établissement(s) (${quota.current} déjà connecté(s)). Passez à un plan supérieur pour en ajouter.`
        : `Aucun abonnement actif trouvé pour cet email. Un seul établissement est autorisé en essai.`;
      return { ok: false, reason: "quota", message };
    }
  }

  const [created] = await db
    .insert(businesses)
    .values({
      name: params.title.slice(0, 255),
      platform: "google",
      platformId: params.locationPath.slice(0, 500),
      platformToken: params.refreshToken.slice(0, 1000),
      ownerEmail: email,
      autoReply5Star: true,
    })
    .returning({ id: businesses.id });

  // Fédération au cerveau Caela : rattache l'établissement au compte (par email).
  await pushHubEvent({
    ownerEmail: email,
    kind: "contact",
    title: `Établissement Google connecté — ${params.title}`,
    businessName: params.title,
    metadata: { event: "google_connect" },
  }).catch(() => {});

  return { ok: true, businessId: created.id, duplicate: false };
}
