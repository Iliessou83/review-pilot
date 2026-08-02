import "server-only";
import { db } from "@/lib/db";
import { wheelConfigs } from "@/db/schema";
import { eq } from "drizzle-orm";

// ── QR dynamique via Caela QR ────────────────────────────────────────────
//
// Review-pilot n'avait aucun générateur de QR : la page renvoyait vers une
// prestation payante externe ("Caela Agency, sur devis") pour obtenir une
// affiche/QR à afficher en caisse. On branche désormais Caela QR (produit
// sœur de l'écosystème, compte interne partagé, plan "business" payé par
// nous) pour fournir un QR dynamique directement dans le dashboard, sans
// que le commerçant ait besoin d'un compte Caela QR séparé.
//
// Règle stricte de l'écosystème : un seul appel à l'API Caela QR par roue.
// Le `scan_url` renvoyé est persisté dans `wheel_configs.qr_scan_url` et relu
// ensuite, jamais régénéré (limite de 30 créations/minute côté Caela QR,
// jamais atteinte par un appel unique mis en cache).
//
// Échec réseau, clé absente, 401, timeout : on ne fait jamais planter
// l'appelant. Voir src/app/api/wheel/[id]/qr/route.ts pour le repli (QR
// pointant directement sur /r/[slug], non suivi par Caela QR).

const CAELA_QR_URL = (process.env.CAELA_QR_URL || "https://caela-qr.vercel.app").replace(/\/$/, "");

export interface WheelForQr {
  id: number;
  slug: string;
  businessName: string;
  qrScanUrl: string | null;
}

/**
 * Renvoie l'URL de scan dynamique Caela QR pour cette roue.
 *
 * Lit `qrScanUrl`. Si déjà présent, le renvoie tel quel sans jamais rappeler
 * Caela QR. Sinon, crée le QR dynamique une seule fois et l'enregistre en
 * base. En cas d'échec (réseau, clé absente, refus de l'API, timeout),
 * renvoie `null` — l'appelant doit se replier sur un QR non suivi.
 */
export async function getOrCreateDynamicQr(
  wheel: WheelForQr,
  destination: string
): Promise<string | null> {
  if (wheel.qrScanUrl) return wheel.qrScanUrl;

  const apiKey = process.env.CAELA_QR_API_KEY;
  if (!apiKey) {
    console.error("[caelaQr] CAELA_QR_API_KEY absent : repli sur QR non suivi");
    return null;
  }

  const label = `Review-pilot — roue ${wheel.businessName?.trim() || wheel.slug}`;

  try {
    const res = await fetch(`${CAELA_QR_URL}/api/v1/qr`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: label,
        qr_type: "url",
        destination,
        is_dynamic: true,
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(`[caelaQr] refus ${res.status} pour la roue ${wheel.slug} : ${detail.slice(0, 300)}`);
      return null;
    }

    const payload = (await res.json().catch(() => null)) as { data?: { scan_url?: string } } | null;
    const scanUrl = payload?.data?.scan_url;
    if (!scanUrl) {
      console.error(`[caelaQr] réponse sans scan_url pour la roue ${wheel.slug}`);
      return null;
    }

    const [updated] = await db
      .update(wheelConfigs)
      .set({ qrScanUrl: scanUrl })
      .where(eq(wheelConfigs.id, wheel.id))
      .returning({ qrScanUrl: wheelConfigs.qrScanUrl });
    if (!updated) {
      console.error(`[caelaQr] scan_url créé mais roue introuvable pour l'enregistrement : ${wheel.id}`);
    }

    return scanUrl;
  } catch (err) {
    console.error(`[caelaQr] appel impossible pour la roue ${wheel.slug} :`, err);
    return null;
  }
}
