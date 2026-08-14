import { NextRequest, NextResponse } from "next/server";
import { appareilDepuisUA } from "@/lib/analytics/core";

/**
 * Collecteur d'événements. Route interne au site (donc jamais bloquée par un
 * bloqueur de pub, contrairement à un domaine tiers). Écrit dans la base
 * analytics commune avec la clé service, qui ne quitte jamais le serveur.
 *
 * CONFORMITÉ : aucune adresse IP n'est stockée. Le pays vient de l'en-tête
 * Vercel, l'IP elle-même n'est ni lue ni conservée. Aucun identifiant de
 * compte n'est accepté : les champs inconnus sont ignorés, pas enregistrés.
 */

const URL_BASE = process.env.ANALYTICS_SUPABASE_URL;
const CLE = process.env.ANALYTICS_SERVICE_KEY;

const MAX_EVENEMENTS = 40;
const MAX_PROPS_OCTETS = 4000;

/** Ce qui ne doit jamais entrer en base, même si un jour quelqu'un l'envoie. */
const PROPS_INTERDITES = new Set([
  "email", "mail", "nom", "prenom", "name", "firstname", "lastname",
  "telephone", "phone", "tel", "adresse", "address", "ip", "user_id",
  "userId", "customer_id", "password", "token",
]);

type EvenementBrut = {
  e?: unknown; t?: unknown; path?: unknown; ref?: unknown; props?: unknown;
  exp?: unknown; var?: unknown; org?: unknown; orgp?: unknown;
};

const texte = (v: unknown, max: number): string | null =>
  typeof v === "string" && v.length > 0 ? v.slice(0, max) : null;

/** Retire tout champ qui ressemble à une donnée personnelle. */
function nettoyerProps(brut: unknown): Record<string, unknown> {
  if (!brut || typeof brut !== "object") return {};
  const sortie: Record<string, unknown> = {};
  for (const [cle, valeur] of Object.entries(brut as Record<string, unknown>)) {
    if (PROPS_INTERDITES.has(cle) || PROPS_INTERDITES.has(cle.toLowerCase())) continue;
    if (typeof valeur === "string" && valeur.includes("@")) continue; // email déguisé
    sortie[cle] = valeur;
  }
  const json = JSON.stringify(sortie);
  return json.length <= MAX_PROPS_OCTETS ? sortie : { tronque: true };
}

async function ecrire(table: string, lignes: unknown[], entetesSup: Record<string, string> = {}) {
  return fetch(`${URL_BASE}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      apikey: CLE!,
      Authorization: `Bearer ${CLE}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
      ...entetesSup,
    },
    body: JSON.stringify(lignes),
  });
}

export async function POST(req: NextRequest) {
  // Une panne d'analytics ne doit jamais remonter au visiteur : on répond 204
  // dans tous les cas, et on trace l'erreur côté serveur.
  if (!URL_BASE || !CLE) return new NextResponse(null, { status: 204 });

  try {
    const corps = await req.json();
    const produit = texte(corps?.p, 40);
    const anonId = texte(corps?.aid, 60);
    const sessionId = texte(corps?.sid, 60);
    const bruts: EvenementBrut[] = Array.isArray(corps?.ev) ? corps.ev.slice(0, MAX_EVENEMENTS) : [];

    if (!produit || !anonId || bruts.length === 0) return new NextResponse(null, { status: 204 });

    const ua = req.headers.get("user-agent");
    const pays = req.headers.get("x-vercel-ip-country");

    const lignes = bruts
      .map((b) => {
        const nom = texte(b.e, 60);
        if (!nom) return null;
        const horodatage =
          typeof b.t === "number" && b.t > 1_600_000_000_000 && b.t < Date.now() + 60_000
            ? new Date(b.t).toISOString()
            : new Date().toISOString();

        return {
          ts: horodatage,
          product: produit,
          event: nom,
          anon_id: anonId,
          session_id: sessionId,
          path: texte(b.path, 300),
          referrer: texte(b.ref, 300),
          device: appareilDepuisUA(ua),
          country: pays && pays !== "XX" ? pays.slice(0, 2) : null,
          props: nettoyerProps(b.props),
          exp_key: texte(b.exp, 80),
          variant: texte(b.var, 20),
          origin: texte(b.org, 60),
          origin_path: texte(b.orgp, 300),
        };
      })
      .filter(Boolean) as Record<string, unknown>[];

    if (lignes.length === 0) return new NextResponse(null, { status: 204 });

    const rep = await ecrire("an_events", lignes);
    if (!rep.ok) console.error("[analytics] écriture refusée", rep.status, await rep.text());

    // ─── Volet A/B : on tient à jour qui a vu quoi, et qui a converti ───
    const expos = lignes.filter((l) => l.exp_key && l.event === "exp_expose");
    if (expos.length > 0) {
      // La ligne d'expérience se crée toute seule à la première exposition :
      // Nexus voit le test sans qu'on ait à le déclarer à la main quelque part.
      const experiences = [...new Map(expos.map((l) => [l.exp_key, l])).values()].map((l) => ({
        key: l.exp_key,
        product: produit,
        goal_event: (l.props as Record<string, unknown>)?.objectif ?? null,
        status: "en_cours",
      }));
      await ecrire("an_experiments", experiences, {
        Prefer: "return=minimal,resolution=ignore-duplicates",
      });

      await ecrire(
        "an_assignments",
        expos.map((l) => ({
          exp_key: l.exp_key,
          anon_id: anonId,
          product: produit,
          variant: l.variant,
        })),
        { Prefer: "return=minimal,resolution=ignore-duplicates" },
      );
    }

    const reussites = lignes.filter((l) => l.exp_key && l.event === "exp_reussi");
    for (const r of reussites) {
      await fetch(
        `${URL_BASE}/rest/v1/an_assignments?exp_key=eq.${encodeURIComponent(
          String(r.exp_key),
        )}&anon_id=eq.${encodeURIComponent(anonId)}&converted_at=is.null`,
        {
          method: "PATCH",
          headers: {
            apikey: CLE,
            Authorization: `Bearer ${CLE}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({ converted_at: new Date().toISOString() }),
        },
      );
    }
  } catch (e) {
    console.error("[analytics] collecteur", e);
  }

  return new NextResponse(null, { status: 204 });
}
