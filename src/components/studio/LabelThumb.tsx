"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getPackaging } from "@/lib/studio/label-artwork";
import { labelSize, layoutOf, prepare, renderLabel } from "@/lib/studio/layout";
import type { DesignContent, Template } from "@/lib/studio/types";

type ThumbTemplate = Template & { variant?: { volumeMl: number; product: { slug: string } } };

/**
 * A small picture of the flat unit label (left side, front, right side), drawn from the design itself, so
 * it always matches the editor. It is drawn when it scrolls into view, at the pixels it covers on screen.
 */
export function LabelThumb({ content, template }: { content: DesignContent; template: ThumbTemplate }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const size = useMemo(() => labelSize(template), [template]);

  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: "200px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const element = canvas.current;
    if (!visible || !element) return;
    let current = true;
    const { line } = getPackaging(template);
    const layout = layoutOf(content, template, line);
    void prepare(layout).then((loaded) => {
      if (!current) return;
      const shown = element.getBoundingClientRect().width || 320;
      const pxPerMm = Math.min(12, (shown * (window.devicePixelRatio || 1)) / size.width);
      const drawn = renderLabel(document.createElement("canvas"), content, layout, size, pxPerMm, loaded);
      element.width = drawn.width;
      element.height = drawn.height;
      element.getContext("2d")?.drawImage(drawn, 0, 0);
      setReady(true);
    });
    return () => { current = false; };
  }, [visible, content, template, size]);

  return (
    <canvas ref={canvas} className="studio-thumb" data-ready={ready} width={size.width * 2} height={size.height * 2}
      style={{ aspectRatio: `${size.width} / ${size.height}` }} role="img" aria-label="Flat label: left side, front and right side" />
  );
}
