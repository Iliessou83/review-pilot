import type { Metadata } from "next";
import Link from "next/link";
import { BLOG_POSTS } from "@/data/blogPosts";

const G = { blue: "#1A73E8", red: "#EA4335", yellow: "#FBBC04", green: "#34A853" };

export const metadata: Metadata = {
  title: "Blog — Avis Google, e-réputation & SEO local | Caela Réputation",
  description:
    "Guides pratiques sur les avis Google, le classement local (SEO), la fiche Google Business Profile et la gestion de la réputation en ligne pour les commerces de proximité.",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export default function BlogIndexPage() {
  const posts = [...BLOG_POSTS].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div style={{ fontFamily: "'Google Sans', system-ui, sans-serif", background: "#fff", color: "#202124", minHeight: "100vh" }}>
      <nav style={{ borderBottom: "1px solid #DADCE0", padding: "0 24px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "#fff", zIndex: 100 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <div style={{ display: "flex", gap: "3px" }}>
            {[G.blue, G.red, G.yellow, G.green].map((c, i) => (
              <div key={i} style={{ width: "8px", height: "8px", borderRadius: "50%", background: c }} />
            ))}
          </div>
          <span style={{ fontWeight: 700, fontSize: "15px", color: "#202124" }}>Caela Réputation</span>
        </Link>
        <Link href="/" style={{ fontSize: "13px", color: "#5F6368", textDecoration: "none" }}>← Retour</Link>
      </nav>

      <div style={{ maxWidth: "880px", margin: "0 auto", padding: "56px 24px 80px" }}>
        <p style={{ fontSize: "13px", fontWeight: 700, color: G.blue, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 10px" }}>Blog</p>
        <h1 style={{ fontSize: "36px", fontWeight: 800, margin: "0 0 12px", letterSpacing: "-0.5px" }}>Avis Google & e-réputation</h1>
        <p style={{ fontSize: "16px", color: "#5F6368", lineHeight: 1.6, margin: "0 0 48px", maxWidth: "620px" }}>
          Guides pratiques pour les commerçants et indépendants : réponses aux avis, classement Google Maps, fiche Google Business Profile, collecte automatisée.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              style={{
                display: "block", padding: "24px 0", borderTop: "1px solid #DADCE0",
                textDecoration: "none", color: "inherit",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: G.green, background: "#E6F4EA", padding: "3px 10px", borderRadius: "12px" }}>
                  {post.category}
                </span>
                <span style={{ fontSize: "12px", color: "#80868B" }}>{formatDate(post.date)} · {post.readMinutes} min de lecture</span>
              </div>
              <h2 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 8px", color: "#202124" }}>{post.title}</h2>
              <p style={{ fontSize: "14px", color: "#5F6368", lineHeight: 1.6, margin: 0 }}>{post.excerpt}</p>
            </Link>
          ))}
        </div>
      </div>

      <footer style={{ background: "#fff", borderTop: "1px solid #DADCE0", padding: "28px 40px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
          <Link href="/" style={{ fontSize: "13px", color: "#5F6368", textDecoration: "none" }}>Accueil</Link>
          <Link href="/mentions-legales" style={{ fontSize: "13px", color: "#5F6368", textDecoration: "none" }}>Mentions légales</Link>
          <Link href="/politique-de-confidentialite" style={{ fontSize: "13px", color: "#5F6368", textDecoration: "none" }}>Confidentialité</Link>
        </div>
      </footer>
    </div>
  );
}
