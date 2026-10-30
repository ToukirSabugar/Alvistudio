import type { ContactSettings } from "@/lib/settings";

const cls =
  "flex min-h-11 min-w-11 items-center justify-center px-4 text-xs tracking-[0.14em] uppercase font-medium shadow-lg transition-colors";

export function FloatingActions({ contact }: { contact: ContactSettings }) {
  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-2">
      <a
        href={`https://wa.me/${contact.whatsapp}`}
        className={`${cls} border-2 border-ink bg-camel text-ink hover:bg-ink hover:text-paper`}
        aria-label="Chat on WhatsApp"
      >
        WhatsApp
      </a>
      <a href={`tel:${contact.phone}`} className={`${cls} border-2 border-camel bg-ink text-paper hover:bg-camel hover:text-ink`} aria-label="Call Alvi Studio">
        Call
      </a>
    </div>
  );
}
