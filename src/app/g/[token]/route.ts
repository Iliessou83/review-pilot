export const dynamic = "force-dynamic";

import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { reviewRequests, businesses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { resolveReviewLink } from "@/lib/collecte";

// Lien public envoyé par SMS. Marque le clic (mesure de la collecte) puis
// redirige le client vers la page d'avis Google du commerce.
export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { origin } = new URL(req.url);

  const [rr] = await db
    .select({ id: reviewRequests.id, businessId: reviewRequests.businessId, status: reviewRequests.status })
    .from(reviewRequests)
    .where(eq(reviewRequests.token, token))
    .limit(1);

  if (!rr) return NextResponse.redirect(`${origin}/`);

  // Idempotent : on n'écrase pas un premier clic déjà enregistré.
  if (rr.status !== "clicked") {
    await db
      .update(reviewRequests)
      .set({ status: "clicked", clickedAt: new Date() })
      .where(eq(reviewRequests.id, rr.id));
  }

  const [biz] = await db
    .select({ id: businesses.id, reviewLink: businesses.reviewLink })
    .from(businesses)
    .where(eq(businesses.id, rr.businessId))
    .limit(1);

  const link = biz ? await resolveReviewLink(biz) : null;
  return NextResponse.redirect(link || `${origin}/`);
}
