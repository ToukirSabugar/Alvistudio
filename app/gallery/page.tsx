import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/page-metadata";
import { Button } from "@/components/Button";
import { IconBadge } from "@/components/ui/IconBadge";
import { GalleryExplorer, type GallerySection, type GalleryTile } from "@/components/gallery/GalleryExplorer";
import { gallerySamples, sampleSrc } from "@/content/gallery-samples";
import { galleryCategories } from "@/lib/site";
import { getGalleryItems } from "@/lib/store";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/gallery", {
    title: "Design gallery in Himatnagar",
    description:
      "Browse elevation, hall, bedroom, kitchen, bathroom and more designs by Alvi Studio in Himatnagar. Open any photo to see it larger. Sample images are labelled until real photos are added.",
  });
}

export default async function GalleryPage() {
  const items = await getGalleryItems();

  // For each category: the studio's own uploaded photos if there are any, otherwise labelled samples.
  const sections: GallerySection[] = galleryCategories
    .map((c) => {
      const real: GalleryTile[] = items
        .filter((g) => g.category === c.id)
        .map((g) => ({
          id: `m-${g.id}`,
          type: c.id,
          title: g.title,
          alt: g.altText || g.title,
          src: g.imageUrl,
          width: 1200,
          height: 800,
          sample: g.isSample,
        }));
      const tiles: GalleryTile[] =
        real.length > 0
          ? real
          : gallerySamples
              .filter((s) => s.category === c.id)
              .map((s) => ({ id: s.id, type: s.category, title: s.title, alt: s.alt, src: sampleSrc(s), width: s.width, height: s.height, sample: true }));
      return { id: c.id, label: c.label, heading: c.heading, tiles };
    })
    .filter((s) => s.tiles.length > 0);

  const hasSample = sections.some((s) => s.tiles.some((t) => t.sample));
  const total = sections.reduce((n, s) => n + s.tiles.length, 0);

  return (
    <>
      <section id="gallery-top" className="mx-auto max-w-3xl px-4 pb-14 pt-36 text-center sm:px-8">
        <h1 className="display text-3xl sm:text-5xl">Design gallery</h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted">
          {total} designs across {sections.length} categories, from elevations and halls to kitchens and farmhouses. Open any photo to see it larger.
        </p>
        {hasSample && (
          <p className="mx-auto mt-6 max-w-xl border-l-2 border-camel pl-4 text-left text-sm text-muted">
            These are sample images. Photos of the studio&apos;s own projects replace them here as they are published.
          </p>
        )}
      </section>

      <GalleryExplorer sections={sections} />

      <section aria-labelledby="gallery-cta" className="bg-camel text-ink">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 px-4 py-20 text-center sm:px-8">
          <IconBadge name="house" size="md" className="text-ink" dot="var(--ink)" />
          <h2 id="gallery-cta" className="display text-3xl sm:text-4xl">
            Want something like this for your own place?
          </h2>
          <Button href="/contact" className="!bg-ink !text-paper hover:!bg-paper hover:!text-ink">
            Discuss your project
          </Button>
        </div>
      </section>
    </>
  );
}
