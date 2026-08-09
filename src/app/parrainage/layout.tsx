import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import NavBar from "@/components/NavBar";

// Manquait jusqu'au 08/08 : /parrainage était la seule page du dashboard sans
// ce layout, donc sans tabbar — impossible de naviguer vers une autre section
// sans repasser par "← Mon dashboard". Alignée sur businesses/reviews/pending.
export default async function ParrainageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/");

  return (
    <div style={{ minHeight: "100vh", background: "#F8F9FA" }}>
      <NavBar />
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" }}>
        {children}
      </main>
    </div>
  );
}
