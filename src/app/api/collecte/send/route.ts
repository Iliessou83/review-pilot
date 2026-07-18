export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contacts, reviewRequests, businesses } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { scopeFrom, ownsBusiness } from "@/lib/scope";
import { and, eq, inArray } from "drizzle-orm";
import { smsConfigured, sendSms } from "@/lib/sms";
import { newToken, buildReviewSms, resolveReviewLink } from "@/lib/collecte";

// Envoie une demande d'avis par SMS aux contacts sélectionnés.
export async function POST(request: NextRequest) {
  const session = await requireAuth(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { businessId?: number; contactIds?: number[]; channel?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }
  const businessId = Number(body.businessId);
  const ids = Array.isArray(body.contactIds) ? body.contactIds.map(Number).filter((n) => n > 0) : [];
  const channel = body.channel === "whatsapp" ? "whatsapp" : "sms";

  if (!businessId || isNaN(businessId)) return NextResponse.json({ error: "businessId requis" }, { status: 400 });
  if (!(await ownsBusiness(scopeFrom(session), businessId))) {
    return NextResponse.json({ error: "Établissement introuvable" }, { status: 404 });
  }
  if (ids.length === 0) return NextResponse.json({ error: "Aucun contact sélectionné" }, { status: 400 });

  // WhatsApp arrivera plus tard (validation Meta nécessaire, même logique).
  if (channel === "whatsapp") {
    return NextResponse.json({ error: "whatsapp_soon" }, { status: 400 });
  }
  if (!smsConfigured()) {
    return NextResponse.json({ error: "sms_not_configured" }, { status: 400 });
  }

  const [biz] = await db
    .select({ id: businesses.id, name: businesses.name, reviewLink: businesses.reviewLink })
    .from(businesses)
    .where(eq(businesses.id, businessId))
    .limit(1);
  if (!biz) return NextResponse.json({ error: "Établissement introuvable" }, { status: 404 });

  const link = await resolveReviewLink(biz);
  if (!link) return NextResponse.json({ error: "no_review_link" }, { status: 400 });

  const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;

  // Contacts du commerce, non désinscrits, dans la sélection.
  const targets = await db
    .select()
    .from(contacts)
    .where(and(eq(contacts.businessId, businessId), inArray(contacts.id, ids), eq(contacts.optedOut, false)));

  let sent = 0;
  let failed = 0;
  for (const c of targets) {
    const token = newToken();
    const [rr] = await db
      .insert(reviewRequests)
      .values({ businessId, contactId: c.id, channel: "sms", token, status: "queued" })
      .returning({ id: reviewRequests.id });

    const message = buildReviewSms({ name: c.name, businessName: biz.name, link: `${appUrl}/g/${token}` });
    const res = await sendSms(c.phone, message);

    if (res.ok) {
      sent++;
      await db
        .update(reviewRequests)
        .set({ status: "sent", providerMessageId: res.id, sentAt: new Date() })
        .where(eq(reviewRequests.id, rr.id));
      await db.update(contacts).set({ lastRequestedAt: new Date() }).where(eq(contacts.id, c.id));
    } else {
      failed++;
      await db
        .update(reviewRequests)
        .set({ status: "failed", error: res.error })
        .where(eq(reviewRequests.id, rr.id));
    }
  }

  const skippedOptedOut = ids.length - targets.length;
  return NextResponse.json({ sent, failed, skippedOptedOut });
}
