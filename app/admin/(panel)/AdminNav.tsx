"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const groups = [
  {
    title: "Overview",
    links: [
      { href: "/admin", label: "Dashboard" },
      { href: "/admin/enquiries", label: "Enquiries" },
    ],
  },
  {
    title: "Website content",
    links: [
      { href: "/admin/gallery", label: "Gallery" },
      { href: "/admin/heroes", label: "Page images" },
      { href: "/admin/testimonials", label: "Testimonials" },
      { href: "/admin/team", label: "Fatma and Aqib" },
      { href: "/admin/blog", label: "Blog posts" },
      { href: "/admin/faqs", label: "FAQs" },
    ],
  },
  {
    title: "Search",
    links: [{ href: "/admin/seo", label: "SEO" }],
  },
  {
    title: "Studio",
    links: [
      { href: "/admin/settings", label: "Company details" },
      { href: "/admin/account", label: "Account" },
    ],
  },
];

/** The admin menu. The page you are on is highlighted; new enquiries show a count. */
export function AdminNav({ newCount }: { newCount: number }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`));

  return (
    <nav aria-label="Admin" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:gap-0 lg:overflow-visible lg:pb-8">
      {groups.map((g) => (
        <div key={g.title} className="flex gap-1 lg:mt-5 lg:block lg:space-y-0.5">
          <p className="hidden px-3 pb-1 text-[11px] uppercase tracking-[0.18em] text-paper/45 lg:block">{g.title}</p>
          {g.links.map(({ href, label }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 items-center gap-2 whitespace-nowrap border-l-2 px-3 text-sm transition-colors ${
                  active ? "border-camel bg-paper/10 text-paper" : "border-transparent text-paper/75 hover:bg-paper/5 hover:text-paper"
                }`}
              >
                {label}
                {href === "/admin/enquiries" && newCount > 0 && (
                  <span className="ml-auto bg-camel px-2 py-0.5 text-xs font-semibold text-ink" aria-label={`${newCount} new`}>
                    {newCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
