import { faqJsonLd, jsonLdString } from "@/lib/faq-schema";
import { listFaqs } from "@/lib/seo-store";

export async function Faqs({ pagePath, heading = "Frequently asked questions" }: { pagePath: string; heading?: string }) {
  const items = await listFaqs(pagePath);
  if (items.length === 0) return null;
  const data = faqJsonLd(items.map((f) => ({ question: f.question, answer: f.answer })));
  return (
    <section aria-labelledby="faq-heading" className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
      <h2 id="faq-heading" className="display text-center text-3xl sm:text-4xl">
        {heading}
      </h2>
      <div className="mt-6 divide-y divide-ink/20 border-y border-ink/20">
        {items.map((f) => (
          <details key={f.id} className="py-1">
            <summary className="flex min-h-11 cursor-pointer items-center py-2 text-lg font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-camel-deep">
              {f.question}
            </summary>
            <p className="whitespace-pre-line pb-4 text-base text-muted">{f.answer}</p>
          </details>
        ))}
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(data) }} />
    </section>
  );
}
