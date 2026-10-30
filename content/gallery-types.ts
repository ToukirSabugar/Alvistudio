import type { GalleryCategoryId } from "@/lib/site";

/** One stand-in photo for the Gallery (see public/samples/CREDITS.md). */
export type SamplePhoto = {
  /** File name without extension inside public/samples/gallery, e.g. "kitchen-3". */
  id: string;
  category: GalleryCategoryId;
  /** Says what the picture shows. Never claims the picture is an Alvi Studio project. */
  title: string;
  /** Plain description for screen readers and search engines. */
  alt: string;
  width: number;
  height: number;
};

/** Build a photo entry; the file is /samples/gallery/<id>.jpg, 1200 x 800. */
export const photo = (id: string, category: GalleryCategoryId, title: string, alt: string): SamplePhoto => ({
  id,
  category,
  title,
  alt,
  width: 1200,
  height: 800,
});
