import Link from "next/link";
import { countEnquiriesByStatus } from "@/lib/store";
import { logout } from "../login/actions";
import { AdminNav } from "./AdminNav";
import { requireAdmin } from "./guard";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  const counts = await countEnquiriesByStatus();
  return (
    <div className="min-h-screen bg-paper-2 lg:flex">
      <aside className="bg-ink text-paper lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:overflow-y-auto">
        <div className="flex items-center justify-between gap-3 px-6 py-4 lg:block lg:py-7">
          <Link href="/admin" className="display block text-lg leading-none tracking-[0.3em]" aria-label="Alvi Studio admin home">
            Alvi
            <span className="block text-[0.5rem] tracking-[0.45em] opacity-80">Studio admin</span>
          </Link>
          <div className="flex items-center gap-4 text-xs text-paper/70 lg:mt-5 lg:flex-col lg:items-start lg:gap-1 lg:border-t lg:border-paper/15 lg:pt-4">
            <span className="hidden lg:block">Signed in as {user.displayName || user.email}</span>
            <div className="flex gap-4">
              <Link href="/" target="_blank" className="inline-flex min-h-11 items-center underline-offset-4 hover:underline lg:min-h-8">
                View website
              </Link>
              <form action={logout}>
                <button type="submit" className="inline-flex min-h-11 items-center underline-offset-4 hover:underline lg:min-h-8">
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
        <AdminNav newCount={counts.new} />
      </aside>
      <main id="admin-main" className="min-w-0 flex-1 px-4 pb-24 pt-8 sm:px-8 lg:pt-12">
        {children}
      </main>
    </div>
  );
}
