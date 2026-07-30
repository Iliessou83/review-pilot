import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

// ── Ce que Caela Réputation raconte au poste de commandement ─────────────────
// Contrat commun aux cinq produits : un GET, une clé partagée en en-tête, des
// compteurs déjà agrégés. Aucun nom d'auteur d'avis, aucune adresse : Nexus
// veut savoir si le produit vit, pas qui sont ses clients.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Aucun repli. Un `|| "quelque-chose"` transformerait une variable absente en
 *  porte ouverte, sans que rien ne le montre. Sans clé, on refuse. */
function cleAttendue(): string | null {
  // .trim() : un retour à la ligne collé à la fin d'un secret fausse toute
  // comparaison, en silence.
  const c = (process.env.NEXUS_API_KEY || "").trim();
  return c.length > 0 ? c : null;
}

function cleValide(req: NextRequest, attendue: string): boolean {
  const recue = (req.headers.get("x-nexus-cle") || "").trim();
  if (recue.length !== attendue.length) return false;
  // Temps constant : un `===` révèle la bonne valeur octet par octet.
  return crypto.timingSafeEqual(Buffer.from(recue), Buffer.from(attendue));
}

export async function GET(req: NextRequest) {
  const attendue = cleAttendue();
  if (!attendue) {
    return NextResponse.json(
      { erreur: "NEXUS_API_KEY absente de ce produit. Rien n'est exposé." },
      { status: 503 },
    );
  }
  if (!cleValide(req, attendue)) {
    return NextResponse.json({ erreur: "cle refusee" }, { status: 401 });
  }

  try {
    const brut = await db.execute(sql`
      select
        (select count(*)::int from reviews)                                                   as avis_total,
        (select count(*)::int from reviews where published_at > now() - interval '30 days')   as avis_30j,
        (select count(*)::int from reviews where responded = true)                            as avis_repondus,
        (select coalesce(round(avg(rating)::numeric, 2), 0) from reviews)                     as note_moyenne,
        (select count(*)::int from review_requests where status = 'sent')                     as demandes_envoyees,
        (select count(*)::int from review_requests where clicked_at is not null)              as demandes_cliquees,
        (select count(*)::int from businesses)                                                as etablissements,
        (select count(*)::int from wheel_spins where created_at > now() - interval '30 days') as tirages_30j
    `);

    // Selon le pilote, `execute` rend un tableau ou un objet à `rows`.
    const enveloppe = brut as unknown as { rows?: Record<string, unknown>[] } | Record<string, unknown>[];
    const r = (Array.isArray(enveloppe) ? enveloppe[0] : enveloppe?.rows?.[0]) ?? {};
    const n = (cle: string) => Number((r as Record<string, unknown>)[cle] ?? 0);

    return NextResponse.json({
      produit: "reputation",
      genere_le: new Date().toISOString(),
      chiffres: [
        { cle: "avis_30j", libelle: "Nouveaux avis (30 j)", valeur: n("avis_30j") },
        { cle: "avis_total", libelle: "Avis collectés (total)", valeur: n("avis_total") },
        { cle: "avis_repondus", libelle: "Avis auxquels on a répondu", valeur: n("avis_repondus") },
        { cle: "note_moyenne", libelle: "Note moyenne", valeur: n("note_moyenne") },
        { cle: "demandes_envoyees", libelle: "Demandes d'avis envoyées", valeur: n("demandes_envoyees") },
        { cle: "demandes_cliquees", libelle: "Demandes d'avis cliquées", valeur: n("demandes_cliquees") },
        { cle: "etablissements", libelle: "Établissements suivis", valeur: n("etablissements") },
        { cle: "tirages_30j", libelle: "Tirages de roue (30 j)", valeur: n("tirages_30j") },
      ],
    });
  } catch (e) {
    return NextResponse.json({ erreur: String(e).slice(0, 300) }, { status: 500 });
  }
}
