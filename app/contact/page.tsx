import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/page-metadata";
import { EnquiryForm } from "@/components/contact/EnquiryForm";
import { enquiryTypes, type EnquiryType } from "@/lib/enquiry-schema";
import { siteConfig } from "@/lib/site";
import { getContactSettings } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/contact", {
  title: "Contact Alvi Studio in Himatnagar",
  description:
    "Send an enquiry to Alvi Studio in Himatnagar for architecture, interior design or civil work, or book a consultation. Call, WhatsApp or visit our Alkapuri studio.",
  });
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ContactPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const contact = await getContactSettings();
  const raw = Array.isArray(sp.type) ? sp.type[0] : sp.type;
  const initialType: EnquiryType = (enquiryTypes as readonly string[]).includes(raw ?? "")
    ? (raw as EnquiryType)
    : "consultation";

  return (
    <div className="bg-paper text-ink">
      <section className="mx-auto grid min-w-0 max-w-6xl gap-12 px-4 pb-20 pt-28 sm:px-6 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
        <div>
          <h1 className="display text-[1.7rem] sm:text-5xl">Contact Alvi Studio in {siteConfig.city}</h1>
          <p className="mt-6 max-w-md text-muted">
            Tell us what you plan to build or renovate. We reply to every enquiry by phone or WhatsApp.
          </p>
          <dl className="mt-10 space-y-6">
            <div>
              <dt className="text-sm font-medium">Phone</dt>
              <dd>
                <a
                  href={`tel:${contact.phone}`}
                  className="inline-flex min-h-11 items-center underline decoration-camel underline-offset-4"
                >
                  {contact.phoneDisplay}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium">WhatsApp</dt>
              <dd>
                <a
                  href={`https://wa.me/${contact.whatsapp}`}
                  className="inline-flex min-h-11 items-center underline decoration-camel underline-offset-4"
                >
                  Chat on WhatsApp
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium">Studio</dt>
              <dd>
                {contact.address}
                <br />
                <a
                  href={contact.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center text-camel-deep underline underline-offset-4"
                >
                  Open in Google Maps
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium">Hours</dt>
              <dd>{contact.hours}</dd>
            </div>
          </dl>
        </div>
        <div className="border border-ink/20 bg-paper p-5 sm:p-8">
          <EnquiryForm initialType={initialType} />
        </div>
      </section>
    </div>
  );
}
