// Sources d'avis supportées. `platform` en base est une colonne text (l'enum
// Drizzle est purement TypeScript, aucune contrainte Postgres) : on peut donc
// ajouter des sources sans migration. google + trustpilot sont branchés en API ;
// les autres arrivent aujourd'hui par import (CSV/coller), connecteurs natifs à venir.
export const PLATFORMS = {
  google: { label: "Google", color: "#1A73E8", bg: "#E8F0FE", live: true },
  trustpilot: { label: "Trustpilot", color: "#00B67A", bg: "#E6F7F1", live: true },
  facebook: { label: "Facebook", color: "#1877F2", bg: "#E7F0FE", live: false },
  tripadvisor: { label: "Tripadvisor", color: "#00AA6C", bg: "#E6F6EF", live: false },
  pagesjaunes: { label: "PagesJaunes", color: "#FFD200", bg: "#FFF9E0", live: false },
  other: { label: "Autre source", color: "#5F6368", bg: "#F1F3F4", live: false },
} as const;

export type PlatformKey = keyof typeof PLATFORMS;

export const PLATFORM_KEYS = Object.keys(PLATFORMS) as PlatformKey[];

export function platformLabel(key: string): string {
  return (PLATFORMS as Record<string, { label: string }>)[key]?.label ?? "Autre source";
}

export function platformMeta(key: string) {
  return (PLATFORMS as Record<string, { label: string; color: string; bg: string; live: boolean }>)[key] ?? PLATFORMS.other;
}
