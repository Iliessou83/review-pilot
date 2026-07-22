"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const G = { blue: "#1A73E8", red: "#EA4335", yellow: "#FBBC04", green: "#34A853" };

// Palette de sections — couleurs statiques (jamais générées dynamiquement),
// une par groupe fonctionnel du menu. Réutilise l'identité Google déjà en
// place (bleu/vert/jaune) + un gris neutre pour le compte.
const SECTION_COLOR = {
  blue: "#1A73E8",
  green: "#0F9D58",
  amber: "#B06000",
  slate: "#5F6368",
} as const;
type SectionColor = keyof typeof SECTION_COLOR;

const NAV_LINKS: Array<{
  href: string;
  label: string;
  short: string;
  icon: string;
  exact: boolean;
  badge?: boolean;
  section: string;
  color: SectionColor;
}> = [
  { href: "/dashboard", label: "Dashboard", short: "Accueil", icon: "📊", exact: true, section: "Vue d'ensemble", color: "blue" },

  { href: "/businesses", label: "Établissements", short: "Établ.", icon: "🏢", exact: false, section: "Avis & collecte", color: "green" },
  { href: "/reviews", label: "Avis", short: "Avis", icon: "⭐", exact: false, section: "Avis & collecte", color: "green" },
  { href: "/dashboard/roue", label: "Roue", short: "Roue", icon: "🎡", exact: false, section: "Avis & collecte", color: "green" },
  { href: "/dashboard/collecte", label: "Collecte", short: "Collecte", icon: "📩", exact: false, section: "Avis & collecte", color: "green" },
  { href: "/pending", label: "En attente", short: "Attente", icon: "⏳", exact: false, badge: true, section: "Avis & collecte", color: "green" },

  { href: "/dashboard/analytics", label: "Analytics", short: "Stats", icon: "📈", exact: false, section: "Pilotage", color: "amber" },
  { href: "/dashboard/insights", label: "Insights IA", short: "Insights", icon: "🧠", exact: false, section: "Pilotage", color: "amber" },

  { href: "/dashboard/widget", label: "Widget", short: "Widget", icon: "🔗", exact: false, section: "Compte", color: "slate" },
  { href: "/dashboard/settings", label: "Paramètres", short: "Réglages", icon: "⚙️", exact: false, section: "Compte", color: "slate" },
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

    // Vraie dernière synchro Google/Trustpilot réussie (stockée en base), pas
    // l'heure de chargement de la page. On prend la plus récente parmi tous
    // les commerces visibles.
    fetch("/api/businesses")
      .then(r => (r.ok ? r.json() : []))
      .then((d: Array<{ lastSyncedAt?: string | null }>) => {
        if (!Array.isArray(d) || d.length === 0) return;
        const dates = d.map(b => b.lastSyncedAt ? new Date(b.lastSyncedAt).getTime() : 0).filter(t => t > 0);
        if (dates.length === 0) return;
        const mostRecent = new Date(Math.max(...dates));
        setLastSync(mostRecent.toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }));
      })
      .catch(() => {});

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

  // Groupe les liens par section en conservant l'ordre de déclaration.
  const sections: Array<{ name: string; items: typeof NAV_LINKS }> = [];
  for (const link of NAV_LINKS) {
    let sec = sections.find(s => s.name === link.section);
    if (!sec) { sec = { name: link.section, items: [] }; sections.push(sec); }
    sec.items.push(link);
  }

  return (
    <>
      {/* Effet relief au survol des liens de nav (impossible en style inline,
          d'où cette feuille de style dédiée avec classes statiques par couleur). */}
      <style>{`
        .rp-nav-link { transition: transform 0.15s, box-shadow 0.15s, background 0.15s, color 0.15s; }
        .rp-nav-link:not(.rp-nav-active):hover {
          background: #fff;
          box-shadow: 0 4px 12px rgba(60,64,67,0.14);
          transform: translateY(-1px);
          color: var(--rp-nav-c, #5F6368);
        }
        .rp-nav-mobile-link:not(.rp-nav-active):hover {
          background: #F8F9FA;
        }
      `}</style>

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

        {/* Desktop: nav links centrés, groupés par section avec séparateurs */}
        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: "2px", flex: 1, justifyContent: "center", flexWrap: "wrap" }}>
            {sections.map((sec, si) => (
              <div key={sec.name} style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                {si > 0 && (
                  <div style={{ width: "1px", height: "20px", background: "#DADCE0", margin: "0 8px" }} aria-hidden="true" />
                )}
                {sec.items.map((link) => {
                  const active = isActive(link);
                  const color = SECTION_COLOR[link.color];
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      title={sec.name}
                      className={`rp-nav-link${active ? " rp-nav-active" : ""}`}
                      style={{
                        "--rp-nav-c": color,
                        padding: "6px 12px",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: active ? 600 : 400,
                        color: active ? color : "#5F6368",
                        background: active ? color + "15" : "transparent",
                        textDecoration: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        position: "relative",
                        whiteSpace: "nowrap",
                      } as React.CSSProperties}
                    >
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
            ))}
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

      {/* Mobile: panneau déroulant, groupé par section */}
      {isMobile && menuOpen && (
        <div style={{
          position: "sticky", top: "60px", zIndex: 49,
          background: "#fff", borderBottom: "1px solid #DADCE0",
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          padding: "10px 16px 14px",
          display: "flex", flexDirection: "column", gap: "10px",
          maxHeight: "calc(100vh - 60px)",
          overflowY: "auto",
        }}>
          {sections.map((sec) => (
            <div key={sec.name}>
              <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: SECTION_COLOR[sec.items[0].color], margin: "4px 0 4px 4px" }}>
                {sec.name}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                {sec.items.map((link) => {
                  const active = isActive(link);
                  const color = SECTION_COLOR[link.color];
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`rp-nav-mobile-link${active ? " rp-nav-active" : ""}`}
                      style={{
                        padding: "13px 14px",
                        borderRadius: "10px",
                        fontSize: "15px",
                        fontWeight: active ? 600 : 400,
                        color: active ? color : "#202124",
                        background: active ? color + "15" : "transparent",
                        textDecoration: "none",
                        display: "flex", alignItems: "center", gap: "10px",
                      }}
                    >
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
              </div>
            </div>
          ))}
          <button
            onClick={handleLogout}
            style={{
              marginTop: "4px", padding: "13px 14px",
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
