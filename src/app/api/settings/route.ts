export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { businesses } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const session = await requireAuth(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const allBusinesses = await db.select().from(businesses);

  return NextResponse.json({
    businesses: allBusinesses.map(b => ({
      id: b.id,
      name: b.name,
      businessType: b.businessType || "other",
      autoReply5Star: b.autoReply5Star,
      autoReplyNegative: b.autoReplyNegative,
      compensationEnabled: b.compensationEnabled,
      compensationText: b.compensationText || "",
      ownerEmail: b.ownerEmail,
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
    ownerEmail?: string;
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

  const update: Partial<typeof businesses.$inferInsert> = {};
  if (fields.businessType !== undefined) update.businessType = fields.businessType;
  if (fields.autoReply5Star !== undefined) update.autoReply5Star = fields.autoReply5Star;
  if (fields.autoReplyNegative !== undefined) update.autoReplyNegative = fields.autoReplyNegative;
  if (fields.compensationEnabled !== undefined) update.compensationEnabled = fields.compensationEnabled;
  if (fields.compensationText !== undefined) update.compensationText = fields.compensationText;
  if (fields.ownerEmail !== undefined) update.ownerEmail = fields.ownerEmail;

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
