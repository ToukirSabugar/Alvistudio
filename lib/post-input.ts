// Validation for blog posts written in the admin. Pure, so it is unit-tested; the server action is the only caller.

export type PostInput = {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverUrl: string;
  coverAlt: string;
  metaDescription: string;
  publish: boolean;
};

export type CleanPost = Omit<PostInput, "coverUrl" | "coverAlt" | "metaDescription"> & {
  coverUrl: string | null;
  coverAlt: string | null;
  metaDescription: string | null;
};

/** Lowercase a-z, 0-9 and single dashes, at most 120 characters. Empty when nothing usable is left. */
export function slugify(s: string): string {
  return s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120)
    .replace(/-+$/, "");
}

const SAFE_URL = /^(\/(?!\/)|https:\/\/)[^\s<>"']+$/;

/** `reservedSlugs`: web addresses already used by built-in guides or by other posts. */
export function cleanPost(
  input: PostInput,
  reservedSlugs: readonly string[],
): { ok: true; value: CleanPost } | { ok: false; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const title = input.title.replace(/\s+/g, " ").trim();
  const excerpt = input.excerpt.replace(/\s+/g, " ").trim();
  const body = input.body.replace(/\r\n?/g, "\n").trim();
  const coverUrl = input.coverUrl.trim();
  const coverAlt = input.coverAlt.replace(/\s+/g, " ").trim();
  const metaDescription = input.metaDescription.replace(/\s+/g, " ").trim();
  const slug = slugify(input.slug.trim() || title);

  if (title.length < 3 || title.length > 200) errors.title = "Write a title of 3 to 200 characters.";
  if (!slug) errors.slug = "Type a web address using English letters and numbers, e.g. house-plan-tips.";
  else if (reservedSlugs.includes(slug)) errors.slug = `The web address "${slug}" is already used. Choose another.`;
  if (excerpt.length > 500) errors.excerpt = "Keep the summary under 500 characters.";
  if (!body) errors.body = "Write the article text.";
  else if (body.length > 60000) errors.body = "The article is too long (over 60,000 characters).";
  if (coverUrl && (!SAFE_URL.test(coverUrl) || coverUrl.length > 500)) errors.coverUrl = "The cover image must be an uploaded image or an https link.";
  if (coverAlt.length > 250) errors.coverAlt = "Keep the image description under 250 characters.";
  if (metaDescription.length > 300) errors.metaDescription = "Keep the search description under 300 characters.";

  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    value: {
      title,
      slug,
      excerpt,
      body,
      coverUrl: coverUrl || null,
      coverAlt: coverAlt || null,
      metaDescription: metaDescription || null,
      publish: input.publish,
    },
  };
}

/**
 * A stored post body as the blocks ArticleBody renders: blank lines separate blocks, and a block made only of
 * "- " lines becomes one block per list item (so a typed list does not collapse into one bullet).
 */
export function postBlocks(body: string): string[] {
  return body
    .replace(/\r\n?/g, "\n")
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean)
    .flatMap((b) => {
      const lines = b.split("\n").map((l) => l.trim());
      return lines.every((l) => l.startsWith("- ")) ? lines : [b];
    });
}
