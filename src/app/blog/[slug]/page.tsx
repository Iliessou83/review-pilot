import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BLOG_POSTS, getBlogPost, type BlogBlock } from "@/data/blogPosts";
import Linkify from "@/components/Linkify";

const G = { blue: "#1A73E8", red: "#EA4335", yellow: "#FBBC04", green: "#34A853" };

export function generateStaticParams() {
  return BLOG_POSTS.map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} | Caela Réputation`,
    description: post.description,
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function Block({ block }: { block: BlogBlock }) {
  switch (block.type) {
    case "h2":
      return (
        <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#202124", margin: "36px 0 14px" }}>
          {block.text}
        </h2>
      );
    case "h3":
      return (
        <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#202124", margin: "24px 0 10px" }}>
          {block.text}
        </h3>
      );
    case "ul":
      return (
        <ul style={{ margin: "0 0 18px", padding: "0 0 0 22px", display: "flex", flexDirection: "column", gap: "8px" }}>
          {block.items.map((item, i) => (
            <li key={i} style={{ fontSize: "15px", color: "#3C4043", lineHeight: 1.7 }}>
              <Linkify text={item} />
            </li>
          ))}
        </ul>
      );
    case "quote":
      return (
        <blockquote style={{
          margin: "0 0 18px", padding: "14px 20px", borderLeft: `3px solid ${G.blue}`,
          background: "#F8F9FA", borderRadius: "0 8px 8px 0",
        }}>
          <p style={{ fontSize: "14.5px", color: "#3C4043", lineHeight: 1.7, fontStyle: "italic", margin: 0 }}>
            {block.text}
          </p>
        </blockquote>
      );
    case "p":
    default:
      return (
        <p style={{ fontSize: "15.5px", color: "#3C4043", lineHeight: 1.8, margin: "0 0 18px" }}>
          <Linkify text={block.text} />
        </p>
      );
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const others = BLOG_POSTS.filter(p => p.slug !== post.slug).slice(0, 3);

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
        <Link href="/blog" style={{ fontSize: "13px", color: "#5F6368", textDecoration: "none" }}>← Blog</Link>
      </nav>

      <article style={{ maxWidth: "720px", margin: "0 auto", padding: "48px 24px 40px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <span style={{ fontSize: "12px", fontWeight: 700, color: G.green, background: "#E6F4EA", padding: "3px 10px", borderRadius: "12px" }}>
            {post.category}
          </span>
          <span style={{ fontSize: "12px", color: "#80868B" }}>{formatDate(post.date)} · {post.readMinutes} min de lecture</span>
        </div>
        <h1 style={{ fontSize: "32px", fontWeight: 800, margin: "0 0 16px", lineHeight: 1.25, letterSpacing: "-0.4px" }}>
          {post.title}
        </h1>
        <p style={{ fontSize: "16px", color: "#5F6368", lineHeight: 1.6, margin: "0 0 36px", paddingBottom: "28px", borderBottom: "1px solid #DADCE0" }}>
          {post.excerpt}
        </p>

        {post.blocks.map((block, i) => <Block key={i} block={block} />)}

        <div style={{ marginTop: "40px", padding: "24px", background: "#F8F9FA", border: "1px solid #DADCE0", borderRadius: "12px", textAlign: "center" }}>
          <p style={{ fontSize: "15px", fontWeight: 700, color: "#202124", margin: "0 0 6px" }}>
            Envie d&apos;automatiser vos réponses aux avis Google ?
          </p>
          <p style={{ fontSize: "13.5px", color: "#5F6368", margin: "0 0 16px" }}>
            Essai gratuit 14 jours, sans carte bancaire.
          </p>
          <Link href="/signup" style={{ display: "inline-block", padding: "10px 22px", fontSize: "14px", fontWeight: 600, background: G.blue, color: "#fff", textDecoration: "none", borderRadius: "6px" }}>
            Essai gratuit →
          </Link>
        </div>
      </article>

      {others.length > 0 && (
        <div style={{ maxWidth: "720px", margin: "0 auto", padding: "0 24px 64px" }}>
          <h2 style={{ fontSize: "13px", fontWeight: 700, color: "#80868B", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 16px" }}>
            À lire aussi
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {others.map((o) => (
              <Link key={o.slug} href={`/blog/${o.slug}`} style={{ padding: "14px 0", borderTop: "1px solid #DADCE0", textDecoration: "none", color: "#1A73E8", fontSize: "14.5px", fontWeight: 600 }}>
                {o.title}
              </Link>
            ))}
          </div>
        </div>
      )}

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
