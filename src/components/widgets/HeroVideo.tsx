"use client";

import { useEffect, useRef } from "react";

// TODO: replace with an authentic OLIVED harvest/mill video once available.
// Current source is a stock Pexels clip kept temporarily (owner decision) — the 2K rendition
// (3.9 MB) instead of the 4K one (17 MB) the static site loaded.
const VIDEO_SRC = "https://videos.pexels.com/video-files/6609491/6609491-hd_2048_1080_30fps.mp4";

/**
 * Loads the hero video only after the page has loaded, on wide screens, and when the
 * visitor hasn't asked for reduced motion or data saving. Otherwise the poster stays.
 */
export function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (window.innerWidth < 768 || reduced || saveData) return;

    const start = () => {
      video.src = VIDEO_SRC;
      video.play().catch(() => {});
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => window.removeEventListener("load", start);
  }, []);

  return <video ref={ref} id="hero-video" muted loop playsInline preload="none" poster="/hero-poster.webp" />;
}
