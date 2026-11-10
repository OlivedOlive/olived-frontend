import Link from "next/link";
import { Suspense } from "react";
import { KeepSession } from "@/components/studio/KeepSession";
import { LogoutButton } from "@/components/studio/LogoutButton";
import { apiGet } from "@/lib/studio/api";
import type { Me } from "@/lib/studio/types";

// The header frame is static, so it shows at once; only the parts that depend on who is
// logged in wait for the API. Each page puts its own data behind a Suspense boundary too.
export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/studio/designs" className="font-display text-xl">
              OLIVED Studio
            </Link>
            <Link href="/studio/designs">Designs</Link>
            <Suspense>
              <ReviewLink />
            </Suspense>
          </nav>
          <div className="flex items-center gap-4">
            <Suspense fallback={<span className="h-4 w-24 animate-pulse bg-sand" aria-hidden />}>
              <OrganizationName />
            </Suspense>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      <KeepSession />
    </>
  );
}

// fetch() calls with the same URL and headers in one render are deduplicated, so both
// components below share a single /auth/me request.
async function ReviewLink() {
  const me = await apiGet<Me>("/auth/me");
  const isReviewer = me.role === "OLIVED_REVIEWER" || me.role === "OLIVED_ADMIN";
  return isReviewer ? <Link href="/studio/review">Review</Link> : null;
}

async function OrganizationName() {
  const me = await apiGet<Me>("/auth/me");
  return <span className="text-sm text-mid">{me.organization.name}</span>;
}
