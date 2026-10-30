import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/page-metadata";
import { ServicePage } from "@/components/service/ServicePage";
import { services } from "@/content/services";

const s = services.architecture;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/architecture", {
  title: s.metaTitle,
  description: s.metaDescription,
  });
}

export default function Page() {
  return <ServicePage slug="architecture" />;
}
