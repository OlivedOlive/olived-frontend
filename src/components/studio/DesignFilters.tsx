"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { DESIGN_VIEWS, type DesignView } from "@/lib/studio/design-views";

/**
 * The filters of the admin design list: a status chip row, then search, market and sort. They live in the
 * page address, so a filtered view can be bookmarked or shared, and "Show more" keeps them.
 */
export function DesignFilters({ view, counts, markets }: {
  view: DesignView;
  counts: Record<DesignView, number>;
  markets: { code: string; name: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [text, setText] = useState(params.get("q") ?? "");
  const typing = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** The address with these filters changed; paging of the lists starts again. */
  function hrefWith(changes: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString());
    for (const key of ["changes", "approved", "drafts", "list"]) next.delete(key);
    for (const [key, value] of Object.entries(changes)) {
      if (value === null || value === "" || (key === "show" && value === "all") || (key === "sort" && value === "recent")) next.delete(key);
      else next.set(key, value);
    }
    const query = next.toString();
    return query ? `${pathname}?${query}` : pathname;
  }
  const go = (changes: Record<string, string | null>) => startTransition(() => router.replace(hrefWith(changes), { scroll: false }));

  // Search as you type, after a short pause.
  useEffect(() => () => { if (typing.current) clearTimeout(typing.current); }, []);
  const onText = (value: string) => {
    setText(value);
    if (typing.current) clearTimeout(typing.current);
    typing.current = setTimeout(() => go({ q: value.trim() || null }), 350);
  };

  const active = view !== "all" || Boolean(params.get("q")) || Boolean(params.get("market")) || Boolean(params.get("sort"));

  return (
    <div className="admin-filters" aria-busy={pending}>
      <nav className="admin-chips" aria-label="Filter designs by status">
        {DESIGN_VIEWS.map((item) => (
          <Link key={item.id} href={hrefWith({ show: item.id })} scroll={false} replace className="admin-chip"
            aria-current={view === item.id ? "true" : undefined} data-tone={item.id} data-empty={counts[item.id] === 0}>
            {item.label}<span>{counts[item.id]}</span>
          </Link>
        ))}
      </nav>
      <div className="admin-filter-row" role="search">
        <input className="input min-h-10 flex-1" type="search" value={text} onChange={(e) => onText(e.target.value)}
          placeholder="Search design, company, or creator name or email" aria-label="Search designs" />
        <select className="input min-h-10 w-auto" value={params.get("market") ?? ""} aria-label="Market"
          onChange={(e) => go({ market: e.target.value || null })}>
          <option value="">All markets</option>
          {markets.map((m) => <option key={m.code} value={m.code}>{m.name}</option>)}
        </select>
        <select className="input min-h-10 w-auto" value={params.get("sort") ?? "recent"} aria-label="Sort"
          onChange={(e) => go({ sort: e.target.value })}>
          <option value="recent">Latest change first</option>
          <option value="oldest">Oldest change first</option>
          <option value="name">Name A–Z</option>
        </select>
        {active && (
          <Link href={pathname} scroll={false} replace className="btn btn-outline min-h-10" onClick={() => setText("")}>Clear filters</Link>
        )}
      </div>
    </div>
  );
}
