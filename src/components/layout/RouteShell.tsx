"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { stripLocale } from "@/i18n/config";

/** Adds the per-page wrapper class the ported CSS expects (the static site put it on <body>). */
export function RouteShell({ children }: { children: ReactNode }) {
  const pathname = stripLocale(usePathname());
  return <div className={pathname === "/maison" ? "page-maison" : undefined}>{children}</div>;
}
