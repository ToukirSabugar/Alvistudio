import Link from "next/link";
import { galleryCategories } from "@/lib/site";
import { listMedia } from "@/lib/store";
import { addGalleryPhotos, editGalleryPhoto, moveGalleryItem, removeGalleryItem, toggleGalleryItem } from "./actions";
import { requireAdmin } from "../guard";
import { ConfirmButton } from "../ConfirmButton";
import { PhotoDropzone } from "../PhotoDropzone";
import { AdminShell, Field, Notice, Section, SaveBar, btnCls, btnDangerCls, btnQuietCls, cardCls, inputCls } from "../ui";

export const dynamic = "force-dynamic";

function kb(bytes: number): string {
  return bytes > 0 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : "linked image";
}

function CategorySelect({ id, value }: { id: string; value?: string | null }) {
  return (
    <select id={id} name="category" required defaultValue={value ?? galleryCategories[0].id} className={inputCls}>
      {galleryCategories.map((c) => (
        <option key={c.id} value={c.id}>
          {c.label}
        </option>
      ))}
    </select>
  );
}

const chip = (on: boolean) =>
  `inline-flex min-h-11 items-center whitespace-nowrap border px-4 text-sm ${on ? "border-ink bg-ink text-paper" : "border-ink/40 bg-white hover:border-ink"}`;

export default async function GalleryAdmin({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; e?: string; cat?: string }>;
}) {
  await requireAdmin();
  const { ok, e, cat } = await searchParams;
  const all = await listMedia("gallery");
  const filter = galleryCategories.find((c) => c.id === cat)?.id;
  const items = filter ? all.filter((g) => g.category === filter) : all;
  const label = (id: string | null) => galleryCategories.find((c) => c.id === id)?.label ?? id ?? "No category";
  const okText = ok && Number(ok) > 1 ? `${ok} photos added.` : undefined;

  return (
    <AdminShell
      title="Gallery"
      intro="Photos of your projects for the public Gallery page. A category with no photos of yours shows labelled sample images instead."
    >
      {okText ? (
        <p role="status" className="mb-6 border-l-4 border-camel-deep bg-white p-4 text-base">
          {okText}
        </p>
      ) : (
        <Notice ok={ok} error={e} />
      )}

      <Section title="Add photos" hint="Up to 6 photos at a time, all for the same category. You can change each one afterwards.">
        <form action={addGalleryPhotos} className="space-y-5">
          {filter ? <input type="hidden" name="filter" value={filter} /> : null}
          <PhotoDropzone name="photos" multiple max={6} />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Category" name="add-category" hint="Where the photos appear on the Gallery page.">
              <CategorySelect id="add-category" value={filter} />
            </Field>
            <Field label="Title" name="add-title" hint='With several photos they are numbered, e.g. "Kitchen 2".'>
              <input id="add-title" name="title" required maxLength={120} className={inputCls} />
            </Field>
          </div>
          <Field
            label="Describe the photo (alt text)"
            name="add-alt"
            hint="One sentence on what it shows, e.g. 'Modular kitchen with white quartz counter in a Himatnagar home'. Read by Google and screen readers."
          >
            <input id="add-alt" name="altText" required maxLength={250} className={inputCls} />
          </Field>
          <label className="flex min-h-11 items-center gap-3">
            <input name="isSample" type="checkbox" className="h-6 w-6 accent-camel-deep" />
            <span>These are sample images, not the studio&apos;s own projects</span>
          </label>
          <details>
            <summary className="inline-flex min-h-11 cursor-pointer items-center text-sm underline decoration-camel underline-offset-4">
              Advanced: use a link instead of uploading
            </summary>
            <div className="mt-3">
              <Field label="Image path or link" name="add-url" hint="Only used when no photo is chosen. Starts with / or https://">
                <input id="add-url" name="imageUrl" maxLength={500} placeholder="https://" className={inputCls} />
              </Field>
            </div>
          </details>
          <SaveBar label="Add to gallery" />
        </form>
      </Section>

      <div className="mt-10 flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="display text-xl">
          {filter ? label(filter) : "All photos"} ({items.length})
        </h2>
      </div>
      <nav aria-label="Filter by category" className="mt-3 flex flex-wrap gap-2">
        <Link href="/admin/gallery" aria-current={!filter ? "true" : undefined} className={chip(!filter)}>
          All ({all.length})
        </Link>
        {galleryCategories.map((c) => {
          const n = all.filter((g) => g.category === c.id).length;
          return (
            <Link key={c.id} href={`/admin/gallery?cat=${c.id}`} aria-current={filter === c.id ? "true" : undefined} className={chip(filter === c.id)}>
              {c.label} ({n})
            </Link>
          );
        })}
      </nav>

      {items.length === 0 ? (
        <p className={`${cardCls} mt-4 p-6`}>
          {filter ? "No photos in this category yet. The Gallery page shows sample images here until you add some." : "No photos added yet. Add the first ones above."}
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((g, i) => (
            <li key={g.id} className={`${cardCls} p-4`}>
              <div className="flex flex-col gap-4 sm:flex-row">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={g.fileUrl} alt={g.altText || g.title} loading="lazy" className="aspect-[4/3] w-full flex-none bg-paper-2 object-cover sm:w-40" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{g.title}</p>
                  <p className="text-sm">{g.altText || <em className="text-red-800">Description missing</em>}</p>
                  <p className="mt-1 flex flex-wrap gap-2 text-sm text-muted">
                    <span>{label(g.category)}</span>
                    <span>· {kb(g.sizeBytes)}</span>
                    {g.width && g.height ? <span>· {g.width} × {g.height} px</span> : null}
                  </p>
                  <p className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className={`border px-2 py-0.5 ${g.isVisible ? "border-camel-deep text-camel-deep" : "border-ink/40 text-muted"}`}>
                      {g.isVisible ? "Shown on the site" : "Hidden"}
                    </span>
                    {g.isSample ? <span className="border border-ink/40 px-2 py-0.5 text-muted">Sample image</span> : null}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <form action={moveGalleryItem}>
                  <input type="hidden" name="id" value={g.id} />
                  <input type="hidden" name="dir" value="up" />
                  {filter ? <input type="hidden" name="filter" value={filter} /> : null}
                  <button type="submit" disabled={i === 0} className={btnQuietCls} aria-label={`Move ${g.title} up`}>
                    Move up
                  </button>
                </form>
                <form action={moveGalleryItem}>
                  <input type="hidden" name="id" value={g.id} />
                  <input type="hidden" name="dir" value="down" />
                  {filter ? <input type="hidden" name="filter" value={filter} /> : null}
                  <button type="submit" disabled={i === items.length - 1} className={btnQuietCls} aria-label={`Move ${g.title} down`}>
                    Move down
                  </button>
                </form>
                <form action={toggleGalleryItem}>
                  <input type="hidden" name="id" value={g.id} />
                  <input type="hidden" name="visible" value={g.isVisible ? "0" : "1"} />
                  {filter ? <input type="hidden" name="filter" value={filter} /> : null}
                  <button type="submit" className={btnQuietCls}>
                    {g.isVisible ? "Hide" : "Show"}
                  </button>
                </form>
                <form action={removeGalleryItem}>
                  <input type="hidden" name="id" value={g.id} />
                  {filter ? <input type="hidden" name="filter" value={filter} /> : null}
                  <ConfirmButton message={`Delete "${g.title}" for good? The photo file is removed too.`} className={btnDangerCls}>
                    Delete
                  </ConfirmButton>
                </form>
              </div>
              <details className="mt-3">
                <summary className="inline-flex min-h-11 cursor-pointer items-center text-sm underline decoration-camel underline-offset-4">
                  Edit title, description or category
                </summary>
                <form action={editGalleryPhoto} className="mt-3 space-y-4">
                  <input type="hidden" name="id" value={g.id} />
                  {filter ? <input type="hidden" name="filter" value={filter} /> : null}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Title" name={`t-${g.id}`}>
                      <input id={`t-${g.id}`} name="title" required maxLength={120} defaultValue={g.title} className={inputCls} />
                    </Field>
                    <Field label="Category" name={`c-${g.id}`}>
                      <CategorySelect id={`c-${g.id}`} value={g.category} />
                    </Field>
                  </div>
                  <Field label="Describe the photo (alt text)" name={`a-${g.id}`}>
                    <input id={`a-${g.id}`} name="altText" required maxLength={250} defaultValue={g.altText} className={inputCls} />
                  </Field>
                  <label className="flex min-h-11 items-center gap-3">
                    <input name="isSample" type="checkbox" defaultChecked={g.isSample} className="h-6 w-6 accent-camel-deep" />
                    <span>Sample image (not the studio&apos;s own project)</span>
                  </label>
                  <button type="submit" className={btnCls}>
                    Save changes
                  </button>
                </form>
              </details>
            </li>
          ))}
        </ul>
      )}
    </AdminShell>
  );
}
