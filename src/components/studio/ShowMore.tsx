import Link from "next/link";

/** How many rows each admin list shows at first, and how many each "Show more" adds. */
export const PAGE_STEP = 12;
/** The server returns at most this many rows per request. */
export const PAGE_MAX = 100;

type Query = Record<string, string | string[] | undefined>;

/** The number of rows a list shows, read from the page address (for example `?approved=24`). */
export function shownCount(query: Query, key: string, first = PAGE_STEP) {
  const value = Number(query[key]);
  return Number.isInteger(value) && value > 0 ? Math.min(value, PAGE_MAX) : first;
}

/**
 * "Show more" for a long admin list: it keeps the other lists as they are and asks for more rows
 * of this one. Hidden once everything is shown, or at the server's page limit.
 */
export function ShowMore({ query, param, shown, total, anchor }: {
  query: Query;
  param: string;
  shown: number;
  total: number;
  anchor: string;
}) {
  if (shown >= total) return null;
  if (shown >= PAGE_MAX) {
    return <p className="text-sm text-mid">Showing the latest {PAGE_MAX} of {total}.</p>;
  }
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (typeof value === "string") params.set(key, value);
  }
  params.set(param, String(Math.min(shown + PAGE_STEP, PAGE_MAX)));
  return (
    <Link href={`?${params}#${anchor}`} scroll={false} className="btn btn-outline justify-self-start">
      Show more ({total - shown} more)
    </Link>
  );
}
