export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { cronAutorise, avecSignalement } from "@/lib/cronSignal";
import { db } from "@/lib/db";
import { businesses, posts } from "@/db/schema";
import { and, eq, gte, sql } from "drizzle-orm";
import { envoyer, EXPEDITEUR } from "@/lib/email";
import { escapeHtml } from "@/lib/escape-html";

// Une fois par jour : pour chaque commerce Google actif, compte les posts
// PUBLIÉS ce mois-ci. En dessous de l'objectif (posts_target_per_month,
// défaut 4) et si on n'a pas déjà relancé ce mois-ci, on prévient le client
// avec son lien perso d'envoi de photos/vidéos.
async function handler(request: Request) {
  if (!cronAutorise(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const debutMois = new Date();
    debutMois.setDate(1);
    debutMois.setHours(0, 0, 0, 0);

    const actifs = await db
      .select()
      .from(businesses)
      .where(eq(businesses.platform, "google"));

    let relances = 0;
    for (const b of actifs) {
      // Déjà relancé ce mois-ci : on ne spamme pas.
      if (b.lastContentReminderAt && b.lastContentReminderAt >= debutMois) continue;

      const [row] = await db
        .select({ n: sql<number>`count(*)::int` })
        .from(posts)
        .where(and(eq(posts.businessId, b.id), eq(posts.status, "publie"), gte(posts.publishedAt, debutMois)));
      const publies = row?.n ?? 0;

      if (publies >= b.postsTargetPerMonth) continue;

      // Jamais de lien : on en pose un avant de relancer, sinon le message
      // n'a rien à donner au client.
      let mediaUploadToken = b.mediaUploadToken;
      if (!mediaUploadToken) {
        mediaUploadToken = crypto.randomBytes(16).toString("hex");
        await db.update(businesses).set({ mediaUploadToken }).where(eq(businesses.id, b.id));
      }

      const appUrl = (process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "").replace(/\/+$/, "");
      const lien = `${appUrl}/media/${mediaUploadToken}`;
      const clientEmail = b.ownerEmail || process.env.CLIENT_NOTIFICATION_EMAIL || "contact@caela.fr";
      const manquants = b.postsTargetPerMonth - publies;

      try {
        await envoyer({
          from: EXPEDITEUR,
          to: clientEmail,
          subject: `📸 Il manque ${manquants} publication${manquants > 1 ? "s" : ""} ce mois-ci pour ${escapeHtml(b.name)}`,
          html: `
            <div style="font-family:'Google Sans',system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#fff;">
              <h2 style="font-size:20px;font-weight:700;color:#202124;margin:0 0 8px;">On a besoin d'un peu de contenu</h2>
              <p style="color:#5F6368;font-size:14px;margin:0 0 20px;">
                ${escapeHtml(b.name)} a publié <strong>${publies}</strong> post${publies > 1 ? "s" : ""} ce mois-ci sur Google,
                l'objectif est ${b.postsTargetPerMonth}. Une photo ou une courte vidéo suffit, on s'occupe du reste.
              </p>
              <a href="${lien}" style="display:inline-block;background:#1A73E8;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;">
                Envoyer une photo ou vidéo
              </a>
              <div style="margin-top:24px;padding-top:16px;border-top:1px solid #DADCE0;font-size:11px;color:#80868B;">
                Caela Réputation by Caela Agency · <a href="mailto:contact@caela.fr" style="color:#1A73E8;">contact@caela.fr</a>
              </div>
            </div>
          `,
        });
        await db.update(businesses).set({ lastContentReminderAt: new Date() }).where(eq(businesses.id, b.id));
        relances++;
      } catch (itemErr) {
        console.error(`Content reminder failed for business ${b.id}:`, itemErr);
      }
    }

    return NextResponse.json({ ok: true, relances_envoyees: relances });
  } catch (err) {
    console.error("Content reminder cron error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export const GET = avecSignalement("/api/cron/content-reminder", handler);
