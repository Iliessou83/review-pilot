import type { Metadata, Viewport } from "next";
import "./globals.css";
import AnalyticsProvider from "@/components/AnalyticsProvider";
import EnregistrerSW from "@/components/EnregistrerSW";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://review-pilot-iota.vercel.app"),
  title: "Caela Réputation — Gestion d'avis Google automatisée",
  description: "Gestion de fiches Google Business Profile : suivi des avis, réponses selon le mandat choisi et pilotage de la réputation locale.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    title: "Caela Réputation — Gestion d'avis Google automatisée",
    description: "Répondez plus vite aux avis et pilotez votre réputation locale.",
    siteName: "Caela Réputation",
  },
  twitter: {
    card: "summary",
    title: "Caela Réputation — Gestion d'avis Google automatisée",
    description: "Répondez plus vite aux avis et pilotez votre réputation locale.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body style={{
        margin: 0, padding: 0,
        fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        background: "#fff",
        color: "#202124",
        minHeight: "100vh",
      }}>
        <AnalyticsProvider>{children}</AnalyticsProvider>
        <EnregistrerSW />
      </body>
    </html>
  );
}
