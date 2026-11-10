import Link from "next/link";
import { LogoutButton } from "@/components/studio/LogoutButton";
import { apiGet } from "@/lib/studio/api";
import type { Me } from "@/lib/studio/types";

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const me = await apiGet<Me>("/auth/me");
  const isReviewer = me.role === "OLIVED_REVIEWER" || me.role === "OLIVED_ADMIN";

  return (
    <>
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/studio/designs" className="font-display text-xl">
              OLIVED Studio
            </Link>
            <Link href="/studio/designs">Designs</Link>
            {isReviewer && <Link href="/studio/review">Review</Link>}
          </nav>
          <div className="flex items-center gap-4">
            <span className="text-sm text-mid">{me.organization.name}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </>
  );
}
