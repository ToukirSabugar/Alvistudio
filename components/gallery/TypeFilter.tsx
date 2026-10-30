import Link from "next/link";

export function TypeFilter({
  basePath,
  options,
  active,
  label,
}: {
  basePath: string;
  options: { id: string; label: string }[];
  active: string | null;
  label: string;
}) {
  const items = [{ id: "", label: "All" }, ...options];
  return (
    <nav aria-label={label}>
      <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
        {items.map((o) => {
          const on = (active ?? "") === o.id;
          return (
            <li key={o.id || "all"}>
              <Link
                href={o.id ? `${basePath}?type=${o.id}` : basePath}
                aria-current={on ? "page" : undefined}
                className={`inline-flex min-h-11 items-center border px-4 text-sm transition-colors ${
                  on ? "border-ink bg-ink text-paper" : "border-[var(--line)] hover:border-ink"
                }`}
              >
                {o.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
