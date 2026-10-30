import type { Metadata } from "next";
import { PATH_LABELS, SEO_PATHS, listFaqsAdmin, type Faq } from "@/lib/seo-store";
import { requireAdmin } from "../guard";
import { AdminShell, Field, Notice, SaveBar, btnQuietCls, inputCls } from "../ui";
import { addFaqAction, deleteFaqAction, toggleFaqAction } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "FAQs", robots: { index: false, follow: false } };

export default async function FaqsAdmin({ searchParams }: { searchParams: Promise<{ ok?: string; e?: string }> }) {
  await requireAdmin();
  const { ok, e } = await searchParams;
  const faqs = await listFaqsAdmin();
  const grouped = new Map<string, Faq[]>();
  for (const f of faqs) grouped.set(f.pagePath, [...(grouped.get(f.pagePath) ?? []), f]);

  return (
    <AdminShell
      title="FAQs"
      intro="Questions customers really ask. Each visible question appears on its page and is also given to Google as FAQ data."
    >
      <Notice ok={ok} error={e} />

      {faqs.length === 0 ? (
        <p className="border border-ink/20 bg-white p-6 text-base">
          No questions yet. Questions you add here appear at the bottom of the page you choose, and as FAQ data for
          Google. Add only questions you can answer truthfully.
        </p>
      ) : (
        <div className="space-y-8">
          {SEO_PATHS.filter((p) => grouped.has(p)).map((path) => (
            <section key={path} aria-label={`${PATH_LABELS[path]} questions`}>
              <h2 className="display text-xl">{PATH_LABELS[path]}</h2>
              <ul className="mt-3 space-y-3">
                {grouped.get(path)!.map((f) => (
                  <li key={f.id} className="flex flex-col gap-3 border border-ink/20 bg-white p-4 sm:flex-row sm:items-start">
                    <div className="flex-1">
                      <p className="text-base font-medium">{f.question}</p>
                      <p className="mt-1 whitespace-pre-wrap text-base text-muted">{f.answer}</p>
                      <p className="mt-2 text-sm text-muted">{f.isVisible ? "Shown on the page" : "Hidden"}</p>
                    </div>
                    <div className="flex gap-2">
                      <form action={toggleFaqAction}>
                        <input type="hidden" name="id" value={f.id} />
                        <input type="hidden" name="visible" value={f.isVisible ? "0" : "1"} />
                        <button type="submit" className={btnQuietCls}>
                          {f.isVisible ? "Hide" : "Show"}
                        </button>
                      </form>
                      <form action={deleteFaqAction}>
                        <input type="hidden" name="id" value={f.id} />
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
        </div>
      )}

      <h2 className="display mt-12 text-xl">Add a question</h2>
      <form action={addFaqAction} className="mt-4 space-y-5">
        <Field label="Show on page" name="pagePath">
          <select id="pagePath" name="pagePath" required className={inputCls}>
            {SEO_PATHS.map((p) => (
              <option key={p} value={p}>
                {PATH_LABELS[p]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Question" name="question" hint="5 to 250 characters.">
          <input id="question" name="question" required minLength={5} maxLength={250} className={inputCls} />
        </Field>
        <Field label="Answer" name="answer" hint="Plain text, up to 3000 characters.">
          <textarea id="answer" name="answer" required minLength={5} maxLength={3000} rows={5} className={inputCls} />
        </Field>
        <SaveBar label="Add question" />
      </form>
    </AdminShell>
  );
}
