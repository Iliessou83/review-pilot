import type { Review, Business } from "@/db/schema";
import { googleAccessToken } from "@/lib/google-oauth";
import { decryptToken } from "@/lib/token-crypto";

/**
 * Publication d'une réponse sur la plateforme d'origine de l'avis (Google / Trustpilot).
 * Factorisé ici pour être partagé par /api/reviews/[id]/respond ET /api/quick-reply
 * (le clic "1 clic" depuis l'email DOIT publier réellement, pas seulement écrire en base).
 * Lève une erreur si l'appel plateforme échoue — l'appelant ne marque "responded"
 * qu'en cas de succès.
 */

export async function postGoogleReply(
  reviewId: string,
  responseText: string,
  token: string
): Promise<void> {
  const response = await fetch(
    `https://mybusiness.googleapis.com/v4/${reviewId}/reply`,
    {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ comment: responseText }),
    }
  );
  if (!response.ok) throw new Error(`Google reply failed: ${response.status}`);
}

export async function postTrustpilotReply(
  businessUnitId: string,
  reviewId: string,
  responseText: string,
  apiKey: string
): Promise<void> {
  const response = await fetch(
    `https://api.trustpilot.com/v1/private/business-units/${businessUnitId}/reviews/${reviewId}/reply`,
    {
      method: "POST",
      headers: { apikey: apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ message: responseText }),
    }
  );
  if (!response.ok) throw new Error(`Trustpilot reply failed: ${response.status}`);
}

/** Publie sur la bonne plateforme selon `review.platform`. Lève en cas d'échec. */
export async function publishReply(
  review: Pick<Review, "platform" | "platformReviewId">,
  business: Pick<Business, "platformId" | "platformToken">,
  responseText: string
): Promise<void> {
  if (review.platform === "google") {
    // platform_token = refresh_token OAuth → jeton d'accès frais pour publier.
    const access = await googleAccessToken(business);
    await postGoogleReply(review.platformReviewId, responseText, access);
  } else {
    await postTrustpilotReply(
      business.platformId,
      review.platformReviewId,
      responseText,
      decryptToken(business.platformToken)
    );
  }
}
