import type { ReactNode } from "react";

// Shared admin styles. Square corners, paper / ink / camel, 44 px touch targets everywhere.
export const inputCls =
  "block w-full min-h-11 border border-ink/40 bg-white px-3 py-2 text-base text-ink focus:outline-2 focus:outline-offset-2 focus:outline-camel-deep";
export const btnCls =
  "inline-flex min-h-11 items-center justify-center gap-2 bg-camel px-6 text-base font-medium text-ink hover:bg-ink hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-50";
export const btnQuietCls =
  "inline-flex min-h-11 items-center justify-center gap-2 border border-ink/50 bg-white px-4 text-base text-ink hover:border-ink hover:bg-ink hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-40";
export const btnDangerCls =
  "inline-flex min-h-11 items-center justify-center gap-2 border border-red-800 bg-white px-4 text-base text-red-800 hover:bg-red-800 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-800";
export const cardCls = "border border-ink/15 bg-white";

/** Page frame inside the admin layout: one H1, an optional line of help and optional buttons on the right. */
export function AdminShell({
  title,
  intro,
  actions,
  children,
}: {
  title: string;
  intro?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="display text-2xl sm:text-3xl">{title}</h1>
          {intro ? <p className="mt-2 max-w-2xl text-base text-muted">{intro}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      <div className="mt-8">{children}</div>
    </div>
  );
}

export function Notice({ ok, error }: { ok?: string; error?: string }) {
  if (error === "invalid")
    return (
      <p role="alert" className="mb-6 border-l-4 border-red-800 bg-white p-4 text-base">
        Some fields were empty, too long or in the wrong format. Nothing was saved. Please check and try again.
      </p>
    );
  if (error === "upload")
    return (
      <p role="alert" className="mb-6 border-l-4 border-red-800 bg-white p-4 text-base">
        A photo could not be saved. It must be a real JPEG, PNG or WebP image up to 8 MB. Nothing was added.
      </p>
    );
  if (error)
    return (
      <p role="alert" className="mb-6 border-l-4 border-red-800 bg-white p-4 text-base">
        Could not reach the database. Nothing was saved. Try again in a minute.
      </p>
    );
  if (ok)
    return (
      <p role="status" className="mb-6 border-l-4 border-camel-deep bg-white p-4 text-base">
        Saved.
      </p>
    );
  return null;
}

export function Field({
  label,
  name,
  hint,
  children,
}: {
  label: string;
  name: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-base font-medium">
        {label}
      </label>
      {children}
      {hint ? <p className="mt-1 text-sm text-muted">{hint}</p> : null}
    </div>
  );
}

/** Save bar that stays at the bottom of the screen while a long form scrolls. */
export function SaveBar({ label, children }: { label: string; children?: ReactNode }) {
  return (
    <div className="sticky bottom-0 z-20 -mx-4 mt-8 flex flex-wrap items-center gap-3 border-t border-ink/20 bg-paper-2/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
      <button type="submit" className={btnCls}>
        {label}
      </button>
      {children}
    </div>
  );
}

/** A titled white box. */
export function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className={`${cardCls} p-4 sm:p-6`}>
      <h2 className="display text-lg">{title}</h2>
      {hint ? <p className="mt-1 text-sm text-muted">{hint}</p> : null}
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}
