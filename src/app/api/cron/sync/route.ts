export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { cronAutorise, avecSignalement } from "@/lib/cronSignal";
import { db } from "@/lib/db";
import { businesses, reviews, reviewActivityEvents, loginAttempts, googleConnectionTickets } from "@/db/schema";
import { eq, and, lt } from "drizzle-orm";
import { processHighRatedReview, processLowRatedReview } from "@/lib/review-processing";
import { ADMIN_EMAILS } from "@/lib/auth";
import { maybeSendQuotaAlert } from "@/lib/plan-limits";
import { googleAccessToken } from "@/lib/google-oauth";
import { decryptToken } from "@/lib/token-crypto";

interface GoogleReview {
  name: string;
  reviewer: { displayName: string };
  starRating: string;
  comment?: string;
  createTime: string;
  reviewReply?: { comment?: string; updateTime?: string };
}

interface TrustpilotReview {
  id: string;
  consumer: { displayName: string };
  stars: number;
  text?: { review: string };
  createdAt: string;
}

const STAR_MAP: Record<string, number> = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };

async function syncGoogleReviews(business: typeof businesses.$inferSelect) {
  // platform_token = refresh_token OAuth → on génère un jeton d'accès frais.
  const access = await googleAccessToken(business);
  const created: (typeof reviews.$inferSelect)[] = [];
  const retentionCutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  let pageToken = "";
  let page = 0;

  do {
    const params = new URLSearchParams({ pageSize: "50", orderBy: "updateTime desc" });
    if (pageToken) params.set("pageToken", pageToken);
    const res = await fetch(
      `https://mybusiness.googleapis.com/v4/${business.platformId}/reviews?${params}`,
      { headers: { Authorization: `Bearer ${access}`, "Content-Type": "application/json" } }
    );
    if (!res.ok) throw new Error(`Google API ${res.status}`);
    const data = await res.json() as { reviews?: GoogleReview[]; nextPageToken?: string };

    for (const gr of data.reviews ?? []) {
      if (new Date(gr.createTime).getTime() < retentionCutoff) continue;
      const [saved] = await db.insert(reviews).values({
        businessId: business.id, platformReviewId: gr.name,
        authorName: gr.reviewer.displayName,
        rating: STAR_MAP[gr.starRating] || 3,
        text: gr.comment || "",
        publishedAt: new Date(gr.createTime),
        responded: Boolean(gr.reviewReply),
        responseText: gr.reviewReply?.comment || null,
        respondedAt: gr.reviewReply?.updateTime ? new Date(gr.reviewReply.updateTime) : null,
        platform: "google",
      }).onConflictDoNothing().returning();
      if (saved) {
        await db.insert(reviewActivityEvents).values({
          businessId: business.id,
          platform: "google",
          eventType: "review_detected",
          handlingMode: "manual",
        });
        created.push(saved);
      }
    }
    pageToken = data.nextPageToken || "";
    page++;
  } while (pageToken && page < 10);
  return created;
}

async function syncTrustpilotReviews(business: typeof businesses.$inferSelect) {
  if (process.env.ENABLE_TRUSTPILOT_INTEGRATION !== "true") {
    throw new Error("Trustpilot integration disabled pending licence validation");
  }
  const res = await fetch(
    `https://api.trustpilot.com/v1/business-units/${business.platformId}/reviews?pageSize=50`,
    { headers: { apikey: decryptToken(business.platformToken) } }
  );
  if (!res.ok) throw new Error(`Trustpilot API ${res.status}`);
  const data = await res.json() as { reviews?: TrustpilotReview[] };
  const created: (typeof reviews.$inferSelect)[] = [];

  for (const tr of data.reviews ?? []) {
    const [saved] = await db.insert(reviews).values({
        businessId: business.id, platformReviewId: tr.id,
        authorName: tr.consumer.displayName, rating: tr.stars,
        text: tr.text?.review || "",
        publishedAt: new Date(tr.createdAt),
        responded: false, platform: "trustpilot",
      }).onConflictDoNothing().returning();
    if (saved) {
      await db.insert(reviewActivityEvents).values({
        businessId: business.id,
        platform: "trustpilot",
        eventType: "review_detected",
        handlingMode: "manual",
      });
      created.push(saved);
    }
  }
  return created;
}

async function handler(request: Request) {
  if (!cronAutorise(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return await runSync();
  } catch (err) {
    console.error("Cron sync fatal error:", err);
    return NextResponse.json({ error: "Internal error", detail: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

async function runSync() {
  // Les compteurs anti-bruteforce sont temporaires. Leur purge évite de faire
  // grossir login_attempts indéfiniment, sans toucher aux données métier.
  await db.delete(loginAttempts).where(lt(loginAttempts.resetAt, new Date()));
  await db.delete(googleConnectionTickets).where(lt(googleConnectionTickets.expiresAt, new Date()));
  const allBusinesses = await db.select().from(businesses);
  const results: Record<string, { synced: number; processed: number; errors: string[] }> = {};

  for (const business of allBusinesses) {
    results[business.name] = { synced: 0, processed: 0, errors: [] };
    try {
      const newReviews = business.platform === "google"
        ? await syncGoogleReviews(business)
        : await syncTrustpilotReviews(business);

      results[business.name].synced = newReviews.length;

      for (const review of newReviews) {
        // Une réponse peut déjà exister sur Google avant la connexion à Caela.
        // Elle n'est jamais remplacée et ne déclenche aucune suggestion.
        if (review.responded) continue;
        try {
          if (
            review.rating >= 4 &&
            business.autoReply5Star &&
            (business.platform !== "google" || process.env.ENABLE_GOOGLE_REVIEW_AUTOMATION === "true")
          ) {
            await processHighRatedReview(review, business);
          } else {
            await processLowRatedReview(review, business);
          }
          results[business.name].processed++;
        } catch (err) {
          results[business.name].errors.push(`Review ${review.id}: ${err instanceof Error ? err.message : "error"}`);
          console.error(`Review ${review.id} processing error:`, err);
        }
      }

      // Alerte quota (90%/dépassé) — jamais de blocage, juste prévenir le client.
      // Les comptes super-admin ne sont jamais concernés (pas de facturation interne).
      if (newReviews.length > 0 && !ADMIN_EMAILS.includes(business.ownerEmail.toLowerCase())) {
        await maybeSendQuotaAlert(business.ownerEmail, business.name).catch((err) =>
          console.error(`Quota alert failed for ${business.name}:`, err)
        );
      }
    } catch (err) {
      results[business.name].errors.push(`Sync failed: ${err instanceof Error ? err.message : "error"}`);
      console.error(`Sync error for ${business.name}:`, err);
    }
  }

  return NextResponse.json({ ok: true, results });
}

export const GET = avecSignalement("/api/cron/sync", handler);
