import Link from "next/link";
import { notFound } from "next/navigation";
import { formatIst } from "@/lib/ist";
import { ENQUIRY_STATUSES, getEnquiry } from "@/lib/store";
import { statusLabel } from "@/lib/enquiry-status";
import { requireAdmin } from "../../guard";
import { ConfirmButton } from "../../ConfirmButton";
import { AdminShell, btnCls, btnDangerCls, btnQuietCls, cardCls, inputCls } from "../../ui";
import { changeStatus, removeEnquiry, saveNotes } from "../actions";
import { MarkSeen } from "../MarkSeen";
import { STATUS_STYLES, labelledDetails, typeLabel, whatsappLink } from "@/lib/enquiry-labels";

export const dynamic = "force-dynamic";

const SAVED: Record<string, { ok: boolean; text: string }> = {
  status: { ok: true, text: "Status updated." },
  notes: { ok: true, text: "Notes saved." },
  invalid: { ok: false, text: "That change was not valid. Nothing was saved." },
  db: { ok: false, text: "Could not reach the database. Nothing was saved." },
};

export default async function EnquiryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const { id: raw } = await params;
  const sp = await searchParams;
  const id = /^\d{1,10}$/.test(raw) ? Number(raw) : 0;
  const e = id > 0 ? await getEnquiry(id) : null;
  if (!e) notFound();
  const saved = typeof sp.saved === "string" ? SAVED[sp.saved] : undefined;
  const details = labelledDetails(e.type, e.details);

  return (
    <AdminShell title={e.ref} intro={`${typeLabel(e.type)} enquiry from ${e.name}, received ${formatIst(e.createdAt, "long")}.`}>
      {e.status === "new" ? <MarkSeen id={e.id} /> : null}
      <p className="-mt-4 mb-6">
        <Link href="/admin/enquiries" className="inline-flex min-h-11 items-center text-sm underline decoration-camel underline-offset-4">
          ← All enquiries
        </Link>
      </p>
      {saved ? (
        <p role={saved.ok ? "status" : "alert"} className={`mb-6 border-l-4 bg-white p-4 text-base ${saved.ok ? "border-camel-deep" : "border-red-800"}`}>
          {saved.text}
        </p>
      ) : null}

      <div className="mb-6 flex flex-wrap gap-2">
        <a href={`tel:${e.phone.replace(/[^\d+]/g, "")}`} className={btnCls}>
          Call {e.phone}
        </a>
        <a href={whatsappLink(e.phone)} target="_blank" rel="noopener noreferrer" className={btnQuietCls}>
          WhatsApp
        </a>
        {e.email ? (
          <a href={`mailto:${e.email}?subject=${encodeURIComponent(`Your enquiry ${e.ref}`)}`} className={btnQuietCls}>
            Email
          </a>
        ) : null}
      </div>

      <section aria-labelledby="msg-h" className="mb-6 border-l-4 border-camel bg-white p-5">
        <h2 id="msg-h" className="text-sm font-medium text-muted">
          Their message
        </h2>
        {e.message ? <p className="mt-2 whitespace-pre-wrap text-base">{e.message}</p> : <p className="mt-2 text-muted">They did not write a message.</p>}
      </section>

      <dl className={`${cardCls} divide-y divide-ink/10`}>
        {[
          ["Type", typeLabel(e.type)],
          ["Name", e.name],
          ["Phone", e.phone],
          ["Email", e.email],
          ...details,
          ["Received (India time)", formatIst(e.createdAt, "long")],
        ]
          .filter(([, v]) => v)
          .map(([k, v]) => (
            <div key={k} className="grid gap-1 px-5 py-3 sm:grid-cols-[14rem_1fr]">
              <dt className="text-muted">{k}</dt>
              <dd className="break-words font-medium">{v}</dd>
            </div>
          ))}
        <div className="grid gap-1 px-5 py-3 sm:grid-cols-[14rem_1fr]">
          <dt className="text-muted">Status</dt>
          <dd>
            <span className={`px-2 py-0.5 text-sm ${STATUS_STYLES[e.status] ?? ""}`}>{statusLabel(e.status)}</span>
          </dd>
        </div>
      </dl>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <form action={changeStatus} className={`${cardCls} space-y-3 p-5`}>
          <input type="hidden" name="id" value={e.id} />
          <label htmlFor="status" className="block text-base font-medium">
            Change status
          </label>
          <select id="status" name="status" defaultValue={e.status} className={inputCls}>
            {ENQUIRY_STATUSES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          <label htmlFor="note" className="block text-sm font-medium">
            Note for the history (optional)
          </label>
          <input id="note" name="note" maxLength={500} placeholder="e.g. Called, site visit on Saturday" className={inputCls} />
          <button type="submit" className={btnCls}>
            Update status
          </button>
        </form>
        <form action={saveNotes} className={`${cardCls} space-y-3 p-5`}>
          <input type="hidden" name="id" value={e.id} />
          <label htmlFor="notes" className="block text-base font-medium">
            Private notes
          </label>
          <textarea id="notes" name="notes" rows={5} maxLength={5000} defaultValue={e.notes} className={inputCls} />
          <button type="submit" className={btnCls}>
            Save notes
          </button>
        </form>
      </div>

      <section aria-labelledby="hist-h" className={`${cardCls} mt-6 p-5`}>
        <h2 id="hist-h" className="display text-lg">
          History
        </h2>
        <ol className="mt-3 space-y-2 text-sm">
          {e.events.map((ev, i) => (
            <li key={i} className="border-l-2 border-camel pl-3">
              <span className="font-medium">{ev.from ? `${statusLabel(ev.from)} → ${statusLabel(ev.to)}` : "Received"}</span>{" "}
              <span className="text-muted">· {formatIst(ev.createdAt, "datetime")}</span>
              {ev.note ? <span className="block text-muted">{ev.note}</span> : null}
            </li>
          ))}
        </ol>
      </section>

      <form action={removeEnquiry} className="mt-6 border border-red-800/40 bg-white p-5">
        <input type="hidden" name="id" value={e.id} />
        <p className="font-medium text-red-800">Delete this enquiry</p>
        <p className="mt-1 text-sm text-muted">Only when the person asks us to erase their details. It cannot be undone.</p>
        <div className="mt-3">
          <ConfirmButton message={`Permanently delete enquiry ${e.ref} and its history? This cannot be undone.`} className={btnDangerCls}>
            Delete permanently
          </ConfirmButton>
        </div>
      </form>
    </AdminShell>
  );
}
