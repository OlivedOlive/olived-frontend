"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Component, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import sun from "@/assets/images/orzeta-sun.webp";
import grove from "@/assets/images/orzeta-grove.webp";
import organic from "@/assets/images/orzeta-organic.webp";
import oussoul from "@/assets/images/studio/oussoul.webp";
import { glassModelFor } from "@/lib/studio/bottle-models";
import { labelSize, layoutOf, prepare, renderLabel, renderWrapFaces } from "@/lib/studio/layout";
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
/** Named camera positions: the model's turn that brings each side to the camera. */
const VIEWS: [string, number][] = [["Front", 0], ["Left side", 90], ["Right side", -90], ["Back", 180], ["Three-quarter", -35]];
type ProductTemplate = Parameters<typeof getPackaging>[0];
type ArtworkCanvases = Partial<Record<PanelFace, HTMLCanvasElement>>;

const FLAT_ZOOMS = [1, 1.25, 1.5, 2, 2.5, 3];
/** The next zoom step up or down. */
function step(zoom: number, direction: 1 | -1) {
  const index = FLAT_ZOOMS.findIndex((v) => v >= zoom - .01);
  return FLAT_ZOOMS[Math.max(0, Math.min(FLAT_ZOOMS.length - 1, (index < 0 ? FLAT_ZOOMS.length - 1 : index) + direction))]!;
}

/** The largest canvas side the flat view draws on screen, to keep memory in check. */
const MAX_SCREEN_PX = 4096;
/** Downloads: long side in pixels, or a print resolution. */
const EXPORTS = [
  { id: "2k", label: "PNG · 2K", note: "2048 px", longSide: 2048 },
  { id: "4k", label: "PNG · 4K", note: "3840 px", longSide: 3840 },
  { id: "print", label: "Print · 300 dpi", note: "", dpi: 300 },
] as const;

/**
 * The flat label with its own zoom: bigger buttons, 100% to fit, full screen and downloads. With `render`
 * (the unit label, drawn from its layout), the label is redrawn sharp at the size it is shown and exported
 * at 2K, 4K or 300 dpi. Without it, the preview images are shown as they are.
 */
function FlatArtwork({ sources, faces, render, labelMm }: {
  sources: ArtworkCanvases;
  faces: PanelFace[];
  render?: (pxPerMm: number) => Promise<HTMLCanvasElement>;
  labelMm?: { width: number; height: number };
}) {
  const target = useRef<HTMLCanvasElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [exportMenu, setExportMenu] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const [shownPx, setShownPx] = useState(0);
  const sharp = Boolean(render && labelMm);
  const width = sharp ? Math.round(LABEL_SIZE * labelMm!.width / labelMm!.height)
    : faces.length > 1 ? WRAP_PANEL_WIDTH * faces.length : sources[faces[0]]?.width ?? LABEL_SIZE;

  // Preview images (boxes, cases, older designs).
  useEffect(() => {
    if (sharp) return;
    const canvas = target.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    canvas.width = width;
    canvas.height = LABEL_SIZE;
    context.clearRect(0, 0, width, LABEL_SIZE);
    faces.forEach((face, index) => {
      const panel = sources[face];
      if (panel) context.drawImage(panel, panel.width * index, 0);
    });
  }, [faces, sources, width, sharp]);

  // The unit label, redrawn for the pixels it covers on this screen at this zoom.
  useEffect(() => {
    const canvas = target.current;
    if (!render || !labelMm || !canvas) return;
    let current = true;
    const draw = () => {
      const shown = canvas.getBoundingClientRect().width || 416;
      const ratio = window.devicePixelRatio || 1;
      const pxPerMm = Math.min((shown * ratio) / labelMm.width, MAX_SCREEN_PX / Math.max(labelMm.width, labelMm.height));
      void render(pxPerMm).then((drawn) => {
        if (!current) return;
        canvas.width = drawn.width;
        canvas.height = drawn.height;
        canvas.getContext("2d")?.drawImage(drawn, 0, 0);
        setShownPx(drawn.width);
      });
    };
    // One redraw after typing, zooming or resizing settles.
    let timer = setTimeout(draw, 150);
    const observer = new ResizeObserver(() => { clearTimeout(timer); timer = setTimeout(draw, 150); });
    observer.observe(canvas);
    return () => { current = false; clearTimeout(timer); observer.disconnect(); };
  }, [render, labelMm, zoom, fullscreen]);

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === frame.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);
  // Ctrl + wheel zooms, like in other design tools; the plain wheel keeps scrolling.
  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey) return;
      event.preventDefault();
      setZoom((z) => step(z, event.deltaY < 0 ? 1 : -1));
    };
    element.addEventListener("wheel", onWheel, { passive: false });
    return () => element.removeEventListener("wheel", onWheel);
  }, []);

  function save(canvas: HTMLCanvasElement, name: string) {
    canvas.toBlob((blob) => {
      if (!blob) return;
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = name;
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 2000);
    }, "image/png");
  }

  async function download(id: (typeof EXPORTS)[number]["id"]) {
    setExportMenu(false);
    if (!render || !labelMm) {
      if (target.current) save(target.current, "label-artwork.png");
      return;
    }
    const choice = EXPORTS.find((e) => e.id === id)!;
    const pxPerMm = "dpi" in choice ? choice.dpi / 25.4 : choice.longSide / Math.max(labelMm.width, labelMm.height);
    setExporting(choice.label);
    try {
      const canvas = await render(pxPerMm);
      save(canvas, `label-artwork-${id}-${canvas.width}x${canvas.height}.png`);
    } finally {
      setExporting(null);
    }
  }

  const printSize = labelMm && { w: Math.round(labelMm.width * 300 / 25.4), h: Math.round(labelMm.height * 300 / 25.4) };

  return (
    <div ref={frame} className="studio-flat" data-zoomed={zoom > 1} data-fullscreen={fullscreen}>
      <div className="studio-flat-scroll">
        <canvas className="studio-label-canvas" ref={target} width={width} height={LABEL_SIZE}
          style={{
            width: fullscreen ? `min(${zoom * 92}vw, ${zoom * 88}vh * ${width / LABEL_SIZE})` : `calc(min(100%, 26rem) * ${zoom})`,
            maxWidth: "none", aspectRatio: `${width} / ${LABEL_SIZE}`, height: "auto",
          }}
          role="img" aria-label={faces.length > 1 ? "Editable wrap label with product information, front artwork and nutrition" : `Editable ${faces[0]} label`} />
      </div>
      {exporting && <p className="studio-flat-busy" role="status">Preparing {exporting}…</p>}
      <div className="studio-3d-tools" role="toolbar" aria-label="Label size">
        <button type="button" onClick={() => setZoom((z) => step(z, -1))} disabled={zoom <= FLAT_ZOOMS[0]!} aria-label="Smaller" title="Smaller">−</button>
        <button type="button" className="studio-3d-zoom" onClick={() => setZoom(1)} title={sharp && shownPx ? `Back to 100% · drawn at ${shownPx} px wide` : "Back to 100%"}>{Math.round(zoom * 100)}%</button>
        <button type="button" onClick={() => setZoom((z) => step(z, 1))} disabled={zoom >= FLAT_ZOOMS.at(-1)!} aria-label="Bigger" title="Bigger (Ctrl + wheel)">+</button>
        <span className="studio-3d-sep" />
        <button type="button" onClick={() => (fullscreen ? document.exitFullscreen() : frame.current?.requestFullscreen())?.catch(() => {})}
          title={fullscreen ? "Exit full screen" : "Full screen"} aria-label={fullscreen ? "Exit full screen" : "Full screen"}>{fullscreen ? "⤡" : "⤢"}</button>
        <button type="button" onClick={() => (sharp ? setExportMenu((v) => !v) : void download("2k"))} aria-expanded={sharp ? exportMenu : undefined}
          title="Save the label as a PNG" aria-label="Save image" disabled={Boolean(exporting)}>⤓</button>
      </div>
      {exportMenu && (
        <div className="studio-export" role="menu" aria-label="Download size">
          {EXPORTS.map((choice) => (
            <button key={choice.id} type="button" role="menuitem" onClick={() => void download(choice.id)}>
              <span>{choice.label}</span>
              <span className="text-xs text-mid">{choice.id === "print" && printSize ? `${printSize.w} × ${printSize.h} px` : choice.note}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function PackagingPreview({
  content, template, part, face, onFace, marketCode, initialView = "flat", initialYaw = -13, title,
}: {
  /** The angle the 3D view starts at: 0 faces the front, 90 the left side, -90 the right side. */
  initialYaw?: number;
  title?: string;
  content: DesignContent;
  template: ProductTemplate;
  part: PackagePart;
  face: PanelFace;
  onFace: (face: PanelFace) => void;
  marketCode?: string;
  initialView?: PreviewView;
}) {
  const [view, setView] = useState<PreviewView>(initialView);
  const [yaw, setYaw] = useState(initialYaw);
  const [pitch, setPitch] = useState(0);
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
  // Marasca and Dorica glass are shown on the supplier-size models. The photo-based Sun bottle is
  // kept only to show the printed ORZETA Sun label on the 1 L Marasca.
  const glass = part === "unit" ? glassModelFor(format) : null;
  const hasOriginalArtwork = part === "unit" && line === "sun" && format.startsWith("Marasca") && volume === 1000;
  const showReference = hasOriginalArtwork && showOriginal;
  const modelKey = showReference ? "reference" : glass ? glass.url : "procedural";

  // The unit label's wrap is drawn from its element layout, exactly as in the editor. Designs that still
  // carry text panels from before the editor keep them until they are arranged in the editor.
  const legacyPanels = !content.artwork?.layout?.unit && Object.keys(content.artwork?.panels?.unit ?? {}).length > 0;
  const size = useMemo(() => labelSize(template), [template]);
  // The unit label drawn from its layout at any resolution, for the sharp flat view and the downloads.
  const renderSharp = useCallback(async (pxPerMm: number) => {
    const layout = layoutOf(content, template, line);
    return renderLabel(document.createElement("canvas"), content, layout, size, pxPerMm, await prepare(layout));
  }, [content, template, line, size]);
  useEffect(() => {
    let current = true;
    const timer = setTimeout(() => {
      void loadArtworkLogo(logo).then(async (image) => {
        const faces: ArtworkCanvases = Object.fromEntries(FACES.map((side) => [side, drawLabel(content, part, side, image, line)]));
        if (part === "unit" && !legacyPanels) Object.assign(faces, await renderWrapFaces(content, layoutOf(content, template, line), labelSize(template)));
        if (current) setArtwork(faces);
      });
    }, 120);
    return () => { current = false; clearTimeout(timer); };
  }, [content, part, line, logo, template, legacyPanels]);

  return (
    <section className="studio-preview card grid gap-4">
      <div>
        <h2 className="text-3xl">{title ?? (part === "unit" ? `${format} · ${volume} mL` : PARTS.find((item) => item.id === part)?.name)}</h2>
        <div className="studio-segment mt-2 flex-wrap" aria-label="Preview mode">
          <button type="button" aria-pressed={activeView === "flat"} onClick={() => setView("flat")}>Flat artwork</button>
          <button type="button" aria-pressed={activeView === "3d"} onClick={() => setView("3d")}>3D preview</button>
          {ref && <button type="button" aria-pressed={activeView === "reference"} onClick={() => setView("reference")}>Source label</button>}
          {photo && <button type="button" aria-pressed={activeView === "photo"} onClick={() => setView("photo")}>Product photo</button>}
        </div>
      </div>
      <div className="studio-stage studio-label-stage">
        {activeView === "flat" && (
          <FlatArtwork sources={artwork} faces={part === "unit" ? WRAP : [face]}
            render={part === "unit" && !legacyPanels ? renderSharp : undefined} labelMm={part === "unit" && !legacyPanels ? size : undefined} />
        )}
        {activeView === "3d" && (
          <ModelPreviewBoundary key={modelKey} onShowArtwork={() => setView("flat")}>
          <BottleScene format={format} volume={volume} part={part} artwork={artwork}
            offset={content.artwork?.labelFit?.offset ?? 7} labelHeight={content.artwork?.labelFit?.height ?? 84}
            yaw={yaw} pitch={pitch} zoom={zoom} referenceModel={showReference} useOriginalArtwork={showReference}
            onRotate={(horizontal, vertical) => { setYaw(horizontal); setPitch(vertical); }}
            onZoom={setZoom} onReset={() => { setYaw(initialYaw); setPitch(0); setZoom(100); }} />
          </ModelPreviewBoundary>
        )}
        {activeView === "reference" && ref && (
          <Image src={ref.src} alt="Original ORZETA label artwork" width={520} height={523} className="h-auto max-h-[460px] w-auto max-w-full object-contain" unoptimized />
        )}
        {activeView === "photo" && photo && (
          <Image src={photo} alt="Photograph of the original brand packaging" className="h-auto max-h-[440px] w-auto max-w-full object-contain" />
        )}
      </div>
      {activeView === "flat" && part !== "unit" && (
        <div className="studio-segment flex-wrap" aria-label="Packaging face">
          {FACES.map((side) => (
            <button key={side} type="button" className="capitalize" aria-pressed={face === side} onClick={() => onFace(side)}>
              {side}
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
          <div className="studio-segment flex-wrap sm:col-span-2" aria-label="Camera positions">
              {VIEWS.map(([name, angle]) => (
                <button key={name} type="button" aria-pressed={yaw === angle && Math.abs(pitch) <= 1} onClick={() => { setYaw(angle); setPitch(0); }}>{name}</button>
              ))}
              <button type="button" onClick={() => { setYaw(0); setPitch(90); }}>Top</button>
              <button type="button" onClick={() => { setYaw(0); setPitch(-90); }}>Bottom</button>
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
            : activeView === "3d" && glass && !showReference
              ? volume === glass.volume
                ? `Supplier-size ${glass.name} ${volume} mL model. A printed sample confirms the label fit.`
                : `Shown on the ${glass.name} ${glass.volume} mL model, scaled to ${volume} mL. Supplier drawings for this size confirm its exact shape.`
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
