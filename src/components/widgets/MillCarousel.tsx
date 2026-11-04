"use client";

import Image, { type StaticImageData } from "next/image";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "@/components/icons";

export function MillCarousel({
  slides,
  t,
}: {
  slides: { src: StaticImageData; alt: string }[];
  t: { label: string; previous: string; next: string; slideOf: string };
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollByOne = (dir: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    // In right-to-left pages the track scrolls the other way.
    const rtl = getComputedStyle(track).direction === "rtl" ? -1 : 1;
    track.scrollBy({ left: dir * rtl * track.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="mill-carousel mt-5" aria-roledescription="carousel" aria-label={t.label}>
      <div className="mill-carousel-track" ref={trackRef}>
        {slides.map((slide, i) => (
          <div className="mill-carousel-slide" key={i} aria-roledescription="slide" aria-label={t.slideOf.replace("{n}", String(i + 1)).replace("{total}", String(slides.length))}
          >
            <Image src={slide.src} alt={slide.alt} sizes="100vw" />
          </div>
        ))}
      </div>
      <button type="button" className="mill-carousel-arrow prev" aria-label={t.previous} onClick={() => scrollByOne(-1)}>
        <ChevronLeft />
      </button>
      <button type="button" className="mill-carousel-arrow next" aria-label={t.next} onClick={() => scrollByOne(1)}>
        <ChevronRight />
      </button>
    </div>
  );
}
