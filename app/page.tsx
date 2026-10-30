import type { Metadata } from "next";
import { PlotToHome } from "@/components/home/PlotToHome";
import { StudioIntro } from "@/components/home/StudioIntro";
import { ServicesDetail } from "@/components/home/ServicesDetail";
import { ProcessLine } from "@/components/home/ProcessLine";
import { StartProject } from "@/components/home/StartProject";
import { TestimonialCard } from "@/components/testimonials/TestimonialCard";
import { IconBadge } from "@/components/ui/IconBadge";
import { Faqs } from "@/components/Faqs";
import { MIN_TESTIMONIALS, siteConfig } from "@/lib/site";
import { getTestimonials } from "@/lib/store";
import { buildPageMetadata } from "@/lib/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/", {
    title: `Architect & Interior Designer in ${siteConfig.city} | ${siteConfig.name}`,
    description: `${siteConfig.name} by Fatma and Aqib: architecture, civil work and interior design in ${siteConfig.city}, ${siteConfig.region}. ${siteConfig.projects} projects in ${siteConfig.years} years. Plan your project with us.`,
  });
}

/** Real reviews only, and only once there are enough of them (the same rule as the menu). */
async function HomeTestimonials() {
  const all = await getTestimonials();
  if (all.length < MIN_TESTIMONIALS) return null;
  return (
    <section aria-labelledby="reviews-h" className="bg-paper-2 text-ink">
      <div className="mx-auto max-w-[90rem] px-5 py-24 sm:px-10">
        <IconBadge name="quote" size="md" className="text-camel-deep" />
        <h2 id="reviews-h" className="serif mt-6 text-4xl sm:text-5xl">
          In their <em className="text-camel-deep">words.</em>
        </h2>
        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {all.slice(0, 3).map((t, i) => (
            <li key={t.id} data-reveal style={{ transitionDelay: `${i * 0.12}s` }}>
              <TestimonialCard t={t} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <PlotToHome />
      <StudioIntro />
      <ServicesDetail />
      <ProcessLine />
      <HomeTestimonials />
      <div className="bg-paper text-ink">
        <Faqs pagePath="/" />
      </div>
      <StartProject />
    </>
  );
}
