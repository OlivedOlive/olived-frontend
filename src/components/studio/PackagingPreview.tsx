"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Component, type ReactNode, useEffect, useRef, useState } from "react";
import sun from "@/assets/images/orzeta-sun.webp";
import grove from "@/assets/images/orzeta-grove.webp";
import organic from "@/assets/images/orzeta-organic.webp";
import oussoul from "@/assets/images/studio/oussoul.webp";
import { drawLabel, FACES, getArtworkLogo, getLabelReference, getPackaging, loadArtworkLogo, LABEL_SIZE, WRAP_PANEL_WIDTH } from "@/lib/studio/label-artwork";
import type { DesignContent, PackagePart, PanelFace } from "@/lib/studio/types";

const BottleScene = dynamic(() => import("./BottleScene").then((module) => module.BottleScene), {
  ssr: false,
  loading: () => <p className="p-6 text-sm text-mid">Loading 3D viewer…</p>,
});

class ModelPreviewBoundary extends Component<{ children: ReactNode; onShowArtwork: () => void }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="grid justify-items-start gap-3 p-6" role="alert">
        <p>The 3D viewer could not load. You can still edit your design in flat view.</p>
        <button type="button" className="btn" onClick={this.props.onShowArtwork}>Show flat artwork</button>
      </div>
    );
  }
}

export const PARTS: { id: PackagePart; name: string }[] = [
  { id: "unit", name: "Bottle / tin" },
  { id: "retail", name: "Retail box" },
  { id: "case", name: "Shipping case" },
];
const PHOTOS = { sun, grove, organic, oussoul };
const WRAP: PanelFace[] = ["back", "front", "right"];
type PreviewView = "flat" | "3d" | "reference" | "photo";
type ProductTemplate = Parameters<typeof getPackaging>[0];
type ArtworkCanvases = Partial<Record<PanelFace, HTMLCanvasElement>>;

function FlatArtwork({ sources, faces }: { sources: ArtworkCanvases; faces: PanelFace[] }) {
  const target = useRef<HTMLCanvasElement>(null);
  const width = faces.length > 1 ? WRAP_PANEL_WIDTH * faces.length : sources[faces[0]]?.width ?? LABEL_SIZE;
  useEffect(() => {
    const context = target.current?.getContext("2d");
    context?.clearRect(0, 0, width, LABEL_SIZE);
    faces.forEach((face, index) => {
      const panel = sources[face];
      if (panel) context?.drawImage(panel, panel.width * index, 0);
    });
  }, [faces, sources, width]);
  return <canvas className="studio-label-canvas" ref={target} width={width} height={LABEL_SIZE}
    role="img" aria-label={faces.length > 1 ? "Editable wrap label with product information, front artwork and nutrition" : `Editable ${faces[0]} label`} />;
}

export function PackagingPreview({
  content, template, part, face, onFace, marketCode, initialView = "flat",
}: {
  content: DesignContent;
  template: ProductTemplate;
  part: PackagePart;
  face: PanelFace;
  onFace: (face: PanelFace) => void;
  marketCode?: string;
  initialView?: PreviewView;
}) {
  const [view, setView] = useState<PreviewView>(initialView);
  const [yaw, setYaw] = useState(-13);
  const [pitch, setPitch] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [showOriginal, setShowOriginal] = useState(initialView === "3d");
  const [artwork, setArtwork] = useState<ArtworkCanvases>({});
  const { slug, format, volume, line } = getPackaging(template);
  const logo = getArtworkLogo(content, line, slug);
  const ref = part === "unit" ? getLabelReference(line, marketCode) : null;
  const photoKey = line || slug;
  const photo = part === "unit" && Object.hasOwn(PHOTOS, photoKey) ? PHOTOS[photoKey as keyof typeof PHOTOS] : null;
  const activeView = (view === "reference" && !ref) || (view === "photo" && !photo) ? "flat" : view;
  const matchingReference = ref?.exact && format.startsWith("Marasca") && volume === 750;
  const hasDetailedModel = part === "unit" && ["sun", "grove", "organic"].includes(line) &&
    format.startsWith("Marasca") && [250, 500, 750, 1000].includes(volume);
  const hasOriginalArtwork = hasDetailedModel && line === "sun" && volume === 1000;

  useEffect(() => {
    let current = true;
    void loadArtworkLogo(logo).then((image) => {
      if (current) setArtwork(Object.fromEntries(FACES.map((side) => [side, drawLabel(content, part, side, image, line)])));
    });
    return () => { current = false; };
  }, [content, part, line, logo]);

  return (
    <section className="studio-preview card grid gap-4">
      <div>
        <h2 className="text-3xl">{part === "unit" ? `${format} · ${volume} mL` : PARTS.find((item) => item.id === part)?.name}</h2>
        <div className="studio-segment mt-2 flex-wrap" aria-label="Preview mode">
          <button type="button" aria-pressed={activeView === "flat"} onClick={() => setView("flat")}>Flat artwork</button>
          <button type="button" aria-pressed={activeView === "3d"} onClick={() => setView("3d")}>3D preview</button>
          {ref && <button type="button" aria-pressed={activeView === "reference"} onClick={() => setView("reference")}>Source label</button>}
          {photo && <button type="button" aria-pressed={activeView === "photo"} onClick={() => setView("photo")}>Product photo</button>}
        </div>
      </div>
      <div className="studio-stage studio-label-stage">
        {activeView === "flat" && (
          <FlatArtwork sources={artwork} faces={part === "unit" && WRAP.includes(face) ? WRAP : [face]} />
        )}
        {activeView === "3d" && (
          <ModelPreviewBoundary key={hasDetailedModel ? "marasca" : "procedural"} onShowArtwork={() => setView("flat")}>
          <BottleScene format={format} volume={volume} part={part} artwork={artwork}
            offset={content.artwork?.labelFit?.offset ?? 7} labelHeight={content.artwork?.labelFit?.height ?? 84}
            yaw={yaw} pitch={pitch} zoom={zoom} referenceModel={hasDetailedModel} useOriginalArtwork={hasOriginalArtwork && showOriginal}
            onRotate={(horizontal, vertical) => { setYaw(horizontal); setPitch(vertical); }} />
          </ModelPreviewBoundary>
        )}
        {activeView === "reference" && ref && (
          <Image src={ref.src} alt="Original ORZETA label artwork" width={520} height={523} className="h-auto max-h-[460px] w-auto max-w-full object-contain" unoptimized />
        )}
        {activeView === "photo" && photo && (
          <Image src={photo} alt="Photograph of the original brand packaging" className="h-auto max-h-[440px] w-auto max-w-full object-contain" />
        )}
      </div>
      {activeView === "flat" && (
        <div className="studio-segment flex-wrap" aria-label="Packaging face">
          {(part === "unit" ? ["back", "front", "right", "left", "top", "bottom"] as PanelFace[] : FACES).map((side) => (
            <button key={side} type="button" className="capitalize" aria-pressed={face === side} onClick={() => onFace(side)}>
              {part === "unit" && side === "right" ? "Nutrition" : part === "unit" && side === "back" ? "Product information" : side}
            </button>
          ))}
        </div>
      )}
      {activeView === "3d" && (
        <div className="grid gap-3 sm:grid-cols-2">
          {hasOriginalArtwork && (
            <div className="studio-segment flex-wrap sm:col-span-2" aria-label="3D model source">
              <button type="button" aria-pressed={showOriginal} onClick={() => setShowOriginal(true)}>Original 1 L bottle</button>
              <button type="button" aria-pressed={!showOriginal} onClick={() => setShowOriginal(false)}>Live artwork</button>
            </div>
          )}
          <label className="field">Horizontal rotation <input type="range" min="-180" max="180" value={yaw} onChange={(e) => setYaw(Number(e.target.value))} /></label>
          <label className="field">Vertical rotation <input type="range" min="-90" max="90" value={pitch} onChange={(e) => setPitch(Number(e.target.value))} /></label>
          {hasDetailedModel && (
            <div className="studio-segment flex-wrap sm:col-span-2" aria-label="Camera positions">
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                <button key={angle} type="button" onClick={() => { setYaw(angle <= 180 ? -angle : 360 - angle); setPitch(0); }}>{angle}°</button>
              ))}
              <button type="button" onClick={() => { setYaw(0); setPitch(90); }}>Top</button>
              <button type="button" onClick={() => { setYaw(0); setPitch(-90); }}>Bottom</button>
            </div>
          )}
          <div className="flex flex-wrap items-end gap-2 sm:col-span-2">
            <label className="field min-w-32 flex-1">Zoom · {zoom}%
              <input type="range" min="65" max="220" step="5" value={zoom} onChange={(e) => setZoom(Number(e.target.value))} />
            </label>
            <div className="studio-segment">
              <button type="button" aria-label="Zoom out" disabled={zoom <= 65} onClick={() => setZoom((value) => Math.max(65, value - 15))}>−</button>
              <button type="button" aria-label="Zoom in" disabled={zoom >= 220} onClick={() => setZoom((value) => Math.min(220, value + 15))}>+</button>
              <button type="button" onClick={() => { setYaw(-13); setPitch(1); setZoom(100); }}>Reset view</button>
            </div>
          </div>
        </div>
      )}
      <p className="text-xs text-mid">
        {activeView === "reference" && ref
          ? matchingReference
            ? "Supplied Marasca 750 mL reference for the selected market. Review placeholders before use."
            : `Brand reference${ref.market ? " · " + ref.market : ""}. A matching production label for this market and format requires approval.`
          : activeView === "photo"
            ? "Original brand photography. The format and volume pictured may differ from the selected packaging."
            : "Concept proof. Supplier drawings and a printed sample are needed to confirm dimensions and fit."}
        {part === "case" && template.zones?.caseCount ? ` Catalog pack count: ${template.zones.caseCount}.` : ""}
      </p>
    </section>
  );
}

export function ReviewPreview({ content, template, marketCode }: { content: DesignContent; template: ProductTemplate; marketCode?: string }) {
  const [part, setPart] = useState<PackagePart>("unit");
  const [face, setFace] = useState<PanelFace>("front");

  return (
    <div className="grid content-start gap-3">
      <div className="studio-segment flex-wrap" aria-label="Packaging component">
        {PARTS.map((item) => (
          <button key={item.id} type="button" aria-pressed={part === item.id} onClick={() => { setPart(item.id); setFace("front"); }}>
            {item.name}
          </button>
        ))}
      </div>
      <PackagingPreview content={content} template={template} part={part} face={face} onFace={setFace} marketCode={marketCode} />
    </div>
  );
}
