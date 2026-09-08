export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { cronAutorise, avecSignalement } from "@/lib/cronSignal";
import { db } from "@/lib/db";
import { businesses, subscriptions, reviews } from "@/db/schema";
import { eq, lt, and, inArray } from "drizzle-orm";
import { envoyer, EXPEDITEUR } from "@/lib/email";
import { escapeHtml } from "@/lib/escape-html";

// ── Purge contenu de plateforme + données après résiliation ────────────────
//
// Le contenu obtenu par la Business Profile API (auteur, note, texte et
// réponse) est supprimé de la base Caela au plus tard après 30 jours. La
// réponse déjà publiée reste chez Google : cette purge ne l'efface pas de la
// fiche. Les mesures propres à Caela, sans contenu d'avis, sont enregistrées
// séparément dans review_activity_events.
//
// Douze mois après résiliation, on supprime aussi l'établissement Caela et ses
// données opérationnelles restantes. Cette seconde durée ne rallonge jamais
// le cache de contenu Google.
//
// Ne touche JAMAIS la table `users` (compte de connexion du client) : la
// résiliation d'un abonnement ne supprime pas le compte, seulement les
// données du commerce associé — le client peut se reconnecter et repartir
// de zéro sans que son login disparaisse.
//
// Un export JSON est disponible depuis Paramètres et via GET
// /api/account/export, avant la purge. Les secrets OAuth/API ne sont jamais
// inclus dans cet export.

const UN_AN_MS = 365 * 24 * 60 * 60 * 1000;
const TRENTE_JOURS_MS = 30 * 24 * 60 * 60 * 1000;

async function handler(request: Request) {
  if (!cronAutorise(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const seuilGoogle = new Date(Date.now() - TRENTE_JOURS_MS);
    const googleSupprimes = await db
      .delete(reviews)
      .where(and(eq(reviews.platform, "google"), lt(reviews.publishedAt, seuilGoogle)))
      .returning({ id: reviews.id });

    const seuil = new Date(Date.now() - UN_AN_MS);

    const resiliesDepuisPlusUnAn = await db
      .select({ email: subscriptions.email, updatedAt: subscriptions.updatedAt })
      .from(subscriptions)
      .where(and(eq(subscriptions.status, "canceled"), lt(subscriptions.updatedAt, seuil)));

    if (resiliesDepuisPlusUnAn.length === 0) {
      return NextResponse.json({ ok: true, google_reviews_purged: googleSupprimes.length, businesses_purges: 0 });
    }

    const emails = resiliesDepuisPlusUnAn.map(s => s.email);

    const aPurger = await db
      .select({ id: businesses.id, name: businesses.name, ownerEmail: businesses.ownerEmail })
      .from(businesses)
      .where(inArray(businesses.ownerEmail, emails));

    if (aPurger.length === 0) {
      return NextResponse.json({ ok: true, google_reviews_purged: googleSupprimes.length, businesses_purges: 0 });
    }

    const ids = aPurger.map(b => b.id);
    await db.delete(businesses).where(inArray(businesses.id, ids));

    const destinataire = process.env.CLIENT_NOTIFICATION_EMAIL || "contact@caela.fr";
    const envoye = await envoyer({
      from: EXPEDITEUR,
      to: destinataire,
      subject: `🗑️ Purge RGPD — ${aPurger.length} commerce${aPurger.length > 1 ? "s" : ""} résilié${aPurger.length > 1 ? "s" : ""} depuis 1 an`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:560px;">
          <h2 style="margin:0 0 4px;">Purge automatique — fin de conservation</h2>
          <p style="color:#5F6368;font-size:13px;margin:0 0 20px;">Établissements Caela résiliés depuis 12 mois supprimés. Le contenu Google est, lui, purgé séparément après 30 jours (compte de connexion conservé) :</p>
          <ul style="font-size:13px;color:#202124;">
            ${aPurger.map(b => `<li>${escapeHtml(b.name)} (${escapeHtml(b.ownerEmail)})</li>`).join("")}
          </ul>
        </div>
      `,
    });

    if (!envoye) {
      console.error("[cron/data-retention-purge] purge effectuée mais notification email non envoyée");
    }

    return NextResponse.json({ ok: true, google_reviews_purged: googleSupprimes.length, businesses_purges: aPurger.length, notified: envoye });
  } catch (err) {
    console.error("Data retention purge cron error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export const GET = avecSignalement("/api/cron/data-retention-purge", handler);
