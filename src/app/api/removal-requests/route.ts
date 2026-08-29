export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { removalRequests } from "@/db/schema";
import { envoyer, EXPEDITEUR } from "@/lib/email";
import { escapeHtml } from "@/lib/escape-html";
import { limitePartagee, getClientIp } from "@/lib/rate-limit";

const REASON_LABELS: Record<string, string> = {
  faux_avis: "Faux avis (jamais client)",
  diffamatoire: "Diffamatoire / insultant",
  concurrent: "Posté par un concurrent",
  autre: "Autre",
};

const ACCESS_LABELS: Record<string, string> = {
  deja_connecte: "Fiche déjà connectée à Caela",
  va_ajouter_gerant: "Va nous ajouter comme Gérant sur Google Business Profile",
  ne_sait_pas: "Ne sait pas comment faire — à guider",
};

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (!(await limitePartagee(`removal-request:${ip}`, 5, 60 * 60 * 1000))) {
    return NextResponse.json({ error: "Trop de demandes, réessayez plus tard." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Requête invalide" }, { status: 400 });

  const { businessName, contactEmail, reviewAuthor, reviewText, reason, reasonDetail, hasGmbAccess, gmbListingUrl } = body;

  if (!businessName || !contactEmail || !reviewAuthor || !reviewText || !reason || !hasGmbAccess) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }
  if (!["faux_avis", "diffamatoire", "concurrent", "autre"].includes(reason)) {
    return NextResponse.json({ error: "Motif invalide" }, { status: 400 });
  }
  if (!["deja_connecte", "va_ajouter_gerant", "ne_sait_pas"].includes(hasGmbAccess)) {
    return NextResponse.json({ error: "Statut d'accès invalide" }, { status: 400 });
  }

  const [created] = await db.insert(removalRequests).values({
    businessName, contactEmail, reviewAuthor, reviewText, reason,
    reasonDetail: reasonDetail || null,
    hasGmbAccess, gmbListingUrl: gmbListingUrl || null,
  }).returning({ id: removalRequests.id });

  // Notification interne — même mécanisme que le reste des demandes GMB,
  // mais avec toutes les infos structurées au lieu d'un mailto en vrac.
  await envoyer({
    from: EXPEDITEUR,
    to: process.env.CLIENT_NOTIFICATION_EMAIL || "contact@caela.fr",
    replyTo: contactEmail,
    subject: `🚫 Signalement avis — ${businessName}`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:560px;">
        <h2 style="margin:0 0 16px;">Nouvelle demande de signalement (#${created.id})</h2>
        <p><strong>Établissement :</strong> ${escapeHtml(businessName)}</p>
        <p><strong>Contact :</strong> ${escapeHtml(contactEmail)}</p>
        <p><strong>Motif :</strong> ${escapeHtml(REASON_LABELS[reason] || reason)}</p>
        ${reasonDetail ? `<p><strong>Détail :</strong> ${escapeHtml(reasonDetail)}</p>` : ""}
        <p><strong>Accès GMB :</strong> ${escapeHtml(ACCESS_LABELS[hasGmbAccess] || hasGmbAccess)}</p>
        ${gmbListingUrl ? `<p><strong>Lien fiche :</strong> ${escapeHtml(gmbListingUrl)}</p>` : ""}
        <hr style="margin:16px 0;border:none;border-top:1px solid #DADCE0;">
        <p><strong>Avis de :</strong> ${escapeHtml(reviewAuthor)}</p>
        <p style="background:#F8F9FA;padding:12px;border-radius:8px;">${escapeHtml(reviewText)}</p>
      </div>
    `,
  });

  return NextResponse.json({ ok: true, id: created.id });
}
