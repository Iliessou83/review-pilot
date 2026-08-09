// Repère emails et URLs dans un bloc de texte brut et les rend cliquables.
// Utilisé pour les pages légales (CGV, mentions légales) : leur contenu vit
// dans de longues chaînes de caractères avec whiteSpace:pre-line, donc les
// adresses email et liens y étaient jusqu'ici du texte mort.
const PATTERN = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})|(https?:\/\/[^\s)]+)/g;

export default function Linkify({ text, linkColor = "#1A73E8" }: { text: string; linkColor?: string }) {
  const parts = text.split(PATTERN);
  return (
    <>
      {parts.map((part, i) => {
        if (!part) return null;
        if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(part)) {
          return (
            <a key={i} href={`mailto:${part}`} style={{ color: linkColor, textDecoration: "underline" }}>
              {part}
            </a>
          );
        }
        if (/^https?:\/\//.test(part)) {
          return (
            <a key={i} href={part} target="_blank" rel="noopener noreferrer" style={{ color: linkColor, textDecoration: "underline" }}>
              {part}
            </a>
          );
        }
        return part;
      })}
    </>
  );
}
