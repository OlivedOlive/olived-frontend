"use client";

import Lenis from "lenis";
import { useEffect } from "react";

/**
 * The scrolling feel shared by every website page:
 * - smooth inertia scrolling (Lenis), including for in-page links such as #export-enquiry
 * - the header slides away on scroll down and returns on scroll up
 * Skipped when the visitor asks for reduced motion. Mounted once in the root layout.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({ autoRaf: true, anchors: true });
    const header = document.getElementById("site-header");
    header?.classList.add("nav-autohide");

    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      // Ignore tiny movements so the header does not flicker.
      if (Math.abs(y - lastY) < 5) return;
      header?.classList.toggle("nav-hidden", y > lastY && y > 240);
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      lenis.destroy();
      window.removeEventListener("scroll", onScroll);
      header?.classList.remove("nav-autohide", "nav-hidden");
    };
  }, []);

  return null;
}
