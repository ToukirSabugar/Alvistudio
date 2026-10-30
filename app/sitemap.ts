import type { MetadataRoute } from "next";
import { siteConfig, MIN_TESTIMONIALS, isPaused } from "@/lib/site";
import { getPosts, getTestimonials } from "@/lib/store";
import { guides } from "@/content/guides";

export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [testimonials, posts] = await Promise.all([getTestimonials(), getPosts()]);
  const showTestimonials = testimonials.length >= MIN_TESTIMONIALS;
  const guideSlugs = new Set(guides.map((g) => g.slug));
  const paths = [
    "/",
    "/about",
    "/architecture",
    "/interior",
    "/civil",
    "/gallery",
    ...(showTestimonials ? ["/testimonials"] : []),
    "/blog",
    ...guides.map((g) => `/blog/${g.slug}`),
    ...posts.filter((p) => !guideSlugs.has(p.slug)).map((p) => `/blog/${p.slug}`),
    "/contact",
  ];
  return paths.filter((p) => !isPaused(p)).map((p) => ({ url: `${siteConfig.url}${p}` }));
}
