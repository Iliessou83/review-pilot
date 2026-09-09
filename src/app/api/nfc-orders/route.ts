export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { envoyer, EXPEDITEUR } from "@/lib/email";
import { escapeHtml } from "@/lib/escape-html";
import { getClientIp, limitePartagee } from "@/lib/rate-limit";

const PACKS = new Set(["solo", "trio", "etablissement"]);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function field(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (!(await limitePartagee(`nfc-order:${ip}`, 5, 60 * 60 * 1000))) {
    return NextResponse.json({ error: "Trop de demandes. Réessayez dans une heure." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Demande invalide." }, { status: 400 });
  }

  const name = field(body.name, 120);
  const email = field(body.email, 254).toLowerCase();
  const phone = field(body.phone, 40);
  const pack = field(body.pack, 30);
  const establishment = field(body.etablissement, 180);
  const message = field(body.message, 2000);

  if (!name || !EMAIL.test(email) || !establishment || !PACKS.has(pack)) {
    return NextResponse.json({ error: "Vérifiez les champs obligatoires." }, { status: 400 });
  }

  const sent = await envoyer({
    from: EXPEDITEUR,
    to: process.env.CLIENT_NOTIFICATION_EMAIL || "contact@caela.fr",
    replyTo: email,
    subject: `Commande NFC à confirmer — ${establishment}`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:600px">
        <h2>Nouvelle demande de plaque NFC</h2>
        <p><strong>Contact :</strong> ${escapeHtml(name)} — ${escapeHtml(email)}</p>
        ${phone ? `<p><strong>Téléphone :</strong> ${escapeHtml(phone)}</p>` : ""}
        <p><strong>Établissement :</strong> ${escapeHtml(establishment)}</p>
        <p><strong>Pack :</strong> ${escapeHtml(pack)}</p>
        ${message ? `<p><strong>Informations complémentaires :</strong><br>${escapeHtml(message).replace(/\n/g, "<br>")}</p>` : ""}
        <p>Cette demande n'est pas encore une commande payée. Confirmer le produit, le délai et le tarif avant d'envoyer un lien Stripe.</p>
      </div>
    `,
  });

  if (!sent) {
    return NextResponse.json({ error: "Le service d'envoi est temporairement indisponible." }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}
