import type { Metadata } from "next";
import { HeroTower } from "@/components/home/HeroTower";
import { MaterialsStory } from "@/components/home/MaterialsStory";
import { Services } from "@/components/home/Services";
import { ProofStrip } from "@/components/home/ProofStrip";
import { CtaBand } from "@/components/home/CtaBand";
import { siteConfig } from "@/lib/site";
import { getPageHero } from "@/lib/site-content-store";
import { buildPageMetadata } from "@/lib/page-metadata";
import { Faqs } from "@/components/Faqs";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/", {
    title: `Architect & Interior Designer in ${siteConfig.city} | ${siteConfig.name}`,
    description: `${siteConfig.name} by Fatma and Aqib: architecture, civil work and interior design in ${siteConfig.city}, ${siteConfig.region}. ${siteConfig.projects} projects in ${siteConfig.years} years. Plan your project with us.`,
  });
}

export default async function Home() {
  const hero = await getPageHero("/"); // null when unset or the database is down
  return (
    <>
      <HeroTower stillUrl={hero?.url} stillAlt={hero?.alt} />
      <MaterialsStory />
      <Services />
      <ProofStrip />
      <Faqs pagePath="/" />
      <CtaBand />
    </>
  );
}
