import Linkify from "@/components/Linkify";

// Rendu du contenu blog : texte brut avec une micro-syntaxe éditoriale —
// **mot** = surligné (couleur), __mot__ = souligné — en plus des emails/URLs
// déjà gérés par Linkify. Pas de markdown complet : juste ces deux marqueurs,
// utilisés à la main dans src/data/blogPosts.ts pour mettre en valeur les
// chiffres et affirmations clés de chaque article.
const MARK_PATTERN = /(\*\*.+?\*\*|__.+?__)/g;

export default function RichText({ text, accent = "#2457C5" }: { text: string; accent?: string }) {
  const parts = text.split(MARK_PATTERN);
  return (
    <>
      {parts.map((part, i) => {
        if (!part) return null;
        if (part.startsWith("**") && part.endsWith("**")) {
          const inner = part.slice(2, -2);
          return (
            <mark
              key={i}
              style={{
                background: `${accent}1A`,
                color: accent,
                fontWeight: 700,
                padding: "0 3px",
                borderRadius: "3px",
              }}
            >
              {inner}
            </mark>
          );
        }
        if (part.startsWith("__") && part.endsWith("__")) {
          const inner = part.slice(2, -2);
          return (
            <span key={i} style={{ textDecoration: `underline 2px ${accent}80`, textUnderlineOffset: "3px" }}>
              {inner}
            </span>
          );
        }
        return <Linkify key={i} text={part} linkColor={accent} />;
      })}
    </>
  );
}
