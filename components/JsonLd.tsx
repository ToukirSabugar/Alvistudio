import { siteConfig } from "@/lib/site";
import type { ContactSettings } from "@/lib/settings";
import { jsonLdString } from "@/lib/faq-schema";

// LocalBusiness data that matches what is visible on the site. Rating figures are the JustDial
// listing's own numbers; remove `aggregateRating` if the owner prefers not to show them in search.
export function LocalBusinessJsonLd({ contact }: { contact: ContactSettings }) {
  const data = {
    "@context": "https://schema.org",
    "@type": ["Architect", "HomeAndConstructionBusiness"],
    name: `${siteConfig.name} ${siteConfig.byline}`,
    url: siteConfig.url,
    telephone: contact.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: contact.address,
      addressLocality: siteConfig.city,
      postalCode: "383001",
      addressRegion: siteConfig.region,
      addressCountry: "IN",
    },
    areaServed: siteConfig.city,
    sameAs: [contact.ratingUrl, contact.instagram, contact.facebook, contact.youtube].filter(Boolean),
    ...(contact.email ? { email: contact.email } : {}),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: siteConfig.rating.value,
      ratingCount: siteConfig.rating.count,
    },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(data) }} />;
}
