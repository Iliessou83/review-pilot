export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviews, businesses } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { scopeFrom, ownedBusinessIds } from "@/lib/scope";
import { eq, desc, inArray } from "drizzle-orm";

// Export CSV des avis (manque #9 de l'audit "Avant Commercialisation" 2026-08-27) :
// aucun moyen jusqu'ici de télécharger un rapport pour un franchisé, un
// expert-comptable ou une réunion interne.
function csvEscape(value: string): string {
  const s = value.replace(/\r?\n/g, " ").trim();
  return /[",;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(request: NextRequest) {
  const session = await requireAuth(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const scope = scopeFrom(session);
  const ids = await ownedBusinessIds(scope);
  if (ids !== "all" && ids.length === 0) {
    return new NextResponse("établissement;plateforme;note;auteur;date;répondu;texte\n", {
      headers: { "Content-Type": "text/csv; charset=utf-8" },
    });
  }

  const rows = await db
    .select({ review: reviews, businessName: businesses.name })
    .from(reviews)
    .leftJoin(businesses, eq(reviews.businessId, businesses.id))
    .where(ids === "all" ? undefined : inArray(reviews.businessId, ids))
    .orderBy(desc(reviews.publishedAt))
    .limit(5000);

  const header = "établissement;plateforme;note;auteur;date;répondu;texte";
  const lines = rows.map(({ review, businessName }) =>
    [
      csvEscape(businessName || ""),
      csvEscape(review.platform),
      String(review.rating),
      csvEscape(review.authorName),
      review.publishedAt ? new Date(review.publishedAt).toISOString().slice(0, 10) : "",
      review.responded ? "oui" : "non",
      csvEscape(review.text),
    ].join(";")
  );

  const csv = "﻿" + [header, ...lines].join("\n") + "\n"; // BOM pour Excel FR

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="avis-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
