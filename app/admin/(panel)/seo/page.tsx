import type { Metadata } from "next";
import { BUILT_IN_HINTS } from "@/lib/page-metadata";
import { INTENTS, PATH_LABELS, SEO_PATHS, listPageSeo, listSeoKeywords, type SeoKeyword } from "@/lib/seo-store";
import { requireAdmin } from "../guard";
import { AdminShell, Field, Notice, SaveBar, btnCls, btnQuietCls, inputCls } from "../ui";
import {
  addKeywordAction,
  addStarterKeywordsAction,
  deleteKeywordAction,
  savePageSeoAll,
  toggleKeywordAction,
} from "./actions";
import { CountedInput } from "./CountedInput";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "SEO", robots: { index: false, follow: false } };

const intentLabel: Record<string, string> = {
  primary: "Main",
  secondary: "Supporting",
  long_tail: "Long phrase",
  brand: "Brand",
};
const priorityLabel: Record<number, string> = { 1: "High", 2: "Medium", 3: "Low" };

export default async function SeoAdmin({ searchParams }: { searchParams: Promise<{ ok?: string; e?: string }> }) {
  await requireAdmin();
  const { ok, e } = await searchParams;
  const [overrides, keywords] = await Promise.all([listPageSeo(), listSeoKeywords()]);
  const byPath = new Map(overrides.map((o) => [o.path, o]));
  const grouped = new Map<string, SeoKeyword[]>();
  for (const k of keywords) grouped.set(k.pagePath, [...(grouped.get(k.pagePath) ?? []), k]);

  return (
    <AdminShell
      title="SEO"
      intro="Control what Google shows for each page, and keep the phrases you want to be found for. Leave a box empty to keep the built-in text."
    >
      <Notice ok={ok} error={e} />

      <h2 className="display text-2xl">Page titles and descriptions</h2>
      <form action={savePageSeoAll} className="mt-4 space-y-6">
        {SEO_PATHS.map((path) => {
          const o = byPath.get(path);
          const slug = path === "/" ? "home" : path.slice(1);
          return (
            <fieldset key={path} className="space-y-4 border border-ink/20 bg-white p-4">
              <legend className="px-2 text-lg font-medium">
                {PATH_LABELS[path]} <span className="text-sm font-normal text-muted">({path})</span>
              </legend>
              <CountedInput
                id={`title-${slug}`}
                name={`title:${path}`}
                label="Page title"
                defaultValue={o?.metaTitle ?? ""}
                placeholder={BUILT_IN_HINTS[path] ?? ""}
                target={60}
                max={120}
              />
              <CountedInput
                id={`desc-${slug}`}
                name={`desc:${path}`}
                label="Description"
                defaultValue={o?.metaDescription ?? ""}
                placeholder="Empty uses the built-in description"
                target={155}
                max={300}
                multiline
              />
              <Field
                label="Share image address (optional)"
                name={`og-${slug}`}
                hint="Shown when the page is shared. A full web address or a path such as /uploads/photo.jpg."
              >
                <input
                  id={`og-${slug}`}
                  name={`og:${path}`}
                  maxLength={500}
                  defaultValue={o?.ogImageUrl ?? ""}
                  className={inputCls}
                />
              </Field>
              <label className="flex min-h-11 items-center gap-3 text-base">
                <input
                  type="checkbox"
                  name={`noindex:${path}`}
                  defaultChecked={o?.noindex ?? false}
                  className="h-5 w-5"
                />
                Hide this page from Google (noindex)
              </label>
            </fieldset>
          );
        })}
        <SaveBar label="Save titles and descriptions" />
      </form>

      <h2 className="display mt-14 text-2xl">Target keywords</h2>
      <p className="mt-2 max-w-2xl text-base text-muted">
        The phrases each page should be found for. Active phrases are also added to the page&apos;s keywords tag.
      </p>

      {keywords.length === 0 ? (
        <div className="mt-4 border border-ink/20 bg-white p-6">
          <p className="text-base">
            No keywords yet. You can start from the suggested set from the keyword plan (about 25 phrases for
            Himatnagar, one list per page). You can delete or switch off any of them afterwards.
          </p>
          <form action={addStarterKeywordsAction} className="mt-4">
            <button type="submit" className={btnCls}>
              Add the suggested starter set
            </button>
          </form>
        </div>
      ) : (
        <div className="mt-4 space-y-6">
          {SEO_PATHS.filter((p) => grouped.has(p)).map((path) => (
            <section key={path} aria-label={`${PATH_LABELS[path]} keywords`}>
              <h3 className="text-lg font-medium">{PATH_LABELS[path]}</h3>
              <ul className="mt-2 divide-y divide-ink/10 border border-ink/20 bg-white">
                {grouped.get(path)!.map((k) => (
                  <li key={k.id} className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
                    <div className="flex-1">
                      <p className={`text-base ${k.isActive ? "" : "text-muted line-through"}`}>{k.keyword}</p>
                      <p className="mt-1 text-sm text-muted">
                        {intentLabel[k.intent]} · {priorityLabel[k.priority] ?? k.priority} priority · {k.targetCity}
                        {k.isActive ? "" : " · switched off"}
                        {k.notes ? ` · ${k.notes}` : ""}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <form action={toggleKeywordAction}>
                        <input type="hidden" name="id" value={k.id} />
                        <input type="hidden" name="active" value={k.isActive ? "0" : "1"} />
                        <button type="submit" className={btnQuietCls}>
                          {k.isActive ? "Switch off" : "Switch on"}
                        </button>
                      </form>
                      <form action={deleteKeywordAction}>
                        <input type="hidden" name="id" value={k.id} />
                        <button type="submit" className={btnQuietCls}>
                          Delete
                        </button>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <form action={addStarterKeywordsAction}>
            <button type="submit" className={btnQuietCls}>
              Add any missing phrases from the suggested starter set
            </button>
          </form>
        </div>
      )}

      <h3 className="display mt-10 text-xl">Add a keyword</h3>
      <form action={addKeywordAction} className="mt-4 space-y-5">
        <Field label="Phrase" name="keyword" hint="What a customer would type into Google, 2 to 150 characters.">
          <input id="keyword" name="keyword" required minLength={2} maxLength={150} className={inputCls} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Page" name="pagePath">
            <select id="pagePath" name="pagePath" required className={inputCls}>
              {SEO_PATHS.map((p) => (
                <option key={p} value={p}>
                  {PATH_LABELS[p]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Type" name="intent">
            <select id="intent" name="intent" defaultValue="secondary" className={inputCls}>
              {INTENTS.map((i) => (
                <option key={i} value={i}>
                  {intentLabel[i]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Priority" name="priority">
            <select id="priority" name="priority" defaultValue="2" className={inputCls}>
              <option value="1">High</option>
              <option value="2">Medium</option>
              <option value="3">Low</option>
            </select>
          </Field>
        </div>
        <Field label="City" name="targetCity">
          <input id="targetCity" name="targetCity" defaultValue="Himatnagar" maxLength={60} className={inputCls} />
        </Field>
        <Field label="Notes (optional)" name="notes">
          <input id="notes" name="notes" maxLength={300} className={inputCls} />
        </Field>
        <SaveBar label="Add keyword" />
      </form>
    </AdminShell>
  );
}
