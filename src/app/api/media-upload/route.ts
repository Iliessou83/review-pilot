export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { db } from "@/lib/db";
import { businesses, posts } from "@/db/schema";
import { eq } from "drizzle-orm";

const MAX_BYTES = 80 * 1024 * 1024; // 80 Mo — large assez pour une courte vidéo téléphone
const ALLOWED_IMAGE = new Set(["image/jpeg", "image/png", "image/webp", "image/heic"]);
const ALLOWED_VIDEO = new Set(["video/mp4", "video/quicktime", "video/webm"]);

// Public, SANS authentification : c'est le point d'entrée du lien qu'on donne
// au client. Le seul secret est le jeton dans l'URL (mediaUploadToken), non
// devinable (32 caractères hex). Ne jamais exposer d'ID interne ni de liste
// de posts existants ici — uniquement accepter un dépôt.
export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Lien invalide" }, { status: 400 });

  const [business] = await db.select().from(businesses).where(eq(businesses.mediaUploadToken, token)).limit(1);
  if (!business) return NextResponse.json({ error: "Lien invalide ou expiré" }, { status: 404 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
  }

  const file = form.get("file");
  const caption = String(form.get("caption") || "").slice(0, 500);
  if (!(file instanceof File)) return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Fichier trop volumineux (80 Mo max)" }, { status: 413 });

  const isImage = ALLOWED_IMAGE.has(file.type);
  const isVideo = ALLOWED_VIDEO.has(file.type);
  if (!isImage && !isVideo) {
    return NextResponse.json({ error: "Format non accepté (photo JPEG/PNG/WEBP ou vidéo MP4/MOV/WEBM)" }, { status: 415 });
  }

  const blob = await put(`media/${business.id}/${Date.now()}-${file.name}`, file, {
    access: "public",
    addRandomSuffix: true,
  });

  const [created] = await db
    .insert(posts)
    .values({
      businessId: business.id,
      // Brouillon vide de contenu tant que l'équipe n'a pas écrit le texte du
      // post — la légende du client sert de matière première, pas de post final.
      content: caption || "(à rédiger)",
      mediaUrl: blob.url,
      mediaType: isVideo ? "video" : "image",
      source: "client",
      status: "brouillon",
    })
    .returning();

  return NextResponse.json({ ok: true, id: created.id });
}
