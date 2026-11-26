"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = { href: string; label: string; icon: "designs" | "new" | "review" | "admin" };

const ICONS: Record<NavItem["icon"], React.ReactNode> = {
  designs: <path d="M4 5h7v7H4zM13 5h7v7h-7zM4 14h7v5H4zM13 14h7v5h-7z" />,
  new: <path d="M12 5v14M5 12h14" />,
  review: <path d="M5 12.5l4.2 4.2L19 7" />,
  admin: <path d="M4 19V10M10 19V5M16 19v-6M21 19H3" />,
};

/**
 * The Studio's main links, the current one highlighted. "Designs" stays highlighted inside a design;
 * "New design" only on its own page.
 */
export function StudioNav({ items }: { items: NavItem[] }) {
  const path = usePathname();
  const active = (href: string) =>
    href === "/studio/designs" ? path === href || (path.startsWith("/studio/designs/") && !path.startsWith("/studio/designs/new")) : path.startsWith(href);
  return (
    <nav className="studio-nav" aria-label="Studio">
      {items.map((item) => (
        <Link key={item.href} href={item.href} className="studio-nav-link" aria-current={active(item.href) ? "page" : undefined}>
          <svg viewBox="0 0 24 24" aria-hidden="true">{ICONS[item.icon]}</svg>
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
