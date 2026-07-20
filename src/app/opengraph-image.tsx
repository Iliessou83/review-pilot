import { ImageResponse } from "next/og";

// Visuel Open Graph par défaut (partages LinkedIn/FB/X, aperçu Google). Généré
// dynamiquement — pas d'asset statique existant en /public. S'applique à toutes
// les pages publiques qui n'ont pas leur propre opengraph-image.tsx (Next.js
// remonte au segment parent le plus proche).
export const runtime = "edge";
export const alt = "Caela Réputation — Gestion d'avis Google automatisée";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const G = { blue: "#1A73E8", red: "#EA4335", yellow: "#FBBC04", green: "#34A853" };

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(160deg, #ffffff 0%, #F8F9FA 55%, #E8F0FE 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", gap: 14, marginBottom: 40 }}>
          {[G.blue, G.red, G.yellow, G.green].map((c) => (
            <div key={c} style={{ width: 28, height: 28, borderRadius: "50%", background: c }} />
          ))}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 76,
            fontWeight: 700,
            letterSpacing: "-2px",
            color: "#202124",
          }}
        >
          Caela Réputation
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 32,
            fontWeight: 500,
            color: "#5F6368",
          }}
        >
          Vos avis Google répondus. Automatiquement.
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 48,
            padding: "10px 24px",
            borderRadius: 999,
            background: "#E8F0FE",
            color: G.blue,
            fontSize: 24,
            fontWeight: 600,
          }}
        >
          by Caela
        </div>
      </div>
    ),
    { ...size }
  );
}
