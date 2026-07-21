import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getSuggestedExtensions } from "@/lib/hubExtensions";

export const dynamic = "force-dynamic";

// Liste des extensions Caela proposables au commerçant connecté (celles qu'il
// n'a pas encore). Le secret CAELA_SSO_SECRET ne quitte jamais le serveur.
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const modules = await getSuggestedExtensions(session.email);
  return NextResponse.json({ modules });
}
