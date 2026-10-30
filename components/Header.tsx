"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "./Button";
import { SoundToggle } from "./SoundToggle";

type NavItem = { href: string; label: string };

/** Fixed header: clear over the top of the page, a soft solid band once the visitor scrolls. */
export function Header({ links, phone, phoneDisplay }: { links: NavItem[]; phone: string; phoneDisplay: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pastStory, setPastStory] = useState(false);
  // Light text while the home page's dark 3D story is behind the header, dark text after it.
  const dark = pathname === "/" && !pastStory;

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      const story = document.querySelector(".story-stage");
      setPastStory(story ? story.getBoundingClientRect().bottom < 64 : false);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  // Close the menu on navigation (adjusting state during render, as React recommends).
  const [menuPath, setMenuPath] = useState(pathname);
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setOpen(false);
  }

  const tone = dark || open ? "text-paper" : "text-ink";
  const band = open
    ? "bg-[var(--stage)]"
    : scrolled
      ? dark
        ? "bg-[rgba(13,12,10,0.72)] backdrop-blur-md"
        : "bg-[rgba(244,241,234,0.88)] backdrop-blur-md shadow-[0_1px_0_var(--line)]"
      : "bg-transparent";

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${tone} ${band}`}>
      <div className="mx-auto flex max-w-[90rem] items-center justify-between gap-6 px-5 py-3 sm:px-10">
        <Link href="/" className="flex min-h-11 flex-col justify-center leading-none" aria-label="Alvi Studio, home">
          <span className="serif text-2xl tracking-[0.18em]">ALVI</span>
          <span className="mt-1 whitespace-nowrap text-[0.55rem] tracking-[0.28em] uppercase opacity-75 sm:tracking-[0.42em]">Studio · Fatma &amp; Aqib</span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-7 xl:flex">
          {links
            .filter((l) => l.href !== "/")
            .map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={pathname === l.href ? "page" : undefined}
                className="py-2 text-[0.78rem] tracking-[0.14em] uppercase decoration-camel underline-offset-8 hover:underline aria-[current=page]:underline"
              >
                {l.label}
              </Link>
            ))}
        </nav>

        <div className="flex items-center gap-4 sm:gap-6">
          <SoundToggle dark={dark || open} />
          <div className="hidden xl:block">
            <Button href="/contact" variant={dark ? "onDark" : "primary"}>
              Start a project
            </Button>
          </div>
          <button
            type="button"
            className="flex min-h-11 min-w-11 items-center justify-center xl:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span aria-hidden className="relative block h-3 w-7">
              <span className={`absolute left-0 h-px w-7 bg-current transition-all ${open ? "top-1.5 rotate-45" : "top-0"}`} />
              <span className={`absolute left-0 top-3 h-px w-7 bg-current transition-all ${open ? "top-1.5 -rotate-45" : ""}`} />
            </span>
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="max-h-[calc(100svh-4.5rem)] overflow-y-auto bg-[var(--stage)] px-5 pb-10 pt-2 text-paper sm:px-10 xl:hidden">
          <ul className="flex flex-col">
            {links.map((l) => (
              <li key={l.href} className="border-b border-[var(--line-on-dark)]">
                <Link
                  href={l.href}
                  aria-current={pathname === l.href ? "page" : undefined}
                  className="serif flex min-h-14 items-center text-2xl aria-[current=page]:text-camel"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-col gap-4 text-sm">
            <a href={`tel:${phone}`} className="link-dark inline-flex min-h-11 items-center">
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
