export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, passwordResetTokens } from "@/db/schema";
import { generateResetToken, hashResetToken } from "@/lib/auth";
import { dbRateLimit, getClientIp } from "@/lib/rate-limit";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "placeholder");

// POST /api/auth/forgot-password { email }
// Répond toujours { ok: true } — ne révèle jamais si l'email existe ou non.
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const allowed = await dbRateLimit(`forgot-password:${ip}`, 5, 15 * 60 * 1000).catch(() => true);
  if (!allowed) return NextResponse.json({ ok: true });

  const body = await req.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  if (!email) return NextResponse.json({ ok: true });

  try {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (user) {
      const token = generateResetToken();
      await db.insert(passwordResetTokens).values({
        userId: user.id,
        tokenHash: hashResetToken(token),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      });
      const url = `${req.nextUrl.origin}/reset-password?token=${token}`;
      if (process.env.RESEND_API_KEY) {
        // Le SDK Resend renvoie { data, error } sans lever d'exception : le
        // `catch { /* fail-quiet */ }` plus bas ne voyait donc jamais un refus
        // d'envoi. Un email de réinitialisation de mot de passe pouvait être
        // rejeté par Resend sans laisser la moindre trace, et la personne
        // restait bloquée hors de son compte en croyant s'être trompée.
        const { error: erreurResend } = await resend.emails.send({
          from: "Caela Réputation <noreply@caela.fr>",
          to: email,
          subject: "Réinitialise ton mot de passe",
          html: `<p>Une demande de réinitialisation a été faite pour ce compte Caela Réputation.</p>
                 <p><a href="${url}">Choisir un nouveau mot de passe</a></p>
                 <p style="color:#888;font-size:12px">Ce lien expire dans 1 heure. Si ce n'est pas toi, ignore cet email.</p>`,
        });
        // Journalisé, jamais renvoyé au client : la réponse reste volontairement
        // identique qu'un compte existe ou non, sinon on offre un moyen de
        // deviner les adresses inscrites.
        if (erreurResend) {
          console.error("[email:forgot-password] Resend a refusé l'envoi", erreurResend.message || erreurResend);
        }
      }
    }
  } catch { /* fail-quiet */ }

  return NextResponse.json({ ok: true });
}
