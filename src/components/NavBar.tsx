"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const G = { blue: "#1A73E8", red: "#EA4335", yellow: "#FBBC04", green: "#34A853" };

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: "📊", exact: true },
  { href: "/businesses", label: "Établissements", icon: "🏢", exact: false },
  { href: "/reviews", label: "Avis", icon: "⭐", exact: false },
  { href: "/dashboard/roue", label: "Roue", icon: "🎡", exact: false },
  { href: "/pending", label: "En attente", icon: "⏳", exact: false, badge: true },
  { href: "/dashboard/analytics", label: "Analytics", icon: "📈", exact: false },
  { href: "/dashboard/insights", label: "Insights IA", icon: "🧠", exact: false },
  { href: "/dashboard/widget", label: "Widget", icon: "🔗", exact: false },
  { href: "/dashboard/settings", label: "Paramètres", icon: "⚙️", exact: false },
];

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/pending/count").then(r => r.json()).then((d: { count?: number }) => {
      if (typeof d.count === "number") setPendingCount(d.count);
    }).catch(() => {});

    setLastSync(new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }));

    const mq = window.matchMedia("(max-width: 860px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Ferme le menu à chaque changement de page.
  useEffect(() => { setMenuOpen(false); }, [pathname]);

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
        padding: isMobile ? "0 16px" : "0 24px",
        justifyContent: "space-between",
        gap: "12px",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0, flexShrink: 1 }}>
          <div style={{ display: "flex", gap: "3px", flexShrink: 0 }}>
            {[G.blue, G.red, G.yellow, G.green].map((c, i) => (
              <div key={i} style={{ width: "8px", height: "8px", borderRadius: "50%", background: c }} />
            ))}
          </div>
          <span style={{ fontSize: isMobile ? "15px" : "17px", fontWeight: 700, color: "#202124", letterSpacing: "-0.3px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            Caela Réputation
          </span>
          {!isMobile && (
            <span style={{ fontSize: "10px", fontWeight: 600, padding: "2px 7px", background: "#E8F0FE", color: G.blue, borderRadius: "10px", flexShrink: 0 }}>
              by Caela
            </span>
          )}
        </div>

        {/* Desktop: nav links centrés */}
        {!isMobile && (
          <div style={{ display: "flex", gap: "2px", flex: 1, justifyContent: "center", flexWrap: "wrap" }}>
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
                  whiteSpace: "nowrap",
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
        )}

        {/* Desktop: sync status + logout */}
        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: "12px", justifyContent: "flex-end", flexShrink: 0 }}>
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
            >
              Déconnexion
            </button>
          </div>
        )}

        {/* Mobile: bouton burger */}
        {isMobile && (
          <button
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={menuOpen}
            style={{
              flexShrink: 0,
              width: "42px", height: "42px",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: "4px",
              background: menuOpen ? "#E8F0FE" : "transparent",
              border: "1px solid #DADCE0", borderRadius: "10px",
              cursor: "pointer", padding: 0,
              position: "relative",
            }}
          >
            <span style={{ display: "block", width: "18px", height: "2px", background: "#202124", borderRadius: "2px" }} />
            <span style={{ display: "block", width: "18px", height: "2px", background: "#202124", borderRadius: "2px" }} />
            <span style={{ display: "block", width: "18px", height: "2px", background: "#202124", borderRadius: "2px" }} />
            {pendingCount > 0 && !menuOpen && (
              <span style={{ position: "absolute", top: "-5px", right: "-5px", fontSize: "10px", fontWeight: 700, background: G.red, color: "#fff", borderRadius: "10px", padding: "1px 5px", minWidth: "16px", textAlign: "center" }}>
                {pendingCount}
              </span>
            )}
          </button>
        )}
      </nav>

      {/* Mobile: panneau déroulant */}
      {isMobile && menuOpen && (
        <div style={{
          position: "sticky", top: "60px", zIndex: 49,
          background: "#fff", borderBottom: "1px solid #DADCE0",
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          padding: "10px 16px 14px",
          display: "flex", flexDirection: "column", gap: "2px",
        }}>
          {NAV_LINKS.map((link) => {
            const active = isActive(link);
            return (
              <Link key={link.href} href={link.href} style={{
                padding: "13px 14px",
                borderRadius: "10px",
                fontSize: "15px",
                fontWeight: active ? 600 : 400,
                color: active ? G.blue : "#202124",
                background: active ? "#E8F0FE" : "transparent",
                textDecoration: "none",
                display: "flex", alignItems: "center", gap: "10px",
              }}>
                <span style={{ fontSize: "16px" }}>{link.icon}</span>
                {link.label}
                {link.badge && pendingCount > 0 && (
                  <span style={{ marginLeft: "auto", fontSize: "11px", fontWeight: 700, background: G.red, color: "#fff", borderRadius: "10px", padding: "2px 7px" }}>
                    {pendingCount}
                  </span>
                )}
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            style={{
              marginTop: "6px", padding: "13px 14px",
              background: "transparent", border: "1px solid #DADCE0",
              borderRadius: "10px", color: "#5F6368",
              fontSize: "15px", cursor: "pointer", fontFamily: "inherit",
              textAlign: "left",
            }}
          >
            Déconnexion
          </button>
        </div>
      )}
    </>
  );
}
