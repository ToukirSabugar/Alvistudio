import { listMedia } from "@/lib/store";
import { heroPages, listPageHeroes } from "@/lib/site-content-store";
import { requireAdmin } from "../guard";
import { AdminShell, Field, Notice, btnCls, btnQuietCls, inputCls } from "../ui";
import { savePageHero } from "./actions";
import { MediaChoice } from "./MediaChoice";
import { PhotoDropzone } from "../PhotoDropzone";

export const dynamic = "force-dynamic";

export default async function HeroesAdmin({ searchParams }: { searchParams: Promise<{ ok?: string; e?: string }> }) {
  await requireAdmin();
  const { ok, e } = await searchParams;
  const [heroes, media] = await Promise.all([listPageHeroes(), listMedia()]);
  const byPath = new Map(heroes.map((h) => [h.path, h]));
  return (
    <AdminShell
      title="Page images"
      intro="One main image for each page. On Home, Architecture, Interior and Civil it is also the still picture shown when the 3D scene cannot load. Upload a new image or pick one you uploaded before."
    >
      <Notice ok={ok} error={e} />
      {media.length === 0 ? (
        <p className="mb-6 border border-ink/20 bg-white p-6 text-base">
          No images uploaded yet. Use “Upload a new image” on any page below.
        </p>
      ) : null}
      <ul className="space-y-6">
        {heroPages.map((p) => {
          const h = byPath.get(p.path);
          const idPrefix = `hero-${p.label.toLowerCase()}`;
          return (
            <li key={p.path} className="border border-ink/20 bg-white p-4 sm:p-6">
              <h2 className="display text-xl">
                {p.label} <span className="text-base font-normal text-muted">{p.path}</span>
              </h2>
              <div className="mt-3 flex flex-col gap-4 sm:flex-row">
                <div className="sm:w-56 sm:shrink-0">
                  {h?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={h.url} alt={h.alt || `Current image for ${p.label}`} className="aspect-[4/3] w-full bg-paper-2 object-cover" />
                  ) : (
                    <p className="flex aspect-[4/3] w-full items-center justify-center bg-paper-2 p-3 text-center text-sm text-muted">
                      Built-in design in use
                    </p>
                  )}
                </div>
                <form action={savePageHero} className="min-w-0 flex-1 space-y-4">
                  <input type="hidden" name="path" value={p.path} />
                  <PhotoDropzone name="photo" label="Upload a new image" />
                  {media.length > 0 ? <MediaChoice name="mediaId" media={media} selectedId={h?.mediaId ?? null} /> : null}
                  <Field
                    label="Describe the image (alt text)"
                    name={`${idPrefix}-alt`}
                    hint="Read aloud by screen readers and used by search engines."
                  >
                    <input id={`${idPrefix}-alt`} name="alt" maxLength={250} defaultValue={h?.alt ?? ""} className={inputCls} />
                  </Field>
                  <div className="flex flex-wrap gap-3">
                    <button type="submit" className={btnCls}>
                      Save {p.label} image
                    </button>
                    {h?.mediaId ? (
                      <button type="submit" name="intent" value="clear" formNoValidate className={btnQuietCls}>
                        Clear
                      </button>
                    ) : null}
                  </div>
                </form>
              </div>
            </li>
          );
        })}
      </ul>
    </AdminShell>
  );
}
