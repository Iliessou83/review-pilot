export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { businesses, type ProductFact } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { scopeFrom, ownedBusinessIds, ownsBusiness } from "@/lib/scope";
import { eq, inArray } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const session = await requireAuth(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Cloisonnement : un client ne configure que ses commerces.
  const scope = scopeFrom(session);
  const ids = await ownedBusinessIds(scope);
  if (ids !== "all" && ids.length === 0) return NextResponse.json({ businesses: [] });

  const allBusinesses =
    ids === "all"
      ? await db.select().from(businesses)
      : await db.select().from(businesses).where(inArray(businesses.id, ids));

  return NextResponse.json({
    businesses: allBusinesses.map(b => ({
      id: b.id,
      name: b.name,
      platform: b.platform,
      googleConnected: b.platform === "google" && Boolean(b.platformToken),
      businessType: b.businessType || "other",
      autoReply5Star: b.autoReply5Star,
      autoReplyNegative: b.autoReplyNegative,
      compensationEnabled: b.compensationEnabled,
      compensationText: b.compensationText || "",
      productFacts: b.productFacts || [],
      escalationKeywords: b.escalationKeywords || [],
      ownerEmail: b.ownerEmail,
      reviewLink: b.reviewLink || "",
      signatureName: b.signatureName || "",
      regulatedSector: b.regulatedSector,
      brandTone: b.brandTone,
      tutoiement: b.tutoiement,
      ownerPhone: b.ownerPhone || "",
    })),
  });
}

export async function PUT(request: NextRequest) {
  const session = await requireAuth(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: {
    businessId: number;
    businessType?: string;
    autoReply5Star?: boolean;
    autoReplyNegative?: boolean;
    compensationEnabled?: boolean;
    compensationText?: string;
    productFacts?: ProductFact[];
    escalationKeywords?: string[];
    ownerEmail?: string;
    reviewLink?: string;
    signatureName?: string;
    regulatedSector?: boolean;
    brandTone?: string;
    tutoiement?: boolean;
    ownerPhone?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { businessId, ...fields } = body;
  if (!businessId || isNaN(businessId)) {
    return NextResponse.json({ error: "businessId requis" }, { status: 400 });
  }

  // Cloisonnement : on ne modifie que ses propres commerces.
  const scope = scopeFrom(session);
  if (!(await ownsBusiness(scope, businessId))) {
    return NextResponse.json({ error: "Établissement introuvable" }, { status: 404 });
  }

  // Changer le propriétaire (owner_email) d'un commerce est réservé au super-admin :
  // un client qui pourrait se le réattribuer contournerait tout le cloisonnement
  // multi-tenant (accès à d'autres commerces, quotas, facturation...).
  if (fields.ownerEmail !== undefined && !scope.isAdmin) {
    return NextResponse.json({ error: "Modification réservée à l'administrateur" }, { status: 403 });
  }

  // Profession réglementée : impossible d'activer le geste commercial (risque
  // d'incitation à l'avis positif chez un professionnel de santé/droit) — voir
  // manque #4 de l'audit "Avant Commercialisation" 2026-08-27. On lit l'état
  // actuel plutôt que fields.regulatedSector, pour bloquer aussi le cas où les
  // deux champs sont modifiés dans le même appel.
  let isRegulated = false;
  {
    const [current] = await db.select({ regulatedSector: businesses.regulatedSector }).from(businesses).where(eq(businesses.id, businessId)).limit(1);
    isRegulated = fields.regulatedSector ?? current?.regulatedSector ?? false;
  }
  if (fields.compensationEnabled === true && isRegulated) {
    return NextResponse.json({ error: "Le geste commercial est désactivé pour les établissements en profession réglementée." }, { status: 403 });
  }

  const update: Partial<typeof businesses.$inferInsert> = {};
  if (fields.businessType !== undefined) update.businessType = fields.businessType;
  if (fields.autoReply5Star !== undefined) update.autoReply5Star = fields.autoReply5Star;
  if (fields.autoReplyNegative !== undefined) update.autoReplyNegative = fields.autoReplyNegative;
  if (fields.compensationEnabled !== undefined) update.compensationEnabled = fields.compensationEnabled;
  if (fields.compensationText !== undefined) update.compensationText = fields.compensationText;
  if (fields.productFacts !== undefined) update.productFacts = fields.productFacts;
  if (fields.escalationKeywords !== undefined) update.escalationKeywords = fields.escalationKeywords;
  if (fields.ownerEmail !== undefined) update.ownerEmail = fields.ownerEmail;
  if (fields.reviewLink !== undefined) update.reviewLink = fields.reviewLink;
  if (fields.signatureName !== undefined) update.signatureName = fields.signatureName.trim() || null;
  if (fields.regulatedSector !== undefined) update.regulatedSector = fields.regulatedSector;
  if (fields.brandTone !== undefined && ["chaleureux", "pro", "premium"].includes(fields.brandTone)) {
    update.brandTone = fields.brandTone as "chaleureux" | "pro" | "premium";
  }
  if (fields.tutoiement !== undefined) update.tutoiement = fields.tutoiement;
  if (fields.ownerPhone !== undefined) update.ownerPhone = fields.ownerPhone.trim() || null;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Aucun champ à mettre à jour" }, { status: 400 });
  }

  const [updated] = await db
    .update(businesses)
    .set(update)
    .where(eq(businesses.id, businessId))
    .returning();

  if (!updated) return NextResponse.json({ error: "Établissement introuvable" }, { status: 404 });

  return NextResponse.json({ ok: true, business: updated });
}
