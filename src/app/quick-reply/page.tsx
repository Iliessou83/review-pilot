import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { jwtVerify } from "jose";
import { db } from "@/lib/db";
import { businesses, pendingResponses, reviews } from "@/db/schema";
import { getJwtSecret } from "@/lib/auth";
import QuickReplyClient from "./QuickReplyClient";

export const dynamic = "force-dynamic";

export default async function QuickReplyPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const token = (await searchParams).t;
  if (!token) redirect("/quick-reply/error");

  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    const pendingId = typeof payload.pendingId === "number" ? payload.pendingId : null;
    const choice = typeof payload.choice === "number" ? payload.choice : null;
    if (pendingId === null || choice === null || choice < 0 || choice > 2) redirect("/quick-reply/error");

    const [pending] = await db.select().from(pendingResponses).where(eq(pendingResponses.id, pendingId)).limit(1);
    if (!pending) redirect("/quick-reply/error");

    const [review] = await db.select().from(reviews).where(eq(reviews.id, pending.reviewId)).limit(1);
    if (!review) redirect("/quick-reply/error");

    const [business] = await db
      .select({ name: businesses.name })
      .from(businesses)
      .where(eq(businesses.id, review.businessId))
      .limit(1);
    if (!business) redirect("/quick-reply/error");

    const suggestions = pending.suggestions as string[];
    const responseText = suggestions[choice];
    if (!responseText) redirect("/quick-reply/error");

    return (
      <QuickReplyClient
        token={token}
        businessName={business.name}
        authorName={review.authorName}
        rating={review.rating}
        reviewText={review.text}
        responseText={responseText}
        alreadySent={pending.status === "sent" || review.responded}
      />
    );
  } catch {
    redirect("/quick-reply/error");
  }
}
