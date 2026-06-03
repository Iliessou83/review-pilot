"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const G = { blue: "#1A73E8", red: "#EA4335", yellow: "#FBBC04", green: "#34A853" };

const NAV_LINKS = [
  { href: "/dashboard", label: "Tableau de bord", icon: "📊" },
  { href: "/businesses", label: "Établissements", icon: "🏢" },
  { href: "/reviews", label: "Avis", icon: "⭐" },
  { href: "/pending", label: "En attente", icon: "⏳" },
];

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  return (
    <nav style={{
      background: "#fff",
      borderBottom: "1px solid #DADCE0",
      position: "sticky",
      top: 0,
      zIndex: 50,
    }}>
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "0 24px",
        height: "60px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ display: "flex", gap: "3px" }}>
            {[G.blue, G.red, G.yellow, G.green].map((c, i) => (
              <div key={i} style={{ width: "8px", height: "8px", borderRadius: "50%", background: c }} />
            ))}
          </div>
          <span style={{ fontSize: "17px", fontWeight: 700, color: "#202124", letterSpacing: "-0.3px" }}>
            ReviewPilot
          </span>
        </div>

        {/* Nav links */}
        <div style={{ display: "flex", gap: "4px" }}>
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link key={link.href} href={link.href} style={{
                padding: "6px 14px",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: active ? 600 : 400,
                color: active ? G.blue : "#5F6368",
                background: active ? "#E8F0FE" : "transparent",
                textDecoration: "none",
                transition: "all 0.15s",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}>
                <span style={{ fontSize: "13px" }}>{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            padding: "7px 16px",
            background: "transparent",
            border: "1px solid #DADCE0",
            borderRadius: "6px",
            color: "#5F6368",
            fontSize: "13px",
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget).style.borderColor = "#EA4335";
            (e.currentTarget).style.color = "#EA4335";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget).style.borderColor = "#DADCE0";
            (e.currentTarget).style.color = "#5F6368";
          }}
        >
          Déconnexion
        </button>
      </div>
    </nav>
  );
}
