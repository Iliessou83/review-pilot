"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const G = { blue: "#1A73E8", red: "#EA4335", yellow: "#FBBC04", green: "#34A853" };

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: "📊", exact: true },
  { href: "/businesses", label: "Établissements", icon: "🏢", exact: false },
  { href: "/reviews", label: "Avis", icon: "⭐", exact: false },
  { href: "/pending", label: "En attente", icon: "⏳", exact: false, badge: true },
  { href: "/dashboard/analytics", label: "Analytics", icon: "📈", exact: false },
  { href: "/dashboard/settings", label: "Paramètres", icon: "⚙️", exact: false },
];

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/pending/count").then(r => r.json()).then((d: { count?: number }) => {
      if (typeof d.count === "number") setPendingCount(d.count);
    }).catch(() => {});

    setLastSync(new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }));
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  function isActive(link: typeof NAV_LINKS[0]) {
    if (link.exact) return pathname === link.href;
    return pathname === link.href || pathname.startsWith(link.href + "/");
  }

  return (
    <>
      {/* Top bar */}
      <nav style={{
        background: "#fff",
        borderBottom: "1px solid #DADCE0",
        position: "sticky",
        top: 0,
        zIndex: 50,
        height: "60px",
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        justifyContent: "space-between",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: "220px" }}>
          <div style={{ display: "flex", gap: "3px" }}>
            {[G.blue, G.red, G.yellow, G.green].map((c, i) => (
              <div key={i} style={{ width: "8px", height: "8px", borderRadius: "50%", background: c }} />
            ))}
          </div>
          <span style={{ fontSize: "17px", fontWeight: 700, color: "#202124", letterSpacing: "-0.3px" }}>
            Caela Réputation
          </span>
          <span style={{ fontSize: "10px", fontWeight: 600, padding: "2px 7px", background: "#E8F0FE", color: G.blue, borderRadius: "10px" }}>
            by Caela
          </span>
        </div>

        {/* Nav links */}
        <div style={{ display: "flex", gap: "2px", flex: 1, justifyContent: "center" }}>
          {NAV_LINKS.map((link) => {
            const active = isActive(link);
            return (
              <Link key={link.href} href={link.href} style={{
                padding: "6px 12px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: active ? 600 : 400,
                color: active ? G.blue : "#5F6368",
                background: active ? "#E8F0FE" : "transparent",
                textDecoration: "none",
                transition: "all 0.15s",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                position: "relative",
              }}>
                <span style={{ fontSize: "12px" }}>{link.icon}</span>
                {link.label}
                {link.badge && pendingCount > 0 && (
                  <span style={{
                    fontSize: "10px", fontWeight: 700,
                    background: G.red, color: "#fff",
                    borderRadius: "10px", padding: "1px 5px",
                    minWidth: "16px", textAlign: "center",
                  }}>
                    {pendingCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Right: sync status + logout */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: "220px", justifyContent: "flex-end" }}>
          {lastSync && (
            <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", color: "#80868B" }}>
              <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: G.green }} />
              Sync {lastSync}
            </div>
          )}
          <button
            onClick={handleLogout}
            style={{
              padding: "6px 14px",
              background: "transparent",
              border: "1px solid #DADCE0",
              borderRadius: "8px",
              color: "#5F6368",
              fontSize: "13px",
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { (e.currentTarget).style.borderColor = G.red; (e.currentTarget).style.color = G.red; }}
            onMouseLeave={e => { (e.currentTarget).style.borderColor = "#DADCE0"; (e.currentTarget).style.color = "#5F6368"; }}
          >
            Déconnexion
          </button>
        </div>
      </nav>
    </>
  );
}
