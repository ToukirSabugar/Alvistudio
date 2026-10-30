// Single source for business details. The admin settings override these defaults.
// Facts here come from the owner (7 years, 30+ projects) and the JustDial listing.
export const siteConfig = {
  name: "Alvi Studio",
  byline: "by Fatma & Aqib",
  tagline: "Architecture · Civil · Interior",
  city: "Himatnagar",
  region: "Gujarat",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  phone: "07383490630",
  phoneDisplay: "07383 490 630",
  whatsapp: "917383490630",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
  address: "Near Alkapuri Pologround, Amine Shariat Street, Alkapuri, Himatnagar-383001, Gujarat",
  hours: "Open until 8:00 pm",
  mapUrl:
    "https://www.google.com/maps/search/?api=1&query=Alvi+Studio+By+Fatma+and+Aqib+Alkapuri+Himatnagar",
  years: 7,
  projects: "30+",
  rating: {
    value: 4.9,
    count: 42,
    url: "https://www.justdial.com/Himatnagar/Alvi-Studio-By-Fatma-and-Aqib-Near-By-Alkapuri-Pologround-Alkapuri/9999P2772-2772-230128044208-D7I4_BZDET",
  },
} as const;

export const projectTypes = [
  { id: "full-house", label: "Full house" },
  { id: "renovation", label: "Renovation" },
  { id: "tuition-classes", label: "Tuition classes" },
  { id: "farm", label: "Farm" },
] as const;
export type ProjectTypeId = (typeof projectTypes)[number]["id"];

/** Gallery categories (the kind of space or design shown). Order = order on the Gallery page. */
export const galleryCategories = [
  { id: "elevation", label: "Elevation", heading: "Elevation designs" },
  { id: "hall", label: "Hall", heading: "Hall and living room designs" },
  { id: "bedroom", label: "Bedroom", heading: "Bedroom designs" },
  { id: "kitchen", label: "Kitchen", heading: "Kitchen designs" },
  { id: "dining-room", label: "Dining room", heading: "Dining room designs" },
  { id: "bathroom", label: "Bathroom", heading: "Bathroom designs" },
  { id: "wardrobe", label: "Wardrobe", heading: "Wardrobe designs" },
  { id: "balcony", label: "Balcony", heading: "Balcony designs" },
  { id: "tuition-class", label: "Tuition class", heading: "Tuition class spaces" },
  { id: "farmhouse", label: "Farmhouse", heading: "Farmhouse designs" },
] as const;
export type GalleryCategoryId = (typeof galleryCategories)[number]["id"];

/**
 * Pages switched off for now (owner, 2026-10-30). Their code and admin data stay; they return 404, leave the
 * menu and the sitemap, and nothing links to them. Remove a path from this list to bring the page back.
 */
export const PAUSED_PATHS = ["/gallery", "/blog"] as const;

/** True for a paused page or anything under it (so /blog/<slug> is paused with /blog). */
export function isPaused(path: string): boolean {
  return PAUSED_PATHS.some((p) => path === p || path.startsWith(`${p}/`));
}

export function navLinks(showTestimonials: boolean) {
  return [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/architecture", label: "Architecture" },
    { href: "/interior", label: "Interior" },
    { href: "/civil", label: "Civil" },
    { href: "/gallery", label: "Gallery" },
    ...(showTestimonials ? [{ href: "/testimonials", label: "Testimonials" }] : []),
    { href: "/blog", label: "Blog & Guides" },
    { href: "/contact", label: "Contact" },
  ].filter((l) => !isPaused(l.href));
}

export const MIN_TESTIMONIALS = 3;
