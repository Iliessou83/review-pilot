import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import NavBar from "@/components/NavBar";
import ChatBot from "@/components/ChatBot";
import InstallerApp from "@/components/InstallerApp";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/");
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F8F9FA" }}>
      <NavBar />
      <main
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "32px 24px",
        }}
      >
        {children}
      </main>
      <footer style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 28px", color: "#6B7280", fontSize: 12, lineHeight: 1.5 }}>
        Le commerçant reste propriétaire ou copropriétaire de sa fiche. Google Business Profile est disponible sans frais ; Caela facture uniquement ses services de gestion.{" "}
        <a href="https://support.google.com/business/answer/7163406?hl=fr" target="_blank" rel="noopener noreferrer" style={{ color: "#2457C5" }}>
          Informations Google : travailler avec un tiers
        </a>
      </footer>
      <ChatBot />
      <InstallerApp
        nomApp="Caela Réputation"
        accroche="Installez le dashboard sur votre téléphone"
        detail="Répondez à vos avis Google en un geste, sans repasser par le navigateur."
        couleur="#2457C5"
      />
    </div>
  );
}
