import Link from "next/link";
import { siteConfig } from "@/lib/site";
import type { ContactSettings } from "@/lib/settings";

type NavItem = { href: string; label: string };

export function Footer({ links, contact }: { links: NavItem[]; contact: ContactSettings }) {
  const socials = [
    { label: "Instagram", href: contact.instagram },
    { label: "Facebook", href: contact.facebook },
    { label: "YouTube", href: contact.youtube },
  ].filter((x) => x.href);
  return (
    <footer className="overflow-hidden bg-[var(--stage)] text-paper">
      <div className="mx-auto grid max-w-[90rem] gap-12 px-5 pb-10 pt-20 sm:px-10 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="serif text-3xl tracking-[0.18em]">ALVI</p>
          <p className="mt-1 text-[0.6rem] tracking-[0.42em] uppercase text-[var(--muted-on-dark)]">Studio · Fatma &amp; Aqib</p>
          <p className="mt-6 max-w-sm text-sm text-[var(--muted-on-dark)]">{siteConfig.tagline}</p>
        </div>

        <nav aria-label="Footer">
          <p className="eyebrow text-camel">Pages</p>
          <ul className="mt-4 grid grid-cols-2 gap-x-6">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="inline-flex min-h-11 items-center text-sm text-paper/85 hover:text-camel">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <address className="text-sm not-italic text-[var(--muted-on-dark)]">
          <p className="eyebrow text-camel">Studio</p>
          <p className="mt-4 max-w-xs leading-relaxed">{contact.address}</p>
          <p className="mt-1">{contact.hours}</p>
          <ul className="mt-3 space-y-0">
            <li>
              <a href={`tel:${contact.phone}`} className="link-dark inline-flex min-h-11 items-center">
                {contact.phoneDisplay}
              </a>
            </li>
            {contact.email ? (
              <li>
                <a href={`mailto:${contact.email}`} className="link-dark inline-flex min-h-11 items-center break-all">
                  {contact.email}
                </a>
              </li>
            ) : null}
            <li>
              <a href={contact.mapUrl} className="link-dark inline-flex min-h-11 items-center">
                Open in Google Maps
              </a>
            </li>
          </ul>
          {socials.length > 0 ? (
            <ul className="mt-2 flex flex-wrap gap-x-5" aria-label="Social media">
              {socials.map((x) => (
                <li key={x.label}>
                  <a href={x.href} target="_blank" rel="noopener noreferrer" className="link-dark inline-flex min-h-11 items-center">
                    {x.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </address>
      </div>

      <div className="mx-auto flex max-w-[90rem] flex-col gap-2 border-t border-[var(--line-on-dark)] px-5 py-6 text-xs text-[var(--muted-on-dark)] sm:flex-row sm:justify-between sm:px-10">
        <p>
          © {siteConfig.name} {siteConfig.byline}, {siteConfig.city}
        </p>
      </div>
    </footer>
  );
}
