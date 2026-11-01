/** Public origin for metadata, sitemap, JSON-LD and share links. No trailing slash. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://utsavai-1010587631565.us-central1.run.app"
).replace(/\/+$/, "");

/** Absolute URL on the public origin. */
export function absoluteUrl(path = "/"): string {
  return path === "/" ? SITE_URL : `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Brand constants reused across pages, social cards, and structured data. */
export const BRAND = {
  name: "UtsavAI",
  tagline: "AI ideates, code calculates.",
  category: "AI Celebration & Event Planner",
  subtitle: "AI planner for Indian weddings, birthdays & community events",
} as const;

/** Brand colours for metadata and manifest. */
export const BRAND_COLORS = {
  primary: "#C41E3A",
  background: "#0f0f0f",
} as const;
