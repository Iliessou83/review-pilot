export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { businesses, businessConsents, googleAccessConsents, type ProductFact } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { scopeFrom, ownedBusinessIds, ownsBusiness } from "@/lib/scope";
import { desc, eq, inArray } from "drizzle-orm";

function normalizeWidgetOrigins(values: unknown): string[] | null {
  if (!Array.isArray(values) || values.length > 5) return null;
  const normalized: string[] = [];
  for (const value of values) {
    if (typeof value !== "string") return null;
    try {
      const url = new URL(value.trim());
      if (url.protocol !== "https:" && url.protocol !== "http:") return null;
      normalized.push(url.origin.toLowerCase());
    } catch {
      return null;
    }
  }
  return [...new Set(normalized)];
}

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

  const businessIds = allBusinesses.map((business) => business.id);
  const [accessRows, mandateRows] = businessIds.length > 0
    ? await Promise.all([
        db.select().from(googleAccessConsents).where(inArray(googleAccessConsents.businessId, businessIds)).orderBy(desc(googleAccessConsents.createdAt)),
        db.select().from(businessConsents).where(inArray(businessConsents.businessId, businessIds)).orderBy(desc(businessConsents.createdAt)),
      ])
    : [[], []];
  const latestAccess = new Map<number, typeof accessRows[number]>();
  const latestMandate = new Map<number, typeof mandateRows[number]>();
  for (const row of accessRows) if (!latestAccess.has(row.businessId)) latestAccess.set(row.businessId, row);
  for (const row of mandateRows) if (!latestMandate.has(row.businessId)) latestMandate.set(row.businessId, row);

  return NextResponse.json({
    externalReviewWidgetAvailable: process.env.ENABLE_EXTERNAL_REVIEW_WIDGET === "true",
    googleAutomationAvailable: process.env.ENABLE_GOOGLE_REVIEW_AUTOMATION === "true",
    caelaHumanDelegationAvailable: process.env.ENABLE_CAELA_HUMAN_DELEGATION === "true",
    businesses: allBusinesses.map(b => {
      const access = latestAccess.get(b.id);
      const mandate = latestMandate.get(b.id);
      return ({
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
      widgetEnabled: b.widgetEnabled,
      widgetAllowedOrigins: b.widgetAllowedOrigins || [],
      widgetPublicToken: b.widgetPublicToken,
      googleAccessConsent: access ? {
        actorEmail: access.actorEmail,
        termsVersion: access.termsVersion,
        confirmedAt: access.createdAt,
        granted: access.ownerOrManagerConfirmed && access.oauthAccessGranted,
      } : null,
      automationMandate: mandate ? {
        actorEmail: mandate.actorEmail,
        scope: mandate.scope,
        granted: mandate.granted,
        termsVersion: mandate.termsVersion,
        changedAt: mandate.createdAt,
      } : null,
    });}),
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
    automationConsentAccepted?: boolean;
    widgetEnabled?: boolean;
    widgetAllowedOrigins?: string[];
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { businessId, automationConsentAccepted = false, ...fields } = body;
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
  const [current] = await db
    .select({
      platform: businesses.platform,
      regulatedSector: businesses.regulatedSector,
      autoReply5Star: businesses.autoReply5Star,
      autoReplyNegative: businesses.autoReplyNegative,
      widgetEnabled: businesses.widgetEnabled,
      widgetAllowedOrigins: businesses.widgetAllowedOrigins,
    })
    .from(businesses)
    .where(eq(businesses.id, businessId))
    .limit(1);
  if (!current) return NextResponse.json({ error: "Établissement introuvable" }, { status: 404 });

  const isRegulated = fields.regulatedSector ?? current.regulatedSector;
  if (fields.compensationEnabled === true && isRegulated) {
    return NextResponse.json({ error: "Le geste commercial est désactivé pour les établissements en profession réglementée." }, { status: 403 });
  }

  const previousConsentScope = current.autoReplyNegative
    ? "all_delegated"
    : current.autoReply5Star
      ? "positive_auto"
      : "manual";
  const nextPositive = fields.autoReply5Star ?? current.autoReply5Star;
  const nextNegative = fields.autoReplyNegative ?? current.autoReplyNegative;
  if (nextNegative && !nextPositive) {
    return NextResponse.json({ error: "La délégation de tous les avis inclut nécessairement les avis 4-5 étoiles." }, { status: 400 });
  }
  const nextConsentScope = nextNegative ? "all_delegated" : nextPositive ? "positive_auto" : "manual";
  const consentChanged = nextConsentScope !== previousConsentScope;
  if (consentChanged && nextConsentScope === "all_delegated" && process.env.ENABLE_CAELA_HUMAN_DELEGATION !== "true") {
    return NextResponse.json({ error: "La prise en charge humaine des avis 1–3 étoiles s’active sur contrat, après validation de la capacité et du tarif avec Caela." }, { status: 403 });
  }
  if (consentChanged && nextConsentScope !== "manual" && current.platform === "google") {
    if (process.env.ENABLE_GOOGLE_REVIEW_AUTOMATION !== "true") {
      return NextResponse.json({ error: "L’automatisation Google restera désactivée jusqu’à la validation du projet API Google Business Profile." }, { status: 403 });
    }
    const [accessConsent] = await db
      .select({
        id: googleAccessConsents.id,
        ownerOrManagerConfirmed: googleAccessConsents.ownerOrManagerConfirmed,
        oauthAccessGranted: googleAccessConsents.oauthAccessGranted,
      })
      .from(googleAccessConsents)
      .where(eq(googleAccessConsents.businessId, businessId))
      .orderBy(desc(googleAccessConsents.createdAt))
      .limit(1);
    if (!accessConsent?.ownerOrManagerConfirmed || !accessConsent.oauthAccessGranted) {
      return NextResponse.json({ error: "Reconnectez d'abord Google et confirmez que vous êtes propriétaire ou gérant autorisé de cette fiche." }, { status: 409 });
    }
  }
  if (consentChanged && nextConsentScope !== "manual" && !automationConsentAccepted) {
    return NextResponse.json({ error: "Cochez la case de mandat explicite avant d'activer les réponses déléguées." }, { status: 400 });
  }

  let normalizedWidgetOrigins: string[] | undefined;
  if (fields.widgetAllowedOrigins !== undefined) {
    const normalized = normalizeWidgetOrigins(fields.widgetAllowedOrigins);
    if (!normalized) {
      return NextResponse.json({ error: "Renseignez au maximum 5 origines valides, par exemple https://monsite.fr." }, { status: 400 });
    }
    normalizedWidgetOrigins = normalized;
  }
  const nextWidgetEnabled = fields.widgetEnabled ?? current.widgetEnabled;
  if (nextWidgetEnabled && process.env.ENABLE_EXTERNAL_REVIEW_WIDGET !== "true") {
    return NextResponse.json({ error: "Le widget externe reste désactivé pendant la validation des licences de plateforme." }, { status: 403 });
  }
  const effectiveWidgetOrigins = normalizedWidgetOrigins ?? current.widgetAllowedOrigins ?? [];
  if (nextWidgetEnabled && effectiveWidgetOrigins.length === 0) {
    return NextResponse.json({ error: "Ajoutez au moins le domaine du site autorisé avant d'activer le widget." }, { status: 400 });
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
  if (fields.widgetEnabled !== undefined) update.widgetEnabled = fields.widgetEnabled;
  if (normalizedWidgetOrigins !== undefined) update.widgetAllowedOrigins = normalizedWidgetOrigins;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Aucun champ à mettre à jour" }, { status: 400 });
  }

  // L'activation et sa preuve sont atomiques : impossible d'activer une
  // automatisation si l'écriture du mandat échoue.
  const updated = await db.transaction(async (tx) => {
    const [row] = await tx
      .update(businesses)
      .set(update)
      .where(eq(businesses.id, businessId))
      .returning();

    if (!row) return null;

    if (consentChanged) {
      await tx.insert(businessConsents).values({
        businessId,
        actorEmail: session.email.toLowerCase(),
        scope: nextConsentScope,
        termsVersion: "review-management-2026-09-v1",
        granted: nextConsentScope !== "manual",
      });
    }
    return row;
  });

  if (!updated) return NextResponse.json({ error: "Établissement introuvable" }, { status: 404 });

  return NextResponse.json({ ok: true, business: updated });
}
