"use client";

import { useEffect } from "react";

/**
 * Studio pages read their data on the server, so a renewed login cookie from those requests never
 * reaches the browser. One request from the browser on each page lets the API renew it here,
 * which keeps an active user logged in.
 */
export function KeepSession() {
  useEffect(() => {
    fetch("/api/studio/auth/me", { cache: "no-store" }).catch(() => {});
  }, []);
  return null;
}
