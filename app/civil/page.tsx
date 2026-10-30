import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/page-metadata";
import { ServicePage } from "@/components/service/ServicePage";
import { services } from "@/content/services";

const s = services.civil;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/civil", {
  title: s.metaTitle,
  description: s.metaDescription,
  });
}

export default function Page() {
  return <ServicePage slug="civil" />;
}
