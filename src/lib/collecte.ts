import "server-only";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { contacts, wheelConfigs, wheelSpins, businesses } from "@/db/schema";
import { and, eq, inArray, isNotNull } from "drizzle-orm";
import { normalizePhoneFR } from "@/lib/sms";

// Jeton court pour le lien tracké /g/[token].
export function newToken(): string {
  return randomBytes(6).toString("base64url"); // ~8 caractères
}

// Lien "laisser un avis" du commerce : champ dédié, sinon on récupère celui
// déjà saisi sur la Roue (wheelConfigs.reviewUrl).
export async function resolveReviewLink(business: {
  id: number;
  reviewLink: string | null;
}): Promise<string | null> {
  if (business.reviewLink && business.reviewLink.trim()) return business.reviewLink.trim();
  const [wheel] = await db
    .select({ url: wheelConfigs.reviewUrl })
    .from(wheelConfigs)
    .where(eq(wheelConfigs.businessId, business.id))
    .limit(1);
  return wheel?.url?.trim() || null;
}

// Message SMS. Court pour tenir sur 1 segment (coût). Mention d'opt-out incluse.
export function buildReviewSms(params: { name?: string | null; businessName: string; link: string }): string {
  const hello = params.name ? `Bonjour ${params.name},` : "Bonjour,";
  return `${hello} merci de votre visite chez ${params.businessName} ! Votre avis en 30s nous aide beaucoup : ${params.link} (STOP: répondez STOP)`;
}

// Importe les numéros captés par la Roue de ce commerce dans les contacts.
// Dédoublonne par (business_id, phone) grâce à l'index unique. Renvoie le bilan.
export async function importWheelContacts(businessId: number): Promise<{ imported: number; skipped: number }> {
  // Toutes les roues de ce commerce.
  const wheels = await db
    .select({ id: wheelConfigs.id })
    .from(wheelConfigs)
    .where(eq(wheelConfigs.businessId, businessId));
  if (wheels.length === 0) return { imported: 0, skipped: 0 };

  const spins = await db
    .select({ phone: wheelSpins.phone })
    .from(wheelSpins)
    .where(
      and(
        inArray(wheelSpins.wheelConfigId, wheels.map((w) => w.id)),
        isNotNull(wheelSpins.phone)
      )
    );

  // Normalise + dédoublonne côté code avant insertion.
  const seen = new Set<string>();
  const rows: { businessId: number; phone: string; source: "wheel" }[] = [];
  let skipped = 0;
  for (const s of spins) {
    const phone = normalizePhoneFR(s.phone || "");
    if (!phone || seen.has(phone)) {
      skipped++;
      continue;
    }
    seen.add(phone);
    rows.push({ businessId, phone, source: "wheel" });
  }

  let imported = 0;
  for (let i = 0; i < rows.length; i += 100) {
    const batch = rows.slice(i, i + 100);
    const inserted = await db
      .insert(contacts)
      .values(batch)
      .onConflictDoNothing({ target: [contacts.businessId, contacts.phone] })
      .returning({ id: contacts.id });
    imported += inserted.length;
    skipped += batch.length - inserted.length;
  }
  return { imported, skipped };
}

// Petit utilitaire : le commerce (avec reviewLink) à partir de son id.
export async function getBusinessLite(businessId: number) {
  const [b] = await db
    .select({ id: businesses.id, name: businesses.name, reviewLink: businesses.reviewLink })
    .from(businesses)
    .where(eq(businesses.id, businessId))
    .limit(1);
  return b || null;
}
