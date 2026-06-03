"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/businesses", label: "Businesses" },
  { href: "/reviews", label: "Reviews" },
  { href: "/pending", label: "Pending" },
];

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  return (
    <nav
      style={{
        background: "#111118",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 24px",
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "30px",
              height: "30px",
              background: "linear-gradient(135deg, #6c47ff, #9d7dff)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
            }}
          >
            ✦
          </div>
          <span
            style={{
              fontSize: "17px",
              fontWeight: 700,
              color: "#f8f8ff",
              letterSpacing: "-0.3px",
            }}
          >
            ReviewPilot
          </span>
        </div>

        {/* Nav links */}
        <div style={{ display: "flex", gap: "4px" }}>
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: "6px 14px",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: active ? 600 : 400,
                  color: active ? "#f8f8ff" : "rgba(248,248,255,0.5)",
                  background: active ? "rgba(108,71,255,0.2)" : "transparent",
                  textDecoration: "none",
                  transition: "all 0.15s",
                  border: active ? "1px solid rgba(108,71,255,0.3)" : "1px solid transparent",
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            padding: "6px 14px",
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "6px",
            color: "rgba(248,248,255,0.45)",
            fontSize: "13px",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.borderColor = "rgba(239,68,68,0.4)";
            (e.target as HTMLButtonElement).style.color = "#f87171";
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.1)";
            (e.target as HTMLButtonElement).style.color = "rgba(248,248,255,0.45)";
          }}
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
