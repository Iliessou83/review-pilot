import type { NextConfig } from "next";

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

// La roue d'avis /r/[slug] est faite pour vivre sur le site du commerçant
// (Caela Embed). X-Frame-Options SAMEORIGIN l'en empêcherait, et cet en-tête
// ne connaît pas la notion de domaine autorisé : c'est le middleware qui pose
// une CSP frame-ancestors dérivée du jeton signé par le Hub.
const embeddableHeaders = securityHeaders.filter((h) => h.key !== "X-Frame-Options");

const nextConfig: NextConfig = {
  serverExternalPackages: ["bcryptjs"],
  async headers() {
    return [
      { source: "/r/:path*", headers: embeddableHeaders },
      { source: "/((?!r/).*)", headers: securityHeaders },
    ];
  },
};

export default nextConfig;
