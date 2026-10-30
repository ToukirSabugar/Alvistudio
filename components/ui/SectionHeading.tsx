import type { ReactNode } from "react";

/** Centred heading with an optional intro line and a small truss divider. */
export function SectionHeading({
  id,
  title,
  intro,
  dark = false,
  as: Tag = "h2",
}: {
  id?: string;
  title: ReactNode;
  intro?: ReactNode;
  /** True on black sections, so the intro uses the light muted colour. */
  dark?: boolean;
  as?: "h2" | "h3";
}) {
  return (
    <div className="mx-auto max-w-2xl text-center" data-reveal>
      <Tag id={id} className="display text-3xl sm:text-4xl">
        {title}
      </Tag>
      <svg viewBox="0 0 120 12" className="mx-auto mt-5 h-3 w-28" aria-hidden focusable="false" fill="none" strokeWidth="1.4">
        <path d="M0 6H44M76 6H120" stroke="var(--camel)" />
        <path d="M50 1L60 11L70 1M50 11L60 1L70 11" stroke="var(--camel)" />
      </svg>
      {intro && <p className={`mx-auto mt-5 max-w-xl ${dark ? "text-paper/75" : "text-muted"}`}>{intro}</p>}
    </div>
  );
}
