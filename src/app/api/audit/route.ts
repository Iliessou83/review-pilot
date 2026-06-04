export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { Resend } from "resend";

const claude = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;
const resend = new Resend(process.env.RESEND_API_KEY || "placeholder");

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

function computeScore(place: Record<string, unknown> | null, name: string): {
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

  // Rating (30 pts)
  const rating = (place.rating as number) || 0;
  if (rating >= 4.5) { score += 30; insights.push({ label: `Note Google : ${rating.toFixed(1)} ★`, status: "good", detail: "Excellente note. Continuez à répondre rapidement." }); }
  else if (rating >= 4.0) { score += 20; insights.push({ label: `Note Google : ${rating.toFixed(1)} ★`, status: "warn", detail: "Bonne note mais perfectible. Quelques réponses bien rédigées suffisent." }); }
  else if (rating >= 3.0) { score += 10; insights.push({ label: `Note Google : ${rating.toFixed(1)} ★`, status: "bad", detail: "Note insuffisante. Des clients choisissent vos concurrents à cause de ça." }); }
  else { score += 0; insights.push({ label: `Note Google : ${rating.toFixed(1)} ★`, status: "bad", detail: "Note critique. Action immédiate requise." }); }

  // Review count (20 pts)
  const reviewCount = (place.user_ratings_total as number) || 0;
  if (reviewCount >= 100) { score += 20; insights.push({ label: `${reviewCount} avis`, status: "good", detail: "Volume solide. Google vous positionne bien dans Maps." }); }
  else if (reviewCount >= 30) { score += 12; insights.push({ label: `${reviewCount} avis`, status: "warn", detail: "Volume correct mais en dessous de la moyenne de votre secteur." }); }
  else { score += 5; insights.push({ label: `${reviewCount} avis`, status: "bad", detail: "Trop peu d'avis. Les clients ne vous font pas encore confiance." }); }

  // Photos (15 pts)
  const photos = (place.photos as unknown[]) || [];
  if (photos.length >= 10) { score += 15; insights.push({ label: "Photos", status: "good", detail: `${photos.length} photos. Fiche bien illustrée.` }); }
  else if (photos.length >= 3) { score += 8; insights.push({ label: "Photos", status: "warn", detail: `Seulement ${photos.length} photos. Google favorise les fiches avec 10+ photos.` }); }
  else { score += 0; insights.push({ label: "Photos manquantes", status: "bad", detail: "Aucune ou très peu de photos. Perte de confiance immédiate." }); }

  // Website (10 pts)
  if (place.website) { score += 10; insights.push({ label: "Site web renseigné", status: "good", detail: "Lien vers votre site présent." }); }
  else { score += 0; insights.push({ label: "Site web absent", status: "warn", detail: "Pas de site web renseigné. Opportunité manquée." }); }

  // Phone (10 pts)
  if (place.international_phone_number) { score += 10; }

  // Business status (15 pts)
  if (place.business_status === "OPERATIONAL") { score += 15; }

  return { score: Math.min(score, 100), found: true, insights };
}

export async function POST(request: NextRequest) {
  try {
    const { name, city, email, placeId } = await request.json() as { name: string; city: string; email: string; placeId?: string };

    if (!name || !city || !email) {
      return NextResponse.json({ error: "Tous les champs sont requis." }, { status: 400 });
    }

    // Use placeId directly if provided, else search by name
    let place = null;
    if (placeId && placeId !== "url_provided") {
      place = await getPlaceById(placeId);
    } else if (!placeId) {
      place = await searchGooglePlace(name, city);
    }
    const { score, found, insights } = computeScore(place as Record<string, unknown> | null, name);

    // Generate priorities + recommendation with Claude
    const prompt = `Tu es un expert Google Business Profile. Analyse cette fiche et génère un rapport concis en JSON.

Établissement: "${name}" à ${city}
Trouvé sur Google: ${found}
Score calculé: ${score}/100
Note: ${place ? (place as Record<string, unknown>).rating : "N/A"}
Avis: ${place ? (place as Record<string, unknown>).user_ratings_total : 0}
Insights: ${insights.map(i => `${i.status}: ${i.label} — ${i.detail}`).join("\n")}

Génère exactement ce JSON (sans markdown):
{
  "priorities": ["action 1 concrète", "action 2 concrète", "action 3 concrète"],
  "recommendation": "phrase de recommandation commerciale courte (max 2 phrases) qui pousse à utiliser Caela Réputation"
}`;

    let priorities: string[] = [];
    let recommendation = "";

    try {
      if (!claude) throw new Error("No API key");
      const aiRes = await claude.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 400,
        messages: [{ role: "user", content: prompt }],
      });
      const text = aiRes.content[0]?.type === "text" ? aiRes.content[0].text : "";
      const parsed = JSON.parse(text.trim());
      priorities = parsed.priorities || [];
      recommendation = parsed.recommendation || "";
    } catch {
      priorities = [
        "Répondre à tous vos avis existants cette semaine",
        "Ajouter 10 photos récentes de qualité",
        "Compléter la description avec vos mots-clés locaux",
      ];
      recommendation = "Votre fiche a des axes d'amélioration prioritaires. Caela Réputation automatise la gestion des réponses et vous aide à monter votre note sous 30 jours.";
    }

    // Send email report
    const scoreColor = score >= 75 ? "#34A853" : score >= 50 ? "#FBBC04" : "#EA4335";
    const businessName = place ? String((place as Record<string, unknown>).name || name) : name;

    try {
      await resend.emails.send({
        from: "Caela Réputation <noreply@caela.fr>",
        to: email,
        subject: `📊 Votre audit Google — ${businessName} : ${score}/100`,
        html: `
          <div style="font-family:'Google Sans',system-ui,sans-serif;max-width:560px;margin:0 auto;background:#fff;">
            <div style="background:#1A73E8;padding:28px 32px;border-radius:16px 16px 0 0;">
              <div style="display:flex;align-items:center;gap:6px;margin-bottom:12px;">
                ${["rgba(255,255,255,0.9)","rgba(234,67,53,0.9)","rgba(251,188,4,0.9)","rgba(52,168,83,0.9)"].map(c=>`<div style="width:8px;height:8px;border-radius:50%;background:${c};display:inline-block;"></div>`).join("")}
                <span style="color:rgba(255,255,255,0.9);font-weight:700;font-size:13px;margin-left:4px;">Caela Réputation</span>
              </div>
              <h1 style="margin:0;font-size:22px;font-weight:800;color:#fff;">Audit de votre fiche Google</h1>
              <p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.8);">${businessName} · ${city}</p>
            </div>

            <div style="padding:28px 32px;">
              <div style="display:flex;align-items:center;gap:20px;margin-bottom:28px;padding:20px;background:#F8F9FA;border-radius:12px;">
                <div style="width:80px;height:80px;border-radius:50%;border:4px solid ${scoreColor};display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0;">
                  <span style="font-size:26px;font-weight:800;color:${scoreColor};line-height:1;">${score}</span>
                  <span style="font-size:11px;color:${scoreColor};font-weight:600;">/100</span>
                </div>
                <div>
                  <div style="font-size:18px;font-weight:800;color:#202124;">${score >= 75 ? "Bonne réputation" : score >= 50 ? "À améliorer" : "Urgent — action requise"}</div>
                  <div style="font-size:13px;color:#5F6368;margin-top:4px;">${found ? `Note Google : ${(place as Record<string,unknown>)?.rating ?? 0} ★ · ${(place as Record<string,unknown>)?.user_ratings_total ?? 0} avis` : "Fiche non trouvée sur Google Maps"}</div>
                </div>
              </div>

              <h3 style="font-size:15px;font-weight:700;color:#202124;margin:0 0 12px;">Points analysés :</h3>
              ${insights.map(ins => `
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
                ${priorities.map((p, i) => `<div style="font-size:13px;color:#5F6368;margin-bottom:6px;"><strong style="color:#1A73E8;">${i+1}.</strong> ${p}</div>`).join("")}
              </div>

              <div style="background:#E8F0FE;border-radius:10px;padding:16px;margin-bottom:24px;font-size:13px;color:#1A73E8;line-height:1.6;">
                ${recommendation}
              </div>

              <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://caela-reputation.vercel.app"}/#login" style="display:block;text-align:center;padding:14px;background:#1A73E8;color:#fff;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">
                Corriger ça avec Caela Réputation — Essai 14 jours →
              </a>
            </div>

            <div style="padding:16px 32px;border-top:1px solid #DADCE0;font-size:11px;color:#80868B;text-align:center;">
              Caela Réputation by Caela Agency · <a href="mailto:contact@caela.fr" style="color:#1A73E8;text-decoration:none;">contact@caela.fr</a>
              · Outil indépendant, non affilié à Google LLC.
            </div>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("Email send error:", emailErr);
    }

    return NextResponse.json({
      score,
      found,
      businessName,
      rating: found ? (place as Record<string, unknown>)?.rating as number || 0 : 0,
      reviewCount: found ? (place as Record<string, unknown>)?.user_ratings_total as number || 0 : 0,
      insights,
      priorities,
      recommendation,
    });

  } catch (err) {
    console.error("Audit error:", err);
    return NextResponse.json({ error: "Erreur lors de l'analyse. Réessayez." }, { status: 500 });
  }
}
