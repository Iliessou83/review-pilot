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
