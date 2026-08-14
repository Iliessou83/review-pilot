import type { MetadataRoute } from "next";

// Rend le site installable sur téléphone (Android et iPhone).
// À adapter : nom, couleurs, icônes. Les icônes 192 et 512 sont obligatoires,
// sans elles Android refuse purement et simplement d'installer.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Caela Réputation",
    short_name: "Réputation",
    description: "Réponses automatiques aux avis Google par IA — Caela Agency.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1A73E8",
    lang: "fr",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
