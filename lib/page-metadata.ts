// Merges the owner's SEO overrides (admin /admin/seo) over each page's built-in metadata.
import type { Metadata } from "next";
import { getPageSeo, listSeoKeywords, type PageSeo, type SeoKeyword } from "@/lib/seo-store";

export type MetaDefaults = { title: string; description: string };
type KeywordLike = Pick<SeoKeyword, "keyword" | "intent" | "priority" | "isActive">;

/** Short hints shown as placeholders in the admin. The page's own text stays the real default. */
export const BUILT_IN_HINTS: Record<string, string> = {
  "/": "Built-in: Architect & Interior Designer in Himatnagar | Alvi Studio",
  "/about": "Built-in: About the Himatnagar architects",
  "/architecture": "Built-in text from the Architecture page",
  "/interior": "Built-in text from the Interior page",
  "/civil": "Built-in text from the Civil page",
  "/gallery": "Built-in: Project gallery in Himatnagar",
  "/testimonials": "Built-in: Client testimonials | Architects in Himatnagar",
  "/blog": "Built-in: Blog and building guides",
  "/contact": "Built-in: Contact Alvi Studio in Himatnagar",
};

const MAX_KEYWORDS = 12;
const INTENT_RANK: Record<string, number> = { primary: 0, secondary: 1, long_tail: 2, brand: 3 };

/** Active keywords only, primary first, then by priority, deduped (case-insensitive), capped at 12. */
export function pickKeywords(keywords: KeywordLike[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  const sorted = keywords
    .filter((k) => k.isActive)
    .map((k, i) => ({ k, i }))
    .sort(
      (a, b) =>
        (a.k.intent === "primary" ? 0 : 1) - (b.k.intent === "primary" ? 0 : 1) ||
        a.k.priority - b.k.priority ||
        (INTENT_RANK[a.k.intent] ?? 9) - (INTENT_RANK[b.k.intent] ?? 9) ||
        a.i - b.i,
    );
  for (const { k } of sorted) {
    const text = k.keyword.trim();
    const key = text.toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(text);
    if (out.length >= MAX_KEYWORDS) break;
  }
  return out;
}

export function mergePageMetadata(
  defaults: MetaDefaults,
  override: PageSeo | null,
  keywords: KeywordLike[],
  path: string,
): Metadata {
  const title = override?.metaTitle.trim() || defaults.title;
  const description = override?.metaDescription.trim() || defaults.description;
  const meta: Metadata = { title, description, alternates: { canonical: path } };
  const kw = pickKeywords(keywords);
  if (kw.length) meta.keywords = kw;
  if (override?.noindex) meta.robots = { index: false };
  const og = override?.ogImageUrl.trim();
  if (og) meta.openGraph = { title, description, images: [{ url: og }] };
  return meta;
}

/** Never throws: with the database down the page's defaults are used. */
export async function buildPageMetadata(path: string, defaults: MetaDefaults): Promise<Metadata> {
  try {
    const [override, keywords] = await Promise.all([getPageSeo(path), listSeoKeywords(path)]);
    return mergePageMetadata(defaults, override, keywords, path);
  } catch {
    return mergePageMetadata(defaults, null, [], path);
  }
}
