export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { and, eq, isNull, lt, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { reviews, pendingResponses, businesses, reviewActivityEvents } from "@/db/schema";
import { getJwtSecret } from "@/lib/auth";
import { publishReply } from "@/lib/platform-reply";

type QuickPayload = { pendingId: number; choice: number };

async function verifyQuickToken(token: string): Promise<QuickPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    const pendingId = typeof payload.pendingId === "number" ? payload.pendingId : null;
    const choice = typeof payload.choice === "number" ? payload.choice : null;
    if (pendingId === null || choice === null || choice < 0 || choice > 2) return null;
    return { pendingId, choice };
  } catch {
    return null;
  }
}

/**
 * GET reste compatible avec les anciens emails, mais ne publie plus rien.
 * Une lecture de lien email (prévisualisation, antivirus, navigateur) ne doit
 * jamais déclencher une action externe irréversible.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("t");
  const destination = new URL("/quick-reply", request.url);
  if (token) destination.searchParams.set("t", token);
  return NextResponse.redirect(destination);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const token = typeof body.token === "string" ? body.token : "";
  const decoded = await verifyQuickToken(token);
  if (!decoded) return NextResponse.json({ error: "Lien invalide ou expiré" }, { status: 400 });

  const [pending] = await db
    .select()
    .from(pendingResponses)
    .where(eq(pendingResponses.id, decoded.pendingId))
    .limit(1);

  if (!pending) return NextResponse.json({ error: "Réponse introuvable" }, { status: 404 });
  if (pending.status === "sent") return NextResponse.json({ ok: true, alreadySent: true });
  const processingTimeout = new Date(Date.now() - 10 * 60 * 1000);
  if (pending.status === "processing" && pending.processingAt && pending.processingAt > processingTimeout) {
    return NextResponse.json({ error: "Cette réponse est déjà en cours de publication" }, { status: 409 });
  }

  const suggestions = pending.suggestions as string[];
  const responseText = suggestions[decoded.choice];
  if (!responseText) return NextResponse.json({ error: "Suggestion invalide" }, { status: 400 });

  // Réclamation atomique : deux clics simultanés ne doivent pas publier deux
  // fois la même réponse sur Google/Trustpilot.
  const claimCondition = pending.status === "pending"
    ? and(eq(pendingResponses.id, decoded.pendingId), eq(pendingResponses.status, "pending"))
    : and(
        eq(pendingResponses.id, decoded.pendingId),
        eq(pendingResponses.status, "processing"),
        or(isNull(pendingResponses.processingAt), lt(pendingResponses.processingAt, processingTimeout)),
      );
  const [claimed] = await db
    .update(pendingResponses)
    .set({ status: "processing", processingAt: new Date(), chosenSuggestionIndex: decoded.choice })
    .where(claimCondition)
    .returning({ id: pendingResponses.id });
  if (!claimed) return NextResponse.json({ ok: true, alreadySent: true });

  try {
    const [reviewRow] = await db
      .select()
      .from(reviews)
      .where(eq(reviews.id, pending.reviewId))
      .limit(1);
    if (!reviewRow) throw new Error("Avis introuvable");

    if (reviewRow.responded) {
      await db.update(pendingResponses).set({ status: "sent", processingAt: null }).where(eq(pendingResponses.id, pending.id));
      return NextResponse.json({ ok: true, alreadySent: true });
    }

    const [business] = await db
      .select()
      .from(businesses)
      .where(eq(businesses.id, reviewRow.businessId))
      .limit(1);
    if (!business) throw new Error("Établissement introuvable");

    await publishReply(reviewRow, business, responseText);
    const respondedAt = new Date();
    await db
      .update(reviews)
      .set({ responded: true, responseText, respondedAt })
      .where(eq(reviews.id, reviewRow.id));
    await db.insert(reviewActivityEvents).values({
      businessId: business.id,
      platform: reviewRow.platform,
      eventType: "reply_published",
      handlingMode: business.autoReplyNegative ? "caela_approved" : "merchant_approved",
      latencySeconds: Math.max(0, Math.round((respondedAt.getTime() - reviewRow.publishedAt.getTime()) / 1000)),
      occurredAt: respondedAt,
    });
    await db
      .update(pendingResponses)
      .set({ status: "sent", processingAt: null, chosenSuggestionIndex: decoded.choice })
      .where(eq(pendingResponses.id, pending.id));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[quick-reply] publication plateforme échouée:", err);
    await db
      .update(pendingResponses)
      .set({ status: "pending", processingAt: null })
      .where(eq(pendingResponses.id, pending.id));
    return NextResponse.json({ error: "La publication a échoué. Réessayez depuis le lien." }, { status: 502 });
  }
}

export { verifyQuickToken };
