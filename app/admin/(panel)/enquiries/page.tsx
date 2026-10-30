import Link from "next/link";
import { enquiryTypes } from "@/lib/enquiry-schema";
import { filterQuery, parseEnquiryFilter } from "@/lib/enquiry-filters";
import { formatIst } from "@/lib/ist";
import { ENQUIRY_STATUSES, countEnquiriesByStatus, searchEnquiries } from "@/lib/store";
import { statusLabel } from "@/lib/enquiry-status";
import { requireAdmin } from "../guard";
import { AdminShell, btnCls, btnQuietCls, cardCls, inputCls } from "../ui";
import { STATUS_STYLES, TYPE_LABELS, typeLabel } from "@/lib/enquiry-labels";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;
const RANGES = [
  { id: undefined, label: "All time" },
  { id: "today", label: "Today" },
  { id: "week", label: "Last 7 days" },
  { id: "month", label: "This month" },
] as const;

const chip = (on: boolean) =>
  `inline-flex min-h-11 items-center whitespace-nowrap border px-4 text-sm ${
    on ? "border-ink bg-ink text-paper" : "border-ink/40 bg-white text-ink hover:border-ink"
  }`;

export default async function EnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const f = parseEnquiryFilter(sp);
  const [{ rows, total }, counts] = await Promise.all([
    searchEnquiries(f, PAGE_SIZE, (f.page - 1) * PAGE_SIZE),
    countEnquiriesByStatus(),
  ]);
  const all = ENQUIRY_STATUSES.reduce((n, s) => n + counts[s.id], 0);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const exportQs = filterQuery(f, { page: 1 });
  const link = (o: Parameters<typeof filterQuery>[1]) => {
    const q = filterQuery(f, { page: 1, ...o });
    return q ? `/admin/enquiries?${q}` : "/admin/enquiries";
  };
  const filtered = Boolean(f.q || f.status || f.type || f.range || f.from || f.to);

  return (
    <AdminShell
      title={`Enquiries (${total})`}
      intro="Newest first. Open one to call or WhatsApp the visitor, change its status and keep private notes."
      actions={
        <a href={`/api/admin/enquiries/export${exportQs ? `?${exportQs}` : ""}`} className={btnQuietCls}>
          Export CSV
        </a>
      }
    >
      {sp.deleted === "1" ? (
        <p role="status" className="mb-6 border-l-4 border-camel-deep bg-white p-4 text-base">
          The enquiry was deleted.
        </p>
      ) : null}

      <nav aria-label="Filter by status" className="mb-3 flex flex-wrap gap-2">
        <Link href={link({ status: undefined })} aria-current={!f.status ? "true" : undefined} className={chip(!f.status)}>
          All ({all})
        </Link>
        {ENQUIRY_STATUSES.map((s) => (
          <Link key={s.id} href={link({ status: s.id })} aria-current={f.status === s.id ? "true" : undefined} className={chip(f.status === s.id)}>
            {s.label} ({counts[s.id]})
          </Link>
        ))}
      </nav>

      <nav aria-label="Quick date filters" className="mb-5 flex flex-wrap gap-2">
        {RANGES.map((r) => {
          const on = f.range === r.id && (r.id !== undefined || (!f.from && !f.to));
          return (
            <Link key={r.label} href={link({ range: r.id, from: undefined, to: undefined })} aria-current={on ? "true" : undefined} className={chip(on)}>
              {r.label}
            </Link>
          );
        })}
      </nav>

      <form role="search" className={`${cardCls} mb-6 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto] lg:items-end`}>
        {f.status ? <input type="hidden" name="status" value={f.status} /> : null}
        <div className="sm:col-span-2 lg:col-span-1">
          <label htmlFor="q" className="mb-1 block text-sm font-medium">
            Search
          </label>
          <input id="q" name="q" type="search" defaultValue={f.q} placeholder="Name, phone or reference" maxLength={80} className={inputCls} />
        </div>
        <div>
          <label htmlFor="type" className="mb-1 block text-sm font-medium">
            Type
          </label>
          <select id="type" name="type" defaultValue={f.type ?? ""} className={inputCls}>
            <option value="">All types</option>
            {enquiryTypes.map((t) => (
              <option key={t} value={t}>
                {TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="from" className="mb-1 block text-sm font-medium">
            From
          </label>
          <input id="from" name="from" type="date" defaultValue={f.from ?? ""} className={inputCls} />
        </div>
        <div>
          <label htmlFor="to" className="mb-1 block text-sm font-medium">
            To
          </label>
          <input id="to" name="to" type="date" defaultValue={f.to ?? ""} className={inputCls} />
        </div>
        <div className="flex gap-2">
          <button type="submit" className={btnCls}>
            Filter
          </button>
          {filtered ? (
            <Link href="/admin/enquiries" className={btnQuietCls}>
              Clear
            </Link>
          ) : null}
        </div>
      </form>

      {rows.length === 0 ? (
        <p className={`${cardCls} p-6 text-base`}>
          {filtered
            ? "No enquiries match this filter."
            : "No enquiries yet. When someone sends the form on the Contact page, it appears here with a reference number."}
        </p>
      ) : (
        <ul className={`${cardCls} divide-y divide-ink/10`}>
          {rows.map((r) => (
            <li key={r.id}>
              <Link
                href={`/admin/enquiries/${r.id}`}
                className={`grid gap-1 px-4 py-4 hover:bg-paper-2/60 sm:grid-cols-[9rem_1fr_auto] sm:items-center sm:gap-4 ${r.status === "new" ? "font-semibold" : ""}`}
              >
                <span className="font-mono text-sm text-camel-deep">{r.ref}</span>
                <span className="min-w-0">
                  <span className="block">
                    {r.name} <span className="font-normal text-muted">· {typeLabel(r.type)} · {r.phone}</span>
                  </span>
                  {r.message ? <span className="block truncate text-sm font-normal text-muted">{r.message}</span> : null}
                </span>
                <span className="flex flex-wrap items-center gap-3 text-sm font-normal">
                  <span className={`px-2 py-0.5 text-xs ${STATUS_STYLES[r.status] ?? ""}`}>{statusLabel(r.status)}</span>
                  <span className="whitespace-nowrap text-muted">{formatIst(r.createdAt, "datetime")}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {pages > 1 ? (
        <nav aria-label="Pages" className="mt-6 flex flex-wrap items-center gap-3">
          {f.page > 1 ? (
            <Link href={`/admin/enquiries?${filterQuery(f, { page: f.page - 1 })}`} className={btnQuietCls}>
              Previous
            </Link>
          ) : null}
          <span className="text-sm text-muted">
            Page {f.page} of {pages}
          </span>
          {f.page < pages ? (
            <Link href={`/admin/enquiries?${filterQuery(f, { page: f.page + 1 })}`} className={btnQuietCls}>
              Next
            </Link>
          ) : null}
        </nav>
      ) : null}
    </AdminShell>
  );
}
