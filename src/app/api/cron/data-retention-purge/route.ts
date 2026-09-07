export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { cronAutorise, avecSignalement } from "@/lib/cronSignal";
import { db } from "@/lib/db";
import { businesses, subscriptions } from "@/db/schema";
import { eq, lt, and, inArray } from "drizzle-orm";
import { envoyer, EXPEDITEUR } from "@/lib/email";
import { escapeHtml } from "@/lib/escape-html";

// ── Purge RGPD : données conservées 12 mois après résiliation ───────────────
//
// Principe RGPD "conservation limitée à la finalité" — voir le playbook ops
// (section 6). Tant que l'abonnement est actif, les avis sont nécessaires au
// service (historique, score de santé, rapports). 12 mois après la
// résiliation, plus aucune finalité ne justifie de garder les avis de tiers
// (auteurs, textes) rattachés au commerce : on supprime le business, ce qui
// cascade sur ses avis et suggestions IA (ON DELETE CASCADE, voir schema.ts).
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

async function handler(request: Request) {
  if (!cronAutorise(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const seuil = new Date(Date.now() - UN_AN_MS);

    const resiliesDepuisPlusUnAn = await db
      .select({ email: subscriptions.email, updatedAt: subscriptions.updatedAt })
      .from(subscriptions)
      .where(and(eq(subscriptions.status, "canceled"), lt(subscriptions.updatedAt, seuil)));

    if (resiliesDepuisPlusUnAn.length === 0) {
      return NextResponse.json({ ok: true, businesses_purges: 0 });
    }

    const emails = resiliesDepuisPlusUnAn.map(s => s.email);

    const aPurger = await db
      .select({ id: businesses.id, name: businesses.name, ownerEmail: businesses.ownerEmail })
      .from(businesses)
      .where(inArray(businesses.ownerEmail, emails));

    if (aPurger.length === 0) {
      return NextResponse.json({ ok: true, businesses_purges: 0 });
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
          <h2 style="margin:0 0 4px;">Purge automatique — conservation 12 mois</h2>
          <p style="color:#5F6368;font-size:13px;margin:0 0 20px;">Avis, réponses et suggestions IA supprimés pour les commerces suivants (compte de connexion du client conservé) :</p>
          <ul style="font-size:13px;color:#202124;">
            ${aPurger.map(b => `<li>${escapeHtml(b.name)} (${escapeHtml(b.ownerEmail)})</li>`).join("")}
          </ul>
        </div>
      `,
    });

    if (!envoye) {
      console.error("[cron/data-retention-purge] purge effectuée mais notification email non envoyée");
    }

    return NextResponse.json({ ok: true, businesses_purges: aPurger.length, notified: envoye });
  } catch (err) {
    console.error("Data retention purge cron error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export const GET = avecSignalement("/api/cron/data-retention-purge", handler);
