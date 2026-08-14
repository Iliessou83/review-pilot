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
      <ChatBot />
      <InstallerApp
        nomApp="Caela Réputation"
        accroche="Installez le dashboard sur votre téléphone"
        detail="Répondez à vos avis Google en un geste, sans repasser par le navigateur."
        couleur="#1A73E8"
      />
    </div>
  );
}
