import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Caela Réputation — Gestion d'avis Google automatisée",
  description: "IA spécialisée fiches Google Business. Réponses automatiques, optimisation de fiche, référencement local.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{
        margin: 0, padding: 0,
        fontFamily: "'Google Sans', 'Roboto', system-ui, sans-serif",
        background: "#fff",
        color: "#202124",
        minHeight: "100vh",
      }}>
        {children}
      </body>
    </html>
  );
}
