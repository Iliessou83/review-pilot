import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { businesses } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { activateExtension } from "@/lib/hubExtensions";

export const dynamic = "force-dynamic";

// Active une extension Caela pour le commerçant connecté, depuis son
// dashboard Reputation. Renvoie l'URL vers laquelle rediriger.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { module } = (await req.json().catch(() => ({}))) as { module?: string };
  if (!module) return NextResponse.json({ error: "module_manquant" }, { status: 400 });

  const [biz] = await db
    .select({ name: businesses.name })
    .from(businesses)
    .where(eq(businesses.ownerEmail, session.email))
    .limit(1);

  const result = await activateExtension({
    ownerEmail: session.email,
    businessName: biz?.name ?? null,
    module,
  });
  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? "erreur" }, { status: 502 });
  }
  return NextResponse.json({ url: result.checkoutUrl ?? result.ssoUrl ?? null });
}
