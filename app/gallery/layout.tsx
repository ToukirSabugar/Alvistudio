import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { isPaused } from "@/lib/site";

// Paused for now (see PAUSED_PATHS in lib/site.ts): every page in this section returns 404.
export default function PausedSectionLayout({ children }: { children: ReactNode }) {
  if (isPaused("/gallery")) notFound();
  return children;
}
