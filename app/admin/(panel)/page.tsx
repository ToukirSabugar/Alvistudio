import Link from "next/link";
import { formatIst } from "@/lib/ist";
import { MIN_TESTIMONIALS } from "@/lib/site";
import { getContactSettings } from "@/lib/settings";
import { countEnquiriesByStatus, dashboardCounts, searchEnquiries } from "@/lib/store";
import { statusLabel } from "@/lib/enquiry-status";
import { STATUS_STYLES, typeLabel } from "@/lib/enquiry-labels";
import { requireAdmin } from "./guard";
import { AdminShell, cardCls } from "./ui";

export const dynamic = "force-dynamic";

const SERVICE_PAGES = ["/architecture", "/interior", "/civil"];

export default async function Dashboard() {
  const user = await requireAdmin();
  const [status, c, latest, contact] = await Promise.all([
    countEnquiriesByStatus(),
    dashboardCounts(),
    searchEnquiries({ q: "", page: 1 }, 5, 0),
    getContactSettings(),
  ]);

  const stats = [
    { label: "New enquiries", value: status.new, href: "/admin/enquiries?status=new", strong: status.new > 0 },
    { label: "Enquiries today", value: c.enquiriesToday, href: "/admin/enquiries?range=today" },
    { label: "Last 7 days", value: c.enquiriesWeek, href: "/admin/enquiries?range=week" },
    { label: "Your gallery photos", value: c.galleryOwn, note: c.gallerySamples ? `${c.gallerySamples} samples` : undefined, href: "/admin/gallery" },
    { label: "Testimonials shown", value: c.testimonialsShown, note: `${MIN_TESTIMONIALS} needed for the page`, href: "/admin/testimonials" },
    { label: "Published posts", value: c.postsPublished, href: "/admin/blog" },
    { label: "FAQs shown", value: c.faqsShown, href: "/admin/faqs" },
  ];

  const todo = [
    { done: c.galleryOwn > 0, text: "Add photos of your own projects to the gallery", href: "/admin/gallery" },
    {
      done: c.testimonialsShown >= MIN_TESTIMONIALS,
      text: `Paste ${MIN_TESTIMONIALS} real client reviews (the Testimonials page stays hidden until then)`,
      href: "/admin/testimonials",
    },
    { done: c.teamShown >= 2, text: "Add Fatma and Aqib with photos for the About page", href: "/admin/team" },
    { done: Boolean(contact.email), text: "Add the studio's business email", href: "/admin/settings" },
    { done: Boolean(contact.instagram || contact.facebook || contact.youtube), text: "Add your Instagram or other social links", href: "/admin/settings" },
    {
      done: SERVICE_PAGES.every((p) => c.seoPagesWithKeyword.includes(p)),
      text: "Add search phrases for the Architecture, Interior and Civil pages",
      href: "/admin/seo",
    },
  ];
  const left = todo.filter((t) => !t.done).length;

  return (
    <AdminShell title="Dashboard" intro={`Welcome${user.displayName ? `, ${user.displayName}` : ""}. Here is what is new and what is still to do.`}>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <li key={s.label}>
            <Link
              href={s.href}
              className={`block h-full p-5 transition-colors hover:border-ink ${s.strong ? "border-2 border-camel bg-white" : `${cardCls}`}`}
            >
              <span className="block text-sm text-muted">{s.label}</span>
              <span className="display mt-1 block text-4xl">{s.value}</span>
              {s.note ? <span className="mt-1 block text-xs text-muted">{s.note}</span> : null}
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-10 grid gap-8 lg:grid-cols-[3fr_2fr]">
        <section aria-labelledby="latest-h">
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="latest-h" className="display text-xl">
              Latest enquiries
            </h2>
            <Link href="/admin/enquiries" className="inline-flex min-h-11 items-center text-sm underline decoration-camel underline-offset-4">
              See all
            </Link>
          </div>
          {latest.rows.length === 0 ? (
            <p className={`${cardCls} mt-3 p-6`}>No enquiries yet. They appear here as soon as someone sends the Contact form.</p>
          ) : (
            <ul className={`${cardCls} mt-3 divide-y divide-ink/10`}>
              {latest.rows.map((e) => (
                <li key={e.id}>
                  <Link href={`/admin/enquiries/${e.id}`} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 hover:bg-paper-2/60">
                    <span className={e.status === "new" ? "font-semibold" : ""}>
                      <span className="font-mono text-sm text-camel-deep">{e.ref}</span> {e.name}
                      <span className="text-muted"> · {typeLabel(e.type)}</span>
                    </span>
                    <span className="flex items-center gap-2 text-sm">
                      <span className={`px-2 py-0.5 text-xs ${STATUS_STYLES[e.status] ?? ""}`}>{statusLabel(e.status)}</span>
                      <span className="text-muted">{formatIst(e.createdAt, "datetime")}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 border-l-4 border-ink/30 bg-white p-4 text-sm text-muted">
            Email alerts are off: there is no business email or mail server yet. New enquiries are saved here, so check this page
            often (the menu shows how many are new).
          </p>
        </section>

        <section aria-labelledby="todo-h">
          <h2 id="todo-h" className="display text-xl">
            Before launch {left ? `(${left} left)` : "(all done)"}
          </h2>
          <ul className={`${cardCls} mt-3 divide-y divide-ink/10`}>
            {todo.map((t) => (
              <li key={t.text}>
                <Link href={t.href} className="flex min-h-11 items-start gap-3 px-4 py-3 hover:bg-paper-2/60">
                  <span
                    aria-hidden
                    className={`mt-0.5 grid h-5 w-5 flex-none place-items-center border text-xs ${t.done ? "border-camel-deep bg-camel text-ink" : "border-ink/40"}`}
                  >
                    {t.done ? "✓" : ""}
                  </span>
                  <span className={t.done ? "text-muted line-through" : ""}>
                    <span className="sr-only">{t.done ? "Done: " : "To do: "}</span>
                    {t.text}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AdminShell>
  );
}
