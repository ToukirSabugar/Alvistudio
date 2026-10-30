import type { Metadata } from "next";
import { Hanken_Grotesk, Josefin_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingActions } from "@/components/FloatingActions";
import { MotionInit } from "@/components/MotionInit";
import { SiteChrome } from "@/components/SiteChrome";
import { LocalBusinessJsonLd } from "@/components/JsonLd";
import { siteConfig, navLinks, MIN_TESTIMONIALS } from "@/lib/site";
import { getTestimonials } from "@/lib/store";
import { getContactSettings } from "@/lib/settings";

// The menu shows Testimonials only once real reviews exist, so refresh it every minute.
export const revalidate = 60;

const display =Josefin_Sans({ variable: "--font-josefin", subsets: ["latin"], weight: ["300", "400", "600"] });
const body = Hanken_Grotesk({ variable: "--font-hanken", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} ${siteConfig.byline} | Architects in ${siteConfig.city}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: `Architecture, civil work and interior design in ${siteConfig.city}, ${siteConfig.region}. ${siteConfig.projects} projects in ${siteConfig.years} years.`,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const showTestimonials = (await getTestimonials()).length >= MIN_TESTIMONIALS;
  const links = navLinks(showTestimonials);
  const contact = await getContactSettings();
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="flex min-h-screen flex-col">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <SiteChrome>
          <Header links={links} phone={contact.phone} phoneDisplay={contact.phoneDisplay} />
        </SiteChrome>
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteChrome>
          <Footer links={links} contact={contact} />
          <FloatingActions contact={contact} />
        </SiteChrome>
        <MotionInit />
        <LocalBusinessJsonLd contact={contact} />
      </body>
    </html>
  );
}
