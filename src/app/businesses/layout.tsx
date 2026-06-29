import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import NavBar from "@/components/NavBar";

export default async function BusinessesLayout({
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
