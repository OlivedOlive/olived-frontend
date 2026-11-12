"use client";

import Image, { type StaticImageData } from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";

type Step = { name: string; title: string; text: string };

/**
 * The pinned process section: the screen stays put while scrolling moves through the steps.
 * The active step is large, sharp and white; the others are blurred and dim. Each step also
 * brings its own large photo, which zooms into place.
 */
export function Process({
  steps,
  thumbs,
  background,
  tag,
}: {
  steps: Step[];
  thumbs: StaticImageData[];
  background: ReactNode;
  tag: ReactNode;
}) {
  const section = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    let ticking = false;
    const update = () => {
      ticking = false;
      const travel = el.offsetHeight - window.innerHeight;
      const progress = Math.min(0.999, Math.max(0, -el.getBoundingClientRect().top / travel));
      setActive(Math.floor(progress * steps.length));
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
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [steps.length]);

  /** Scrolls to the part of the section that belongs to a step. */
  const goTo = (i: number) => {
    const el = section.current;
    if (!el) return;
    const travel = el.offsetHeight - window.innerHeight;
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + (travel * (i + 0.5)) / steps.length, behavior: "smooth" });
  };

  return (
    // 30vh of scrolling per step: quick to move through, still long enough to read each one.
    <section className="ld-process" ref={section} style={{ height: `${steps.length * 30 + 100}vh` }}>
      <div className="ld-process-stage">
        <div className="ld-process-bg">
          {background}
          {steps.map((step, i) => (
            <div className="ld-process-photo" key={step.name} data-active={i === active ? "" : undefined}>
              <Image src={thumbs[i]} alt="" sizes="(max-width: 900px) 100vw, 60vw" />
            </div>
          ))}
        </div>
        <div className="ld-process-panel">
          {tag}
          <ol className="ld-steps">
            {steps.map((step, i) => (
              <li key={step.name} data-active={i === active ? "" : undefined}>
                <button type="button" onClick={() => goTo(i)} aria-current={i === active ? "step" : undefined}>
                  {step.name}
                </button>
              </li>
            ))}
          </ol>

          <div className="ld-step-details">
            {steps.map((step, i) => (
              <div className="ld-step-detail" key={step.name} data-active={i === active ? "" : undefined} aria-hidden={i !== active}>
                <Image src={thumbs[i]} alt="" sizes="132px" />
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="ld-progress" aria-hidden="true">
            {steps.map((step, i) => (
              <i key={step.name} data-done={i <= active ? "" : undefined} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
