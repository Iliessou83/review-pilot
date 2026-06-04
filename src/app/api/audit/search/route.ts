export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { name, city } = await request.json() as { name: string; city: string };
    if (!name || !city) return NextResponse.json({ error: "Champs manquants" }, { status: 400 });

    const apiKey = process.env.GCP_API_KEY || process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      // Fallback mock pour démo si pas de clé
      return NextResponse.json({ candidates: [] });
    }

    const query = encodeURIComponent(`${name} ${city}`);
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${query}&inputtype=textquery&fields=place_id,name,formatted_address,rating,user_ratings_total,photos,business_status,types&language=fr&key=${apiKey}`
    );
    const data = await res.json();

    if (!data.candidates?.length) {
      // Try broader search
      const res2 = await fetch(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&language=fr&key=${apiKey}`
      );
      const data2 = await res2.json();
      const results = (data2.results || []).slice(0, 4).map((p: Record<string, unknown>) => ({
        place_id: p.place_id,
        name: p.name,
        address: p.formatted_address,
        rating: p.rating || null,
        reviewCount: p.user_ratings_total || 0,
        type: Array.isArray(p.types) ? (p.types as string[])[0]?.replace(/_/g, " ") : "",
      }));
      return NextResponse.json({ candidates: results });
    }

    const candidates = data.candidates.slice(0, 4).map((p: Record<string, unknown>) => ({
      place_id: p.place_id,
      name: p.name,
      address: p.formatted_address,
      rating: p.rating || null,
      reviewCount: p.user_ratings_total || 0,
      type: Array.isArray(p.types) ? (p.types as string[])[0]?.replace(/_/g, " ") : "",
    }));

    return NextResponse.json({ candidates });
  } catch (err) {
    console.error("Search error:", err);
    return NextResponse.json({ candidates: [] });
  }
}
