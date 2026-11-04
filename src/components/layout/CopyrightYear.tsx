"use client";

import { useSyncExternalStore } from "react";

/**
 * The current year, read in the browser. Pages are prerendered at build time, so a
 * server-side `new Date()` would freeze the year (and Cache Components forbids it).
 * The build year is rendered on the server and swapped for the live year on hydration.
 */
const BUILD_YEAR = 2026;
const subscribe = () => () => {};

export function CopyrightYear() {
  const year = useSyncExternalStore(
    subscribe,
    () => new Date().getFullYear(),
    () => BUILD_YEAR,
  );
  return <>{year}</>;
}
