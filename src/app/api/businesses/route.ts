export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { businesses } from "@/db/schema";
import { requireAuth, ADMIN_EMAILS } from "@/lib/auth";
import { scopeFrom, ownedBusinessIds, ownsBusiness } from "@/lib/scope";
import { checkBusinessQuota } from "@/lib/plan-limits";
import { pushHubEvent } from "@/lib/hubEvent";
import { eq, inArray } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const session = await requireAuth(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Cloisonnement : un client ne voit que ses commerces, l'admin voit tout.
  const scope = scopeFrom(session);
  const ids = await ownedBusinessIds(scope);
  if (ids !== "all" && ids.length === 0) return NextResponse.json([]);

  try {
    // On n'expose JAMAIS platformToken (clé API Google/Trustpilot) au navigateur.
    const cols = {
      id: businesses.id,
      name: businesses.name,
      platform: businesses.platform,
      platformId: businesses.platformId,
      autoReply5Star: businesses.autoReply5Star,
      autoReplyNegative: businesses.autoReplyNegative,
      businessType: businesses.businessType,
      compensationEnabled: businesses.compensationEnabled,
      compensationText: businesses.compensationText,
      ownerEmail: businesses.ownerEmail,
      referralCode: businesses.referralCode,
      referredBy: businesses.referredBy,
      createdAt: businesses.createdAt,
    };
    const base = db.select(cols).from(businesses);
    const all =
      ids === "all"
        ? await base.orderBy(businesses.createdAt)
        : await base.where(inArray(businesses.id, ids)).orderBy(businesses.createdAt);
    return NextResponse.json(all);
  } catch (err) {
    console.error("GET /businesses error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await requireAuth(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = session.role === "admin" || ADMIN_EMAILS.includes(session.email.toLowerCase());

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { name, platform, platformId, platformToken, autoReply5Star } = body as {
    name?: string; platform?: string; platformId?: string;
    platformToken?: string; ownerEmail?: string; autoReply5Star?: boolean;
  };

  // Cloisonnement : un client ne peut créer un commerce QU'À SON nom
  // (owner_email = son email). Seul le super-admin choisit le propriétaire.
  const ownerEmail = isAdmin
    ? (body.ownerEmail as string | undefined)
    : session.email.toLowerCase();

  if (!name || !platform || !platformId || !platformToken || !ownerEmail) {
    return NextResponse.json({ error: "All fields required" }, { status: 400 });
  }

  if (platform !== "google" && platform !== "trustpilot") {
    return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
  }

  if (typeof ownerEmail === "string" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail)) {
    return NextResponse.json({ error: "Invalid owner email" }, { status: 400 });
  }

  // Les comptes super-admin (mode agence, voir ADMIN_EMAILS) ne sont jamais
  // bridés — le quota ne s'applique qu'aux clients arrivés par abonnement.
  if (!isAdmin) {
    const quota = await checkBusinessQuota(String(ownerEmail));
    if (!quota.allowed) {
      const message = quota.planName
        ? `Limite atteinte : le plan ${quota.planName} inclut ${quota.max} établissement(s) maximum (${quota.current} déjà connecté(s)). Passez à un plan supérieur pour en ajouter.`
        : `Aucun abonnement actif trouvé pour cet email. Un seul établissement est autorisé en mode essai — souscrivez un plan pour en ajouter d'autres.`;
      return NextResponse.json({ error: message }, { status: 403 });
    }
  }

  try {
    const [created] = await db.insert(businesses).values({
      name: String(name).slice(0, 255),
      platform: platform as "google" | "trustpilot",
      platformId: String(platformId).slice(0, 500),
      platformToken: String(platformToken).slice(0, 1000),
      ownerEmail: String(ownerEmail).toLowerCase().trim(),
      autoReply5Star: autoReply5Star ?? true,
    }).returning();

    // Fédération au cerveau Caela (par email).
    await pushHubEvent({
      ownerEmail: String(ownerEmail),
      kind: "contact",
      title: `Établissement ajouté — ${String(name)}`,
      businessName: String(name),
      metadata: { event: "business_added", platform },
    }).catch(() => {});

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("POST /businesses error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await requireAuth(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const idParam = searchParams.get("id");
  const id = idParam ? parseInt(idParam, 10) : NaN;

  if (!idParam || isNaN(id) || id <= 0) {
    return NextResponse.json({ error: "Valid ID required" }, { status: 400 });
  }

  // Cloisonnement : un client ne peut supprimer qu'un de ses commerces.
  const scope = scopeFrom(session);
  if (!(await ownsBusiness(scope, id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const deleted = await db.delete(businesses).where(eq(businesses.id, id)).returning({ id: businesses.id });
    if (deleted.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /businesses error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
