import { projectTypes } from "@/lib/site";
import { listAllTestimonials } from "@/lib/store";
import { createTestimonial, removeTestimonial, toggleTestimonial } from "./actions";
import { requireAdmin } from "../guard";
import { AdminShell, Field, Notice, SaveBar, btnQuietCls, inputCls } from "../ui";

export const dynamic = "force-dynamic";

export default async function TestimonialsAdmin({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; e?: string }>;
}) {
  await requireAdmin();
  const { ok, e } = await searchParams;
  const items = await listAllTestimonials();
  const label = (id: string) => projectTypes.find((p) => p.id === id)?.label ?? id;
  return (
    <AdminShell
      title="Testimonials"
      intro="Paste each client's own words, with their permission. Never write or edit a review yourself. The public Testimonials page appears once there are 3 entries."
    >
      <Notice ok={ok} error={e} />
      <h2 className="display text-xl">Added so far ({items.length})</h2>
      {items.length === 0 ? (
        <p className="mt-3 border border-ink/20 bg-white p-6 text-base">
          Nothing added yet. Paste each client&apos;s own words with their permission.
        </p>
      ) : (
        <ul className="mt-3 space-y-3">
          {items.map((t) => (
            <li key={t.id} className="flex flex-col gap-3 border border-ink/20 bg-white p-4 sm:flex-row sm:items-start">
              <div className="flex-1">
                <p className="whitespace-pre-wrap text-base">{t.quote}</p>
                <p className="mt-2 text-sm text-muted">
                  {t.name} · {label(t.projectType)} · {t.isVisible ? "Shown on the site" : "Hidden"}
                </p>
              </div>
              <form action={toggleTestimonial}>
                <input type="hidden" name="id" value={t.id} />
                <input type="hidden" name="visible" value={t.isVisible ? "0" : "1"} />
                <button type="submit" className={btnQuietCls}>
                  {t.isVisible ? "Hide" : "Show"}
                </button>
              </form>
              <form action={removeTestimonial}>
                <input type="hidden" name="id" value={t.id} />
                <button type="submit" className={btnQuietCls}>
                  Delete
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <h2 className="display mt-12 text-xl">Add a testimonial</h2>
      <form action={createTestimonial} className="mt-4 space-y-5">
        <Field label="Client name" name="name">
          <input id="name" name="name" required maxLength={80} className={inputCls} />
        </Field>
        <Field label="Project type" name="projectType">
          <select id="projectType" name="projectType" required className={inputCls}>
            {projectTypes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Their words" name="quote" hint="Up to 1000 characters. Paste exactly what the client wrote.">
          <textarea id="quote" name="quote" required maxLength={1000} rows={6} className={inputCls} />
        </Field>
        <SaveBar label="Add testimonial" />
      </form>
    </AdminShell>
  );
}
