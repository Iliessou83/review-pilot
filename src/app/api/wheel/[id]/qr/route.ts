export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { db } from "@/lib/db";
import { wheelConfigs } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { scopeFrom, ownsBusiness } from "@/lib/scope";
import { eq } from "drizzle-orm";

// GET /api/wheel/[id]/qr?dl=1 -> PNG du QR de la roue publique /r/[slug].
//
// Le QR encode l'URL de scan Caela QR (dynamique, suivie) une fois créée et
// persistée en base par getOrCreateDynamicQr — un seul appel Caela QR par
// roue, jamais un par affichage. Si Caela QR est indisponible, on encode
// directement /r/[slug] : la page reste utilisable, seul le suivi manque.
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!id || isNaN(id)) return NextResponse.json({ error: "id invalide" }, { status: 400 });

  const [wheel] = await db
    .select({
      id: wheelConfigs.id,
      slug: wheelConfigs.slug,
      businessId: wheelConfigs.businessId,
      businessName: wheelConfigs.businessName,
      qrScanUrl: wheelConfigs.qrScanUrl,
    })
    .from(wheelConfigs)
    .where(eq(wheelConfigs.id, id))
    .limit(1);
  if (!wheel) return NextResponse.json({ error: "Roue introuvable" }, { status: 404 });

  // Cloisonnement : un client ne peut récupérer le QR que d'une roue de SON commerce.
  const scope = scopeFrom(session);
  if (!scope.isAdmin) {
    if (wheel.businessId == null || !(await ownsBusiness(scope, wheel.businessId))) {
      return NextResponse.json({ error: "Roue introuvable" }, { status: 404 });
    }
  }

  const origin = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
  const publicUrl = `${origin.replace(/\/$/, "")}/r/${wheel.slug}`;

  const { getOrCreateDynamicQr } = await import("@/lib/caelaQr");
  const scanUrl = await getOrCreateDynamicQr(
    { id: wheel.id, slug: wheel.slug, businessName: wheel.businessName, qrScanUrl: wheel.qrScanUrl },
    publicUrl
  );

  const png = await QRCode.toBuffer(scanUrl || publicUrl, {
    width: 480,
    margin: 2,
    color: { dark: "#0f172a", light: "#ffffff" },
    errorCorrectionLevel: "M",
  });

  const dl = request.nextUrl.searchParams.get("dl");
  return new NextResponse(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store",
      ...(dl ? { "Content-Disposition": `attachment; filename="roue-${wheel.slug}-qr.png"` } : {}),
    },
  });
}
