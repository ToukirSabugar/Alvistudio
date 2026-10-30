// Suggested starter keywords from docs/seo-keyword-map.md. Nothing is added until the owner clicks the button.
import type { KeywordInput } from "@/lib/seo-store";

const k = (keyword: string, pagePath: string, intent: string, priority: number): KeywordInput => ({
  keyword,
  pagePath,
  intent,
  priority,
  targetCity: "Himatnagar",
});

export const STARTER_KEYWORDS: KeywordInput[] = [
  k("architects and interior designers in Himatnagar", "/", "primary", 1),
  k("civil contractor Himatnagar", "/", "secondary", 2),
  k("house design Himatnagar", "/", "secondary", 2),
  k("Alvi Studio", "/", "brand", 1),
  k("about Alvi Studio Himatnagar", "/about", "primary", 1),
  k("Fatma and Aqib", "/about", "brand", 2),
  k("architect in Himatnagar", "/architecture", "primary", 1),
  k("house plan Himatnagar", "/architecture", "secondary", 2),
  k("building design Himatnagar", "/architecture", "secondary", 2),
  k("3D elevation Himatnagar", "/architecture", "long_tail", 3),
  k("interior designer in Himatnagar", "/interior", "primary", 1),
  k("home interior Himatnagar", "/interior", "secondary", 2),
  k("office interior Himatnagar", "/interior", "secondary", 2),
  k("renovation Himatnagar", "/interior", "secondary", 2),
  k("civil contractor in Himatnagar", "/civil", "primary", 1),
  k("house construction Himatnagar", "/civil", "secondary", 2),
  k("renovation work Himatnagar", "/civil", "secondary", 2),
  k("farm house construction Himatnagar", "/civil", "long_tail", 3),
  k("interior and architecture projects in Himatnagar", "/gallery", "primary", 1),
  k("client reviews Alvi Studio", "/testimonials", "brand", 1),
  k("building materials guide", "/blog", "primary", 1),
  k("concrete curing guide", "/blog", "long_tail", 3),
  k("bricks vs blocks", "/blog", "long_tail", 3),
  k("plywood for interiors", "/blog", "long_tail", 3),
  k("contact an architect in Himatnagar", "/contact", "primary", 1),
];
