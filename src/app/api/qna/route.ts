export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { qnaStrategies, businesses, type QnaItem } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { scopeFrom, ownsBusiness } from "@/lib/scope";
import { eq } from "drizzle-orm";
import { generateQnaSuggestions } from "@/lib/claude";

export async function GET(request: NextRequest) {
  const session = await requireAuth(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const businessId = Number(request.nextUrl.searchParams.get("businessId"));
  if (!businessId) return NextResponse.json({ error: "businessId requis" }, { status: 400 });
  if (!(await ownsBusiness(scopeFrom(session), businessId))) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const [row] = await db.select().from(qnaStrategies).where(eq(qnaStrategies.businessId, businessId)).limit(1);
  return NextResponse.json(row ?? { businessId, items: [] });
}

// Génère une première proposition avec Claude (si aucune stratégie n'existe
// encore) OU sauvegarde une liste d'items relus/modifiés par l'équipe.
export async function POST(request: NextRequest) {
  const session = await requireAuth(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { businessId?: number; generate?: boolean; items?: QnaItem[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  if (!body.businessId) return NextResponse.json({ error: "businessId requis" }, { status: 400 });
  if (!(await ownsBusiness(scopeFrom(session), body.businessId))) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const [business] = await db.select().from(businesses).where(eq(businesses.id, body.businessId)).limit(1);
  if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 });

  let items: QnaItem[];
  if (body.generate) {
    try {
      const suggestions = await generateQnaSuggestions(business.name, business.businessType || "commerce", {
        productFacts: business.productFacts,
        compensationEnabled: business.compensationEnabled,
        compensationText: business.compensationText,
      });
      items = suggestions.map((s) => ({ question: s.question, reponse: s.reponse, postedOnGoogle: false }));
    } catch (err) {
      console.error("QnA generation error:", err);
      return NextResponse.json({ error: "Génération impossible, réessayez." }, { status: 502 });
    }
  } else if (Array.isArray(body.items)) {
    items = body.items;
  } else {
    return NextResponse.json({ error: "generate=true ou items[] requis" }, { status: 400 });
  }

  const [existing] = await db.select().from(qnaStrategies).where(eq(qnaStrategies.businessId, body.businessId)).limit(1);
  const [saved] = existing
    ? await db
        .update(qnaStrategies)
        .set({ items, updatedAt: new Date() })
        .where(eq(qnaStrategies.businessId, body.businessId))
        .returning()
    : await db.insert(qnaStrategies).values({ businessId: body.businessId, items }).returning();

  return NextResponse.json(saved);
}
