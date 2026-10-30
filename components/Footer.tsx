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
    <footer className="bg-ink text-paper">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-8 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <p className="display text-2xl tracking-[0.3em]">Alvi Studio</p>
          <p className="mt-1 text-sm text-[var(--muted-on-dark)]">{siteConfig.byline}</p>
          <p className="mt-4 text-sm text-[var(--muted-on-dark)]">{siteConfig.tagline}</p>
        </div>
        <nav aria-label="Footer">
          <ul className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="inline-flex min-h-11 items-center hover:text-camel">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <address className="text-sm not-italic text-[var(--muted-on-dark)]">
          <p>{contact.address}</p>
          <p className="mt-3">
            <a href={`tel:${contact.phone}`} className="text-paper underline decoration-camel underline-offset-4">
              {contact.phoneDisplay}
            </a>
          </p>
          {contact.email ? (
            <p className="mt-1">
              <a href={`mailto:${contact.email}`} className="text-paper underline decoration-camel underline-offset-4">
                {contact.email}
              </a>
            </p>
          ) : null}
          <p className="mt-1">{contact.hours}</p>
          <p className="mt-3">
            <a href={contact.mapUrl} className="text-paper underline decoration-camel underline-offset-4">
              Open in Google Maps
            </a>
          </p>
          {socials.length > 0 ? (
            <ul className="mt-3 flex flex-wrap gap-x-4" aria-label="Social media">
              {socials.map((x) => (
                <li key={x.label}>
                  <a href={x.href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-paper underline decoration-camel underline-offset-4">
                    {x.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </address>
      </div>
      <p className="border-t border-[var(--line-on-dark)] px-4 py-5 text-center text-xs text-[var(--muted-on-dark)]">
        © {siteConfig.name} {siteConfig.byline}, {siteConfig.city}
      </p>
    </footer>
  );
}
