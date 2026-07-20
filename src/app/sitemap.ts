import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://review-pilot.vercel.app";
  const now = new Date();

  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/audit`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/plaques-nfc`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/parrainage`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/cgv`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/mentions-legales`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/politique-de-confidentialite`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/politique-de-cookies`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];
}
