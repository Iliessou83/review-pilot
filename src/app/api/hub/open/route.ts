import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { openHubAccount } from "@/lib/hubExtensions";

export const dynamic = "force-dynamic";

// Renvoie l'URL de connexion directe au cockpit Hub pour le commerçant
// connecté, pour le bouton "Ouvrir mon compte" de la bannière Caela Hub.
export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const result = await openHubAccount(session.email);
  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? "erreur" }, { status: 502 });
  }
  return NextResponse.json({ url: result.url });
}
