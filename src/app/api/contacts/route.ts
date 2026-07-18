export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contacts, reviewRequests } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { scopeFrom, ownsBusiness } from "@/lib/scope";
import { normalizePhoneFR, smsConfigured } from "@/lib/sms";
import { resolveReviewLink, getBusinessLite } from "@/lib/collecte";
import { and, desc, eq } from "drizzle-orm";

// Liste les contacts d'un commerce (+ statut de la dernière demande d'avis).
export async function GET(request: NextRequest) {
  const session = await requireAuth(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const businessId = parseInt(new URL(request.url).searchParams.get("businessId") || "", 10);
  if (!businessId || isNaN(businessId)) return NextResponse.json({ error: "businessId requis" }, { status: 400 });
  if (!(await ownsBusiness(scopeFrom(session), businessId))) {
    return NextResponse.json({ error: "Établissement introuvable" }, { status: 404 });
  }

  const rows = await db
    .select()
    .from(contacts)
    .where(eq(contacts.businessId, businessId))
    .orderBy(desc(contacts.createdAt))
    .limit(500);

  // Statut de la dernière demande d'avis par contact (pour l'affichage).
  const reqs = await db
    .select({ contactId: reviewRequests.contactId, status: reviewRequests.status, createdAt: reviewRequests.createdAt })
    .from(reviewRequests)
    .where(eq(reviewRequests.businessId, businessId))
    .orderBy(desc(reviewRequests.createdAt));
  const lastStatus: Record<number, string> = {};
  for (const r of reqs) if (!(r.contactId in lastStatus)) lastStatus[r.contactId] = r.status;

  const enriched = rows.map((c) => ({ ...c, lastStatus: lastStatus[c.id] || null }));

  // État de configuration pour piloter l'UI de collecte.
  const biz = await getBusinessLite(businessId);
  const hasReviewLink = biz ? Boolean(await resolveReviewLink(biz)) : false;

  return NextResponse.json({
    contacts: enriched,
    smsConfigured: smsConfigured(),
    hasReviewLink,
  });
}

// Ajoute un contact manuellement.
export async function POST(request: NextRequest) {
  const session = await requireAuth(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { businessId?: number; phone?: string; name?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }
  const businessId = Number(body.businessId);
  if (!businessId || isNaN(businessId)) return NextResponse.json({ error: "businessId requis" }, { status: 400 });
  if (!(await ownsBusiness(scopeFrom(session), businessId))) {
    return NextResponse.json({ error: "Établissement introuvable" }, { status: 404 });
  }

  const phone = normalizePhoneFR(String(body.phone || ""));
  if (!phone) return NextResponse.json({ error: "Numéro invalide (format FR attendu)" }, { status: 400 });
  const name = body.name ? String(body.name).slice(0, 120) : null;

  const [created] = await db
    .insert(contacts)
    .values({ businessId, phone, name, source: "manual" })
    .onConflictDoNothing({ target: [contacts.businessId, contacts.phone] })
    .returning();

  if (!created) return NextResponse.json({ error: "Ce numéro est déjà dans vos contacts." }, { status: 409 });
  return NextResponse.json({ contact: created }, { status: 201 });
}

// Supprime un contact (et ses demandes d'avis).
export async function DELETE(request: NextRequest) {
  const session = await requireAuth(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = parseInt(new URL(request.url).searchParams.get("id") || "", 10);
  if (!id || isNaN(id)) return NextResponse.json({ error: "id requis" }, { status: 400 });

  const [c] = await db.select({ businessId: contacts.businessId }).from(contacts).where(eq(contacts.id, id)).limit(1);
  if (!c || !(await ownsBusiness(scopeFrom(session), c.businessId))) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }

  await db.delete(reviewRequests).where(and(eq(reviewRequests.contactId, id)));
  await db.delete(contacts).where(eq(contacts.id, id));
  return NextResponse.json({ ok: true });
}
