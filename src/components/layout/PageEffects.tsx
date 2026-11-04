"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function formatCount(value: number, isFloat: boolean) {
  return isFloat ? value.toFixed(1) : Math.round(value).toLocaleString("en-US");
}

function animateCounter(el: HTMLElement) {
  const target = Number.parseFloat(el.dataset.target ?? "");
  if (Number.isNaN(target)) return;
  const suffix = el.dataset.suffix ?? "";
  const prefix = el.dataset.prefix ?? "";
  // Years read better without a thousands separator.
  const plain = el.dataset.plain === "true";
  const isFloat = !Number.isInteger(target);
  const render = (v: number) =>
    (el.textContent = prefix + (plain ? String(Math.round(v)) : formatCount(v, isFloat)) + suffix);

  if (prefersReducedMotion()) {
    render(target);
    return;
  }
  const duration = 1800;
  const start = performance.now();
  const step = (now: number) => {
    const progress = Math.min((now - start) / duration, 1);
    render(target * (1 - Math.pow(1 - progress, 3)));
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/**
 * React tags each DOM node it has hydrated with an internal `__reactFiber$…` key.
 * Next.js hydrates the page segment separately from the root layout, so this effect
 * can run while page content is still raw server HTML. Changing its className then
 * would cause a hydration mismatch, so we wait until React has claimed the nodes.
 */
const isHydrated = (el: Element) => Object.keys(el).some((k) => k.startsWith("__reactFiber$"));
const HYDRATION_WAIT_MS = 3000;

/**
 * Site-wide scroll effects, ported from olived.js:
 * - `.reveal` / `.fade-in` elements get `.is-visible` when they scroll into view
 * - `.count-up[data-target]` numbers animate once visible
 * Re-runs on every client-side navigation.
 */
export function PageEffects() {
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    let frame = 0;
    let cleanup: (() => void) | undefined;
    const startedAt = performance.now();

    const waitForHydration = () => {
      if (cancelled) return;
      const pending = document.querySelectorAll(".reveal:not(.is-visible), .fade-in:not(.is-visible), .count-up");
      const ready = Array.from(pending).every(isHydrated);
      if (ready || performance.now() - startedAt > HYDRATION_WAIT_MS) {
        cleanup = start();
      } else {
        frame = requestAnimationFrame(waitForHydration);
      }
    };
    waitForHydration();

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      cleanup?.();
    };
  }, [pathname]);

  return null;
}

/** Starts the reveal and counter observers; returns their cleanup. */
function start(): (() => void) | undefined {
  const revealEls = document.querySelectorAll<HTMLElement>(".reveal:not(.is-visible), .fade-in:not(.is-visible)");
  const counters = document.querySelectorAll<HTMLElement>(".count-up");

  if (!("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
  );
  revealEls.forEach((el) => revealObserver.observe(el));

  const counterObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          animateCounter(entry.target as HTMLElement);
          counterObserver.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.5 },
  );
  counters.forEach((el) => counterObserver.observe(el));

  return () => {
    revealObserver.disconnect();
    counterObserver.disconnect();
  };
}
