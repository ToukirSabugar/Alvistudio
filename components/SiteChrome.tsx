"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { isAdminArea } from "@/lib/admin-paths";

/** Public header, footer and floating buttons. Hidden inside /admin, which has its own layout. */
export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return isAdminArea(pathname) ? null : <>{children}</>;
}
