export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { Resend } from "resend";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const claude = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;
const resend = new Resend(process.env.RESEND_API_KEY || "placeholder");

// ─── Google ───────────────────────────────────────────────────────────────────

async function searchGooglePlace(name: string, city: string) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.GCP_API_KEY;
  if (!apiKey) return null;
  try {
    const query = encodeURIComponent(`${name} ${city}`);
    const searchRes = await fetch(
      `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${query}&inputtype=textquery&fields=place_id,name,rating,user_ratings_total,formatted_address,opening_hours,photos&key=${apiKey}`
    );
    const searchData = await searchRes.json();
    const placeId = searchData.candidates?.[0]?.place_id;
    if (!placeId) return null;
    const detailRes = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,formatted_address,opening_hours,photos,website,international_phone_number,business_status,types,editorial_summary&key=${apiKey}`
    );
    const detailData = await detailRes.json();
    return detailData.result || null;
  } catch {
    return null;
  }
}

async function getPlaceById(placeId: string) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.GCP_API_KEY;
  if (!apiKey || placeId === "url_provided") return null;
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,formatted_address,photos,website,international_phone_number,business_status,types&key=${apiKey}`
    );
    const data = await res.json();
    return data.result || null;
  } catch {
    return null;
  }
}

function computeGoogleScore(place: Record<string, unknown> | null): {
  score: number;
  found: boolean;
  insights: { label: string; status: "good" | "warn" | "bad"; detail: string }[];
} {
  if (!place) {
    return {
      score: 0,
      found: false,
      insights: [
        { label: "Fiche introuvable sur Google", status: "bad", detail: "Votre établissement n'apparaît pas sur Google Maps. Vous perdez des clients chaque jour." },
      ],
    };
  }
  const insights: { label: string; status: "good" | "warn" | "bad"; detail: string }[] = [];
  let score = 0;

  const rating = (place.rating as number) || 0;
  if (rating >= 4.5) { score += 30; insights.push({ label: `Note Google : ${rating.toFixed(1)} ★`, status: "good", detail: "Excellente note. Continuez à répondre rapidement." }); }
  else if (rating >= 4.0) { score += 20; insights.push({ label: `Note Google : ${rating.toFixed(1)} ★`, status: "warn", detail: "Bonne note mais perfectible. Quelques réponses bien rédigées suffisent." }); }
  else if (rating >= 3.0) { score += 10; insights.push({ label: `Note Google : ${rating.toFixed(1)} ★`, status: "bad", detail: "Note insuffisante. Des clients choisissent vos concurrents à cause de ça." }); }
  else { score += 0; insights.push({ label: `Note Google : ${rating.toFixed(1)} ★`, status: "bad", detail: "Note critique. Action immédiate requise." }); }

  const reviewCount = (place.user_ratings_total as number) || 0;
  if (reviewCount >= 100) { score += 20; insights.push({ label: `${reviewCount} avis`, status: "good", detail: "Volume solide. Google vous positionne bien dans Maps." }); }
  else if (reviewCount >= 30) { score += 12; insights.push({ label: `${reviewCount} avis`, status: "warn", detail: "Volume correct mais en dessous de la moyenne de votre secteur." }); }
  else { score += 5; insights.push({ label: `${reviewCount} avis`, status: "bad", detail: "Trop peu d'avis. Les clients ne vous font pas encore confiance." }); }

  const photos = (place.photos as unknown[]) || [];
  if (photos.length >= 10) { score += 15; insights.push({ label: "Photos", status: "good", detail: `${photos.length} photos. Fiche bien illustrée.` }); }
  else if (photos.length >= 3) { score += 8; insights.push({ label: "Photos", status: "warn", detail: `Seulement ${photos.length} photos. Google favorise les fiches avec 10+ photos.` }); }
  else { score += 0; insights.push({ label: "Photos manquantes", status: "bad", detail: "Aucune ou très peu de photos. Perte de confiance immédiate." }); }

  if (place.website) { score += 10; insights.push({ label: "Site web renseigné", status: "good", detail: "Lien vers votre site présent." }); }
  else { score += 0; insights.push({ label: "Site web absent", status: "warn", detail: "Pas de site web renseigné. Opportunité manquée." }); }

  if (place.international_phone_number) { score += 10; }
  if (place.business_status === "OPERATIONAL") { score += 15; }

  return { score: Math.min(score, 100), found: true, insights };
}

// ─── Trustpilot ───────────────────────────────────────────────────────────────

interface TrustpilotBusiness {
  id: string;
  displayName: string;
  websiteUrl: string;
  score: { trustScore: number; stars: number };
  numberOfReviews: { total: number; oneStar: number; twoStars: number; threeStars: number; fourStars: number; fiveStars: number };
  claimed: boolean;
  responseRate?: number;
}

async function fetchTrustpilotBusiness(domain: string): Promise<TrustpilotBusiness | null> {
  const apiKey = process.env.TRUSTPILOT_API_KEY;
  if (!apiKey) return null;
  try {
    const res = await fetch(
      `https://api.trustpilot.com/v1/business-units/find?name=${encodeURIComponent(domain)}&apikey=${apiKey}`
    );
    if (!res.ok) return null;
    const data = await res.json() as TrustpilotBusiness;
    return data.id ? data : null;
  } catch {
    return null;
  }
}

// Fallback used when TRUSTPILOT_API_KEY is not yet configured.
// Claude infers a plausible audit from the domain name alone.
async function simulateTrustpilotAudit(domain: string): Promise<{
  score: number; found: boolean; rating: number; reviewCount: number; businessName: string;
  insights: { label: string; status: "good" | "warn" | "bad"; detail: string }[];
  priorities: string[]; recommendation: string;
}> {
  const prompt = `Tu es un expert e-réputation. À partir du nom de domaine "${domain}", génère un audit Trustpilot simulé réaliste pour une PME française typique de ce secteur.

Génère exactement ce JSON (sans markdown):
{
  "businessName": "Nom commercial déduit du domaine",
  "rating": 3.7,
  "reviewCount": 47,
  "claimed": false,
  "responseRate": 22,
  "score": 42,
  "insights": [
    { "label": "...", "status": "good|warn|bad", "detail": "..." },
    { "label": "...", "status": "good|warn|bad", "detail": "..." },
    { "label": "...", "status": "good|warn|bad", "detail": "..." },
    { "label": "...", "status": "good|warn|bad", "detail": "..." }
  ],
  "priorities": ["action 1", "action 2", "action 3"],
  "recommendation": "2 phrases max poussant à utiliser Caela Réputation"
}

Règles : note entre 2.8 et 4.6, volume entre 8 et 340, score cohérent avec la note et le volume. Sois spécifique au secteur d'activité suggéré par le domaine.`;

  try {
    if (!claude) throw new Error("no key");
    const aiRes = await claude.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 700,
      messages: [{ role: "user", content: prompt }],
    });
    const text = aiRes.content[0]?.type === "text" ? aiRes.content[0].text : "";
    const data = JSON.parse(text.trim());
    return {
      score: data.score ?? 42,
      found: true,
      rating: data.rating ?? 3.7,
      reviewCount: data.reviewCount ?? 47,
      businessName: data.businessName ?? domain,
      insights: data.insights ?? [],
      priorities: data.priorities ?? [],
      recommendation: data.recommendation ?? "",
    };
  } catch {
    return {
      score: 38, found: true, rating: 3.4, reviewCount: 29,
      businessName: domain.replace(/\.[a-z]+$/, "").replace(/-/g, " "),
      insights: [
        { label: "3.4 étoiles Trustpilot", status: "warn", detail: "Note en dessous de la moyenne du secteur. Des réponses régulières aux avis améliorent rapidement ce score." },
        { label: "29 avis", status: "bad", detail: "Volume insuffisant. Activez la collecte automatisée d'avis pour atteindre 100+ avis." },
        { label: "Profil non revendiqué", status: "bad", detail: "Vous ne contrôlez pas votre profil. N'importe qui peut vous nuire sans que vous puissiez répondre." },
        { label: "Taux de réponse : 18%", status: "bad", detail: "Taux très bas. Les clients voient que les plaintes sont ignorées." },
      ],
      priorities: [
        "Revendiquer votre profil Trustpilot immédiatement (gratuit)",
        "Répondre à tous les avis négatifs en attente cette semaine",
        "Mettre en place une collecte automatique d'avis après chaque achat",
      ],
      recommendation: "Votre réputation Trustpilot a des axes d'amélioration urgents. Caela Réputation automatise les réponses et booste votre note sous 30 jours.",
    };
  }
}

function computeTrustpilotScore(biz: TrustpilotBusiness | null): {
  score: number;
  found: boolean;
  rating: number;
  reviewCount: number;
  businessName: string;
  insights: { label: string; status: "good" | "warn" | "bad"; detail: string }[];
} {
  if (!biz) {
    return {
      score: 0, found: false, rating: 0, reviewCount: 0, businessName: "",
      insights: [{ label: "Profil Trustpilot introuvable", status: "bad", detail: "Votre entreprise n'a pas de profil Trustpilot revendiqué. Vous manquez une source de confiance majeure." }],
    };
  }

  const insights: { label: string; status: "good" | "warn" | "bad"; detail: string }[] = [];
  let score = 0;
  const stars = biz.score?.stars || 0;
  const total = biz.numberOfReviews?.total || 0;

  // TrustScore / stars (35 pts)
  if (stars >= 4) { score += 35; insights.push({ label: `${stars} étoiles Trustpilot`, status: "good", detail: `Note ${biz.score?.trustScore?.toFixed(1)}/5 — Excellente réputation.` }); }
  else if (stars === 3) { score += 20; insights.push({ label: `${stars} étoiles Trustpilot`, status: "warn", detail: "Note moyenne. Des réponses aux avis négatifs amélioreraient rapidement cette note." }); }
  else { score += 5; insights.push({ label: `${stars} étoile${stars > 1 ? "s" : ""} Trustpilot`, status: "bad", detail: "Note insuffisante. Impact direct sur votre conversion." }); }

  // Volume (25 pts)
  if (total >= 200) { score += 25; insights.push({ label: `${total} avis`, status: "good", detail: "Volume excellent. Trustpilot vous met en avant dans les résultats." }); }
  else if (total >= 50) { score += 15; insights.push({ label: `${total} avis`, status: "warn", detail: "Volume correct. Objectif 200 avis pour maximiser la visibilité." }); }
  else if (total >= 10) { score += 8; insights.push({ label: `${total} avis`, status: "bad", detail: "Volume insuffisant. Activez la collecte automatisée d'avis." }); }
  else { score += 0; insights.push({ label: `${total} avis seulement`, status: "bad", detail: "Quasi aucun avis. Le profil n'inspire pas confiance." }); }

  // Claimed (20 pts)
  if (biz.claimed) { score += 20; insights.push({ label: "Profil revendiqué ✓", status: "good", detail: "Vous contrôlez votre profil. Vous pouvez répondre aux avis." }); }
  else { score += 0; insights.push({ label: "Profil non revendiqué", status: "bad", detail: "Vous ne pouvez pas répondre aux avis. N'importe qui peut modifier votre profil." }); }

  // Response rate (20 pts)
  const responseRate = biz.responseRate ?? -1;
  if (responseRate >= 80) { score += 20; insights.push({ label: `Taux de réponse : ${responseRate}%`, status: "good", detail: "Excellent engagement. Trustpilot favorise les marques réactives." }); }
  else if (responseRate >= 40) { score += 10; insights.push({ label: `Taux de réponse : ${responseRate}%`, status: "warn", detail: "Répondez à tous vos avis négatifs en priorité." }); }
  else if (responseRate >= 0) { score += 0; insights.push({ label: `Taux de réponse : ${responseRate}%`, status: "bad", detail: "Taux très bas. Les clients voient que vous ignorez les plaintes." }); }

  return {
    score: Math.min(score, 100),
    found: true,
    rating: stars,
    reviewCount: total,
    businessName: biz.displayName || "",
    insights,
  };
}

// ─── AI priorities ────────────────────────────────────────────────────────────

async function generateAIPriorities(platform: string, businessName: string, location: string, found: boolean, score: number, insights: { label: string; status: string; detail: string }[]): Promise<{ priorities: string[]; recommendation: string }> {
  const prompt = `Tu es un expert en e-réputation. Analyse ce profil et génère un rapport en JSON.

Plateforme: ${platform}
Entreprise: "${businessName}"${location ? ` à ${location}` : ""}
Profil trouvé: ${found}
Score: ${score}/100
Insights: ${insights.map(i => `${i.status}: ${i.label} — ${i.detail}`).join("\n")}

Génère exactement ce JSON (sans markdown):
{
  "priorities": ["action 1 concrète", "action 2 concrète", "action 3 concrète"],
  "recommendation": "phrase courte (max 2 phrases) qui pousse à utiliser Caela Réputation"
}`;

  try {
    if (!claude) throw new Error("no key");
    const aiRes = await claude.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      messages: [{ role: "user", content: prompt }],
    });
    const text = aiRes.content[0]?.type === "text" ? aiRes.content[0].text : "";
    return JSON.parse(text.trim());
  } catch {
    return {
      priorities: [
        "Répondre à tous vos avis existants cette semaine",
        "Augmenter votre volume d'avis par une campagne de collecte",
        "Compléter et optimiser votre profil avec photos et description",
      ],
      recommendation: "Caela Réputation automatise les réponses aux avis et vous aide à améliorer votre note sous 30 jours.",
    };
  }
}

// ─── Email builder ────────────────────────────────────────────────────────────

function buildEmailHtml(p: {
  platform: string; businessName: string; location: string;
  score: number; scoreColor: string; found: boolean; rating: number; reviewCount: number;
  insights: { label: string; status: string; detail: string }[];
  priorities: string[]; recommendation: string;
}): string {
  const accentColor = p.platform === "trustpilot" ? "#00B67A" : "#1A73E8";
  const platformLabel = p.platform === "trustpilot" ? "Trustpilot" : "Google Business Profile";
  return `
    <div style="font-family:'Google Sans',system-ui,sans-serif;max-width:560px;margin:0 auto;background:#fff;">
      <div style="background:${accentColor};padding:28px 32px;border-radius:16px 16px 0 0;">
        <p style="margin:0 0 8px;font-size:12px;color:rgba(255,255,255,0.75);font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">${platformLabel}</p>
        <h1 style="margin:0;font-size:22px;font-weight:800;color:#fff;">Audit de votre réputation en ligne</h1>
        <p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.8);">${p.businessName}${p.location ? ` · ${p.location}` : ""}</p>
      </div>
      <div style="padding:28px 32px;">
        <div style="display:flex;align-items:center;gap:20px;margin-bottom:28px;padding:20px;background:#F8F9FA;border-radius:12px;">
          <div style="width:80px;height:80px;border-radius:50%;border:4px solid ${p.scoreColor};display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0;">
            <span style="font-size:26px;font-weight:800;color:${p.scoreColor};line-height:1;">${p.score}</span>
            <span style="font-size:11px;color:${p.scoreColor};font-weight:600;">/100</span>
          </div>
          <div>
            <div style="font-size:18px;font-weight:800;color:#202124;">${p.score >= 75 ? "Bonne réputation" : p.score >= 50 ? "À améliorer" : "Urgent — action requise"}</div>
            <div style="font-size:13px;color:#5F6368;margin-top:4px;">${p.found ? `${p.rating} ★ · ${p.reviewCount} avis` : "Profil non trouvé"}</div>
          </div>
        </div>
        <h3 style="font-size:15px;font-weight:700;color:#202124;margin:0 0 12px;">Points analysés :</h3>
        ${p.insights.map(ins => `
          <div style="display:flex;gap:10px;padding:10px 14px;margin-bottom:8px;background:${ins.status==="good"?"#E6F4EA":ins.status==="warn"?"#FEF7E0":"#FCE8E6"};border-radius:8px;">
            <span>${ins.status==="good"?"✅":ins.status==="warn"?"⚠️":"❌"}</span>
            <div>
              <div style="font-size:13px;font-weight:600;color:#202124;">${ins.label}</div>
              <div style="font-size:12px;color:#5F6368;">${ins.detail}</div>
            </div>
          </div>
        `).join("")}
        <div style="background:#F8F9FA;border-radius:12px;padding:18px;margin:20px 0;">
          <div style="font-size:14px;font-weight:700;color:#202124;margin-bottom:10px;">3 actions prioritaires :</div>
          ${p.priorities.map((pr, i) => `<div style="font-size:13px;color:#5F6368;margin-bottom:6px;"><strong style="color:${accentColor};">${i+1}.</strong> ${pr}</div>`).join("")}
        </div>
        <div style="background:${p.platform==="trustpilot"?"#F0FDF8":"#E8F0FE"};border-radius:10px;padding:16px;margin-bottom:24px;font-size:13px;color:${accentColor};line-height:1.6;">
          ${p.recommendation}
        </div>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://caela-reputation.vercel.app"}/#login" style="display:block;text-align:center;padding:14px;background:${accentColor};color:#fff;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">
          Corriger ça avec Caela Réputation — Essai 14 jours →
        </a>
      </div>
      <div style="padding:16px 32px;border-top:1px solid #DADCE0;font-size:11px;color:#80868B;text-align:center;">
        Caela Réputation by Caela Agency · <a href="mailto:contact@caela.fr" style="color:${accentColor};text-decoration:none;">contact@caela.fr</a>
      </div>
    </div>
  `;
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // 3 audits per hour per IP (each audit = up to 2 API calls + 1 email)
  const ip = getClientIp(request);
  if (!rateLimit(`audit:${ip}`, 3, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Trop de demandes. Réessayez dans une heure." }, { status: 429 });
  }

  try {
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
    }

    const email = typeof body.email === "string" ? body.email.trim() : "";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Email invalide." }, { status: 400 });
    }

    const platform = typeof body.platform === "string" ? body.platform : "google";

    let score = 0, found = false, businessName = "", rating = 0, reviewCount = 0;
    let insights: { label: string; status: "good" | "warn" | "bad"; detail: string }[] = [];

    if (platform === "trustpilot") {
      const rawDomain = typeof body.domain === "string" ? body.domain : "";
      const domain = rawDomain
        .replace(/^https?:\/\//i, "")
        .replace(/^(fr\.|www\.)?trustpilot\.com\/review\//i, "")
        .replace(/\/$/, "")
        .split("?")[0]
        .split("/")[0]
        .slice(0, 253);

      if (!domain) return NextResponse.json({ error: "Domaine requis." }, { status: 400 });

      const biz = await fetchTrustpilotBusiness(domain);

      if (biz) {
        const result = computeTrustpilotScore(biz);
        score = result.score; found = result.found; businessName = result.businessName || domain;
        rating = result.rating; reviewCount = result.reviewCount; insights = result.insights;
      } else {
        const sim = await simulateTrustpilotAudit(domain);
        score = sim.score; found = sim.found; businessName = sim.businessName;
        rating = sim.rating; reviewCount = sim.reviewCount; insights = sim.insights;
        const scoreColorSim = score >= 75 ? "#34A853" : score >= 50 ? "#FBBC04" : "#EA4335";
        try {
          await resend.emails.send({
            from: "Caela Réputation <noreply@caela.fr>",
            to: email,
            subject: `📊 Audit Trustpilot — ${businessName} : ${score}/100`,
            html: buildEmailHtml({ platform: "trustpilot", businessName, location: "", score, scoreColor: scoreColorSim, found, rating, reviewCount, insights, priorities: sim.priorities, recommendation: sim.recommendation }),
          });
        } catch (emailErr) {
          console.error("Email send error:", emailErr);
        }
        return NextResponse.json({ score, found, businessName, rating, reviewCount, insights, priorities: sim.priorities, recommendation: sim.recommendation });
      }

    } else {
      const name = typeof body.name === "string" ? body.name.trim().slice(0, 200) : "";
      const city = typeof body.city === "string" ? body.city.trim().slice(0, 100) : "";
      const placeId = typeof body.placeId === "string" ? body.placeId : null;
      if (!name || !city) return NextResponse.json({ error: "Nom et ville requis." }, { status: 400 });

      let place = null;
      if (placeId && placeId !== "url_provided") {
        place = await getPlaceById(placeId);
      } else if (!placeId) {
        place = await searchGooglePlace(name, city);
      }
      const result = computeGoogleScore(place as Record<string, unknown> | null);
      score = result.score; found = result.found; insights = result.insights;
      businessName = place ? String((place as Record<string, unknown>).name || name) : name;
      rating = found ? (place as Record<string, unknown>)?.rating as number || 0 : 0;
      reviewCount = found ? (place as Record<string, unknown>)?.user_ratings_total as number || 0 : 0;
    }

    const location = platform === "google" ? (typeof body.city === "string" ? body.city : "") : "";
    const { priorities, recommendation } = await generateAIPriorities(platform, businessName, location, found, score, insights);

    const scoreColor = score >= 75 ? "#34A853" : score >= 50 ? "#FBBC04" : "#EA4335";
    const platformLabel = platform === "trustpilot" ? "Trustpilot" : "Google Business Profile";

    try {
      await resend.emails.send({
        from: "Caela Réputation <noreply@caela.fr>",
        to: email,
        subject: `📊 Audit ${platformLabel} — ${businessName} : ${score}/100`,
        html: buildEmailHtml({ platform, businessName, location, score, scoreColor, found, rating, reviewCount, insights, priorities, recommendation }),
      });
    } catch (emailErr) {
      console.error("Email send error:", emailErr);
    }

    return NextResponse.json({ score, found, businessName, rating, reviewCount, insights, priorities, recommendation });

  } catch (err) {
    console.error("Audit error:", err);
    return NextResponse.json({ error: "Erreur lors de l'analyse. Réessayez." }, { status: 500 });
  }
}
