export const dynamic = "force-dynamic";

import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { confirmAccountLink } from "@/lib/hubExtensions";

// Récepteur de liaison de compte (fusion double-connexion). Contrairement au
// SSO Hub habituel (qui connecte automatiquement via un ticket signé), cette
// route exige une VRAIE session Caela Réputation : c'est la preuve que le
// visiteur possède réellement ce compte, pas juste le ticket. Pas connecté →
// renvoyé se reconnecter puis revenir ici (?next=).
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const ticket = searchParams.get("ticket");
  if (!ticket) return NextResponse.redirect(`${origin}/#login?error=link`);

  const session = await getSession();
  if (!session) {
    const next = encodeURIComponent(`/link-account?ticket=${ticket}`);
    return NextResponse.redirect(`${origin}/?next=${next}#login`);
  }

  const result = await confirmAccountLink({ ticket, localEmail: session.email });
  if (!result.ok) {
    return NextResponse.redirect(`${origin}/dashboard?linkErr=${encodeURIComponent(result.error || "erreur")}`);
  }
  return NextResponse.redirect(`${origin}/dashboard?linked=1`);
}
