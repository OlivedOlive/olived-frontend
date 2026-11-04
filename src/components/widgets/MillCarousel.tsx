"use client";

import Image, { type StaticImageData } from "next/image";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "@/components/icons";

export function MillCarousel({ slides }: { slides: { src: StaticImageData; alt: string }[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollByOne = (dir: 1 | -1) => {
    const track = trackRef.current;
    if (track) track.scrollBy({ left: dir * track.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="mill-carousel mt-5" aria-roledescription="carousel" aria-label="Partner mills">
      <div className="mill-carousel-track" ref={trackRef}>
        {slides.map((slide, i) => (
          <div className="mill-carousel-slide" key={i} aria-roledescription="slide" aria-label={`${i + 1} of ${slides.length}`}>
            <Image src={slide.src} alt={slide.alt} sizes="100vw" />
          </div>
        ))}
      </div>
      <button type="button" className="mill-carousel-arrow prev" aria-label="Previous image" onClick={() => scrollByOne(-1)}>
        <ChevronLeft />
      </button>
      <button type="button" className="mill-carousel-arrow next" aria-label="Next image" onClick={() => scrollByOne(1)}>
        <ChevronRight />
      </button>
    </div>
  );
}
