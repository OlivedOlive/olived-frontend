import Link from "next/link";
import { Suspense } from "react";
import { KeepSession } from "@/components/studio/KeepSession";
import { LogoutButton } from "@/components/studio/LogoutButton";
import { StudioMark } from "@/components/studio/StudioMark";
import { StudioNav, type NavItem } from "@/components/studio/StudioNav";
import { apiGet } from "@/lib/studio/api";
import type { Me, Role } from "@/lib/studio/types";

const BASE_ITEMS: NavItem[] = [{ href: "/studio/designs", label: "My designs", icon: "designs" }];
const ROLE_LABEL: Record<Role, string> = {
  CLIENT_MEMBER: "Member", CLIENT_ADMIN: "Client admin", OLIVED_REVIEWER: "OLIVED reviewer", OLIVED_ADMIN: "OLIVED admin",
};

// The header frame is static, so it shows at once; only the parts that depend on who is
// logged in wait for the API. Each page puts its own data behind a Suspense boundary too.
export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="studio-shell min-h-screen">
      <header className="studio-topbar">
        <div className="studio-topbar-inner">
          <Link href="/studio/designs" className="studio-brand" aria-label="OLIVED Studio, my designs">
            <StudioMark />
            <span className="studio-brand-name">OLIVED <span>Studio</span></span>
          </Link>
          <Suspense fallback={<StudioNav items={BASE_ITEMS} />}>
            <Navigation />
          </Suspense>
          <div className="studio-topbar-end">
            <Link href="/studio/designs/new" className="studio-topbar-new">
              <span aria-hidden="true">＋</span> New design
            </Link>
            <Suspense fallback={<span className="studio-account studio-account-loading" aria-hidden />}>
              <Account />
            </Suspense>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
      <KeepSession />
    </div>
  );
}

// fetch() calls with the same URL and headers in one render are deduplicated, so both
// components below share a single /auth/me request.
async function Navigation() {
  const me = await apiGet<Me>("/auth/me");
  const items = [...BASE_ITEMS];
  if (me.role === "OLIVED_REVIEWER") items.push({ href: "/studio/review", label: "Review", icon: "review" });
  if (me.role === "OLIVED_ADMIN") items.push({ href: "/studio/admin", label: "Admin dashboard", icon: "admin" });
  return <StudioNav items={items} />;
}

async function Account() {
  const me = await apiGet<Me>("/auth/me");
  const initials = me.user.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]!.toUpperCase()).join("") || "?";
  return (
    <div className="studio-account">
      <span className="studio-avatar" aria-hidden="true">{initials}</span>
      <span className="studio-account-text">
        <span className="studio-account-name">{me.user.name}</span>
        <span className="studio-account-org">{me.organization.name} · {ROLE_LABEL[me.role]}</span>
      </span>
      <LogoutButton />
    </div>
  );
}
