"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "./Button";

type NavItem = { href: string; label: string };

export function Header({ links, phone, phoneDisplay }: { links: NavItem[]; phone: string; phoneDisplay: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const dark = pathname === "/";
  const tone = dark ? "text-paper" : "text-ink";

  return (
    <header className={`absolute inset-x-0 top-0 z-50 ${tone}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-5 sm:px-8">
        <Link href="/" className="display text-lg leading-none tracking-[0.3em]" onClick={() => setOpen(false)}>
          Alvi
          <span className="block text-[0.5rem] tracking-[0.45em] opacity-80">Studio</span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-6 lg:flex">
          {links
            .filter((l) => l.href !== "/")
            .map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={pathname === l.href ? "page" : undefined}
                className="text-xs tracking-[0.18em] uppercase underline-offset-8 decoration-camel hover:underline aria-[current=page]:underline"
              >
                {l.label}
              </Link>
            ))}
        </nav>

        <div className="hidden lg:block">
          <Button href="/contact" variant={dark ? "onDark" : "outline"}>
            Start a project
          </Button>
        </div>

        <button
          type="button"
          className="flex min-h-11 min-w-11 items-center justify-center lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <span aria-hidden className="relative block h-3 w-6">
            <span className={`absolute left-0 h-px w-6 bg-current transition-all ${open ? "top-1.5 rotate-45" : "top-0"}`} />
            <span className={`absolute left-0 top-3 h-px w-6 bg-current transition-all ${open ? "top-1.5 -rotate-45" : ""}`} />
          </span>
        </button>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="bg-ink px-4 pb-8 pt-2 text-paper lg:hidden">
          <ul className="flex flex-col">
            {links.map((l) => (
              <li key={l.href} className="border-b border-[var(--line-on-dark)]">
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="display flex min-h-12 items-center text-base tracking-[0.2em]"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-col gap-3 text-sm">
            <a href={`tel:${phone}`} className="underline decoration-camel underline-offset-4">
              {phoneDisplay}
            </a>
            <Button href="/contact" variant="onDark" className="w-full">
              Start a project
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
}
