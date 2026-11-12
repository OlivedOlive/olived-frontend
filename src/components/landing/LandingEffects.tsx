"use client";

import { useEffect } from "react";

const clamp = (v: number) => Math.min(1, Math.max(0, v));

/**
 * Scroll behaviour of the home page landing design. It only reads and writes attributes and
 * inline styles on the page, so the sections themselves stay plain server-rendered markup:
 *
 * - `[data-rv]`: blur + fade in when scrolled into view, 80 ms apart within a `[data-rv-group]`
 * - `.ld-lines`: heading lines slide up from a mask
 * - `[data-scrolltext]`: words turn from light to dark as the paragraph crosses the screen
 * - `[data-parallax]`: large images drift slower than the page
 *
 * Smooth scrolling and the auto-hiding header are site-wide: see layout/SmoothScroll.tsx.
 */
export function LandingEffects() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.querySelector<HTMLElement>(".ld");
    if (!root) return;

    const reveals = Array.from(root.querySelectorAll<HTMLElement>("[data-rv], .ld-lines"));
    const show = (el: HTMLElement) => el.setAttribute("data-in", "");

    if (reduced || !("IntersectionObserver" in window)) {
      reveals.forEach(show);
      root.querySelectorAll<HTMLElement>("[data-scrolltext] span").forEach((w) => (w.style.opacity = "1"));
      return;
    }

    // Stagger: each item waits 80 ms more than the one before it in its group.
    root.querySelectorAll<HTMLElement>("[data-rv-group]").forEach((group) => {
      group.querySelectorAll<HTMLElement>("[data-rv]").forEach((el, i) => {
        el.style.transitionDelay = `${i * 80}ms`;
      });
    });

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          show(entry.target as HTMLElement);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -6% 0px" },
    );
    reveals.forEach((el) => observer.observe(el));

    const scrollTexts = Array.from(root.querySelectorAll<HTMLElement>("[data-scrolltext]")).map((el) => ({
      el,
      words: Array.from(el.querySelectorAll<HTMLElement>("span")),
    }));
    const parallax = Array.from(root.querySelectorAll<HTMLElement>("[data-parallax]"));

    let ticking = false;
    const update = () => {
      ticking = false;
      const vh = window.innerHeight;

      for (const { el, words } of scrollTexts) {
        const rect = el.getBoundingClientRect();
        const progress = clamp((vh * 0.85 - rect.top) / (rect.height + vh * 0.35));
        words.forEach((w, i) => {
          w.style.opacity = String(0.22 + 0.78 * clamp(progress * words.length - i));
        });
      }

      for (const img of parallax) {
        // An image can leave the page after this list was built (a hot reload, a re-render).
        const frame = img.parentElement;
        if (!frame) continue;
        const rect = frame.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > vh) continue;
        const offset = (rect.top + rect.height / 2 - vh / 2) / vh;
        img.style.transform = `translate3d(0, ${offset * -7}%, 0) scale(1.16)`;
      }
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return null;
}
