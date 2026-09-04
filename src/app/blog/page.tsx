import type { Metadata } from "next";
import Link from "next/link";
import { BLOG_POSTS, CATEGORY_STYLE } from "@/data/blogPosts";
import RichText from "@/components/RichText";

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

      <div style={{ maxWidth: "1160px", margin: "0 auto", padding: "56px 24px 80px" }}>
        <p style={{ fontSize: "13px", fontWeight: 700, color: G.blue, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 10px" }}>Blog</p>
        <h1 style={{ fontSize: "36px", fontWeight: 800, margin: "0 0 12px", letterSpacing: "-0.5px" }}>Avis Google & e-réputation</h1>
        <p style={{ fontSize: "16px", color: "#5F6368", lineHeight: 1.6, margin: "0 0 48px", maxWidth: "620px" }}>
          Guides pratiques pour les commerçants et indépendants : réponses aux avis, classement Google Maps, fiche Google Business Profile, collecte automatisée.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
          {posts.map((post) => {
            const catStyle = CATEGORY_STYLE[post.category] ?? { icon: "📝", color: G.blue, bg: `linear-gradient(135deg, ${G.blue}, #174EA6)` };
            return (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                style={{
                  display: "flex", flexDirection: "column", border: "1px solid #DADCE0", borderRadius: "14px",
                  textDecoration: "none", color: "inherit", background: "#fff", overflow: "hidden",
                  transition: "box-shadow 0.15s ease, transform 0.15s ease",
                }}
              >
                <div
                  role="img"
                  aria-label={`Illustration — ${post.category}`}
                  style={{ height: "100px", background: catStyle.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "34px" }}
                >
                  {catStyle.icon}
                </div>
                <div style={{ padding: "20px 24px 24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: catStyle.color, background: `${catStyle.color}1A`, padding: "3px 10px", borderRadius: "12px" }}>
                      {post.category}
                    </span>
                    <span style={{ fontSize: "12px", color: "#80868B" }}>{formatDate(post.date)} · {post.readMinutes} min de lecture</span>
                  </div>
                  <h2 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 8px", color: "#202124", lineHeight: 1.35 }}>{post.title}</h2>
                  <p style={{ fontSize: "13.5px", color: "#5F6368", lineHeight: 1.6, margin: 0 }}>
                    <RichText text={post.excerpt} accent={catStyle.color} />
                  </p>
                </div>
              </Link>
            );
          })}
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
