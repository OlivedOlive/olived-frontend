import { fontFamily, loadFonts } from "./fonts";
import { getArtworkLogo, LABEL_SIZE, TEMPLATE_TEXT_SIZE } from "./label-artwork";
import type { DesignContent, PanelFace, Template } from "./types";

/**
 * The unit label as a set of elements positioned in millimetres, the way a designer works. The editor,
 * the flat preview and the 3D bottle all draw it with renderLabel, so what is edited is what is shown.
 * The element format matches the backend's (designs/validate.ts), which also uses it for the checks.
 */
export type LabelElement = {
  id: string;
  type: "text" | "field" | "image" | "shape";
  name?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rotation?: number;
  locked?: boolean;
  hidden?: boolean;
  opacity?: number;
  text?: string;
  /** A field element prints the design's field of this key. */
  field?: string;
  font?: string;
  /** Point size. */
  size?: number;
  weight?: 400 | 500 | 600 | 700;
  italic?: boolean;
  color?: string;
  align?: "left" | "center" | "right";
  lineHeight?: number;
  tracking?: number;
  uppercase?: boolean;
  /** "label<TAB>value" rows drawn as two columns. */
  table?: boolean;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  radius?: number;
  padding?: number;
  shape?: "rect" | "ellipse" | "line";
  src?: string;
};

export type Layout = { elements: LabelElement[]; backgrounds?: Partial<Record<"back" | "front" | "right", string>> };
export type LabelSize = { width: number; height: number };

export const PT = 25.4 / 72; // millimetres per point
export const SAFE_MARGIN = 2;
export const WRAP: ("back" | "front" | "right")[] = ["back", "front", "right"];

export const newId = () => "e" + Math.random().toString(36).slice(2, 10);

/** The unit label's size from the packaging template (supplier-confirmed or illustrative). */
export function labelSize(template: Pick<Template, "widthMm" | "heightMm">): LabelSize {
  const width = Number(template.widthMm) || 170;
  const height = Number(template.heightMm) || 171;
  return { width, height };
}

/** The text an element prints: its own, or the design field it is bound to. */
export function elementText(element: LabelElement, content: DesignContent) {
  const text = element.field ? content.fields[element.field] ?? "" : element.text ?? "";
  return element.uppercase ? text.toLocaleUpperCase() : text;
}

/** The ink of an ORZETA line on its own background, otherwise the design's secondary colour. */
export const inkFor = (content: DesignContent, line: string) => (line ? (line === "grove" ? "#fff9e8" : "#162f25") : content.colors.secondary);

let measurer: CanvasRenderingContext2D | null = null;
/** A canvas to measure text with; on the server, where there is none, an estimate from the font size. */
const measure = (): CanvasRenderingContext2D => {
  if (typeof document === "undefined") {
    let px = 10;
    return {
      set font(value: string) { px = Number(/(\d+(?:\.\d+)?)px/.exec(value)?.[1] ?? 10); },
      measureText: (text: string) => ({ width: text.length * px * .48 }),
    } as unknown as CanvasRenderingContext2D;
  }
  return (measurer ??= document.createElement("canvas").getContext("2d")!);
};

const fontOf = (e: LabelElement, px: number) => `${e.italic ? "italic " : ""}${e.weight ?? 400} ${px}px ${fontFamily(e.font)}`;

/** Lines of a text block wrapped to a width, both in millimetres. */
function wrapLines(ctx: CanvasRenderingContext2D, e: LabelElement, text: string, widthMm: number, pxPerMm: number) {
  ctx.font = fontOf(e, (e.size ?? 9) * PT * pxPerMm);
  const max = widthMm * pxPerMm;
  return text.split("\n").flatMap((paragraph) => {
    const lines = [""];
    for (const word of paragraph.split(/\s+/)) {
      const current = lines[lines.length - 1]!;
      const candidate = current ? `${current} ${word}` : word;
      if (current && ctx.measureText(candidate).width > max) lines.push(word);
      else lines[lines.length - 1] = candidate;
    }
    return lines;
  });
}

const lineStep = (e: LabelElement) => (e.size ?? 9) * PT * (e.lineHeight ?? 1.22);

/** The height a text or field element needs for its content at its width, in millimetres. */
export function textHeight(e: LabelElement, content: DesignContent) {
  const text = elementText(e, content);
  const pad = e.padding ?? 0;
  if (e.table) {
    const ctx = measure();
    let total = 0;
    for (const row of text.split("\n")) {
      const [label, value] = row.split("\t");
      if (value === undefined) {
        total += wrapLines(ctx, e, label ?? "", e.w - pad * 2, 10).length * lineStep(e);
        continue;
      }
      ctx.font = fontOf(e, (e.size ?? 9) * PT * 10);
      const valueMm = Math.min((e.w - pad * 2) * .45, ctx.measureText(value).width / 10);
      total += wrapLines(ctx, e, label ?? "", e.w - pad * 2 - valueMm - 1.5, 10).length * lineStep(e) + .8;
    }
    return total + pad * 2;
  }
  return wrapLines(measure(), e, text, e.w - pad * 2, 10).length * lineStep(e) + pad * 2;
}

const textual = (e: LabelElement) => e.type === "text" || e.type === "field";

/** Text blocks grow and shrink with their wording, like text frames set to auto-height. */
export function fitLayout(layout: Layout, content: DesignContent): Layout {
  let changed = false;
  const elements = layout.elements.map((e) => {
    if (!textual(e)) return e;
    const h = Math.max(1, Math.round(textHeight(e, content) * 100) / 100);
    if (Math.abs(h - e.h) < .01) return e;
    changed = true;
    return { ...e, h };
  });
  return changed ? { ...layout, elements } : layout;
}

// --- Starting layout from the market template -----------------------------------------------------

/** Field keys in the order of the real ORZETA labels, per panel. */
const BACK = ["foodType", "storage", "ingredients", "producer", "organicControl", "productionDate", "bestBefore", "lot", "destinationCountry", "marks"];
const FRONT = ["productName", "productNameFr", "productNameAr", "origin", "claim"];
const RIGHT = ["categoryStatement", "nutrition"];
const BOXED = ["importer", "barcode"];

/**
 * The label as the market template lays it out, as editable elements: the back information panel,
 * the front with the logo, and the nutrition panel, like the supplied ORZETA artwork.
 */
export function templateLayout(content: DesignContent, template: Template & { variant?: { product: { slug: string } } }, line: string): Layout {
  const { width, height } = labelSize(template);
  const panel = width / 3;
  const margin = panel * .07;
  const inner = panel - margin * 2;
  const body = panel * TEMPLATE_TEXT_SIZE / 100 / PT; // points
  const ink = inkFor(content, line);
  const base = { font: "roboto-condensed", size: Math.round(body * 10) / 10, color: ink, lineHeight: 1.2 };
  const has = (key: string) => Boolean(content.fields[key]?.trim());
  const elements: LabelElement[] = [];
  const add = (e: Omit<LabelElement, "id" | "h"> & { h?: number }) => {
    // Stable ids, so the starting layout keeps its selection while the client fills in fields.
    const element = { id: `t${elements.length}`, h: 1, ...e } as LabelElement;
    element.h = e.h ?? Math.max(2, textHeight(element, content));
    elements.push(element);
    return element;
  };
  const stack = (keys: string[], left: number, start: number, extra: (key: string) => Partial<LabelElement> = () => ({})) => {
    let y = start;
    for (const key of keys.filter(has)) {
      const e = add({ type: "field", field: key, x: left, y, w: inner, ...base, ...extra(key) });
      y += e.h + body * PT * .55;
    }
    return y;
  };

  // Back panel: information, then the importer and barcode in white boxes.
  let y = stack(BACK, margin, height * .05);
  for (const key of BOXED.filter(has)) {
    const e = add({ type: "field", field: key, x: margin, y, w: inner, ...base, color: "#1c1a16", fill: "#ffffff", padding: 1.4 });
    y += e.h + body * PT * .7;
  }

  // Front panel: logo, names, origin and claim, then the line signature and the net quantity at the foot.
  const logo = getArtworkLogo(content, line, template.variant?.product.slug ?? "");
  let front = height * .1;
  if (logo) {
    const logoHeight = panel * .62;
    add({ type: "image", name: "Logo", src: logo, x: width / 2 - panel * .35, y: front, w: panel * .7, h: logoHeight });
    front += logoHeight + panel * .08;
  } else if (has("brandName")) {
    const e = add({ type: "field", field: "brandName", name: "Brand", x: panel + margin, y: height * .12, w: inner, ...base, size: body * 2.6, weight: 700, align: "center" });
    front = e.y + e.h + panel * .08;
  }
  stack(FRONT, panel + margin, front, (key) => ({
    align: "center",
    ...(key.startsWith("productName") ? { size: Math.round(body * 1.45), weight: 700 } : {}),
    ...(key === "claim" ? { weight: 700, color: content.colors.secondary } : {}),
  }));
  if (line) {
    add({
      type: "text", name: "Signature", text: line[0]!.toUpperCase() + line.slice(1) + " Signature",
      x: panel + margin, y: height * .76, w: inner, ...base, size: Math.round(body * 1.2), italic: true, weight: 700,
      align: "center", color: content.colors.secondary, font: "cormorant",
    });
  }
  if (has("netQuantity")) {
    add({ type: "field", field: "netQuantity", x: panel + margin, y: height * .87, w: inner, ...base, size: Math.round(body * 1.45), weight: 700, align: "center" });
  }

  // Right panel: brand, category statement, nutrition table and website.
  let right = height * .05;
  if (has("brandName")) {
    const e = add({ type: "field", field: "brandName", name: "Brand", x: panel * 2 + margin, y: right, w: inner, ...base, size: Math.round(body * 1.9), weight: 700 });
    right += e.h + body * PT * .6;
  }
  right = stack(RIGHT, panel * 2 + margin, right, (key) => (key === "nutrition" ? { table: true } : { size: Math.round(body * .92 * 10) / 10 }));
  if (line) add({ type: "text", name: "Website", text: "www.orzeta.com", x: panel * 2 + margin, y: right, w: inner, ...base, size: Math.round(body * .92 * 10) / 10 });

  return { elements };
}

// --- Drawing ------------------------------------------------------------------------------------

const images = new Map<string, Promise<HTMLImageElement | null>>();

/** Loads an image once; a missing image draws nothing rather than breaking the label. */
export function loadImage(src: string) {
  let image = images.get(src);
  if (!image) {
    image = new Promise((resolve) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => resolve(null);
      element.src = src;
    });
    images.set(src, image);
  }
  return image;
}

/** Everything a layout needs before it can be drawn: its typefaces and its images. */
export async function prepare(layout: Layout) {
  await loadFonts();
  const loaded = await Promise.all(layout.elements.filter((e) => e.type === "image" && e.src).map(async (e) => [e.src!, await loadImage(e.src!)] as const));
  return new Map(loaded);
}

const ARABIC_FIRST = /^[^A-Za-z؀-ۿ]*[؀-ۿ]/;

function drawText(ctx: CanvasRenderingContext2D, e: LabelElement, content: DesignContent, s: number) {
  const pad = (e.padding ?? 0) * s;
  const px = (e.size ?? 9) * PT * s;
  const step = lineStep(e) * s;
  const left = pad;
  const width = e.w * s - pad * 2;
  ctx.fillStyle = e.color ?? "#1c1a16";
  ctx.font = fontOf(e, px);
  if ("letterSpacing" in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${(e.tracking ?? 0) * px}px`;
  let y = pad;
  const row = (text: string, x0: number, w: number, align: LabelElement["align"]) => {
    const arabic = ARABIC_FIRST.test(text);
    ctx.direction = arabic ? "rtl" : "ltr";
    const a = align ?? (arabic ? "right" : "left");
    ctx.textAlign = a;
    ctx.fillText(text, a === "center" ? x0 + w / 2 : a === "right" ? x0 + w : x0, y + px * .82);
  };
  const text = elementText(e, content);
  if (e.table) {
    ctx.strokeStyle = e.color ?? "#1c1a16";
    ctx.lineWidth = Math.max(.6, .15 * s);
    for (const line of text.split("\n")) {
      const [label, value] = line.split("\t");
      if (value === undefined) {
        for (const part of wrapLines(ctx, e, label ?? "", e.w - (e.padding ?? 0) * 2, s)) { row(part, left, width, e.align); y += step; }
        continue;
      }
      ctx.font = fontOf(e, px);
      const valueWidth = Math.min(width * .45, ctx.measureText(value).width);
      const start = y;
      for (const part of wrapLines(ctx, e, label ?? "", (width - valueWidth) / s - 1.5, s)) { row(part, left, width - valueWidth - 1.5 * s, "left"); y += step; }
      const end = y;
      y = start;
      row(value, left, width, "right");
      y = end + .2 * s;
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(left + width, y);
      ctx.stroke();
      y += .6 * s;
    }
  } else {
    for (const part of wrapLines(ctx, e, text, e.w - (e.padding ?? 0) * 2, s)) { row(part, left, width, e.align); y += step; }
  }
  ctx.direction = "ltr";
}

function drawElement(ctx: CanvasRenderingContext2D, e: LabelElement, content: DesignContent, s: number, loaded: Map<string, HTMLImageElement | null>) {
  if (e.hidden) return;
  ctx.save();
  ctx.globalAlpha = e.opacity ?? 1;
  ctx.translate((e.x + e.w / 2) * s, (e.y + e.h / 2) * s);
  ctx.rotate(((e.rotation ?? 0) * Math.PI) / 180);
  ctx.translate((-e.w / 2) * s, (-e.h / 2) * s);
  const w = e.w * s;
  const h = e.h * s;
  if (e.type === "shape" || ((e.type === "text" || e.type === "field") && (e.fill || e.stroke))) {
    ctx.beginPath();
    if (e.shape === "ellipse") ctx.ellipse(w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
    else if (e.shape === "line") { ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); }
    else ctx.roundRect(0, 0, w, h, (e.radius ?? 0) * s);
    if (e.fill && e.shape !== "line") { ctx.fillStyle = e.fill; ctx.fill(); }
    if (e.stroke || e.shape === "line") {
      ctx.strokeStyle = e.stroke ?? e.fill ?? "#1c1a16";
      ctx.lineWidth = Math.max(.5, (e.strokeWidth ?? .3) * s);
      ctx.stroke();
    }
  }
  if (e.type === "image" && e.src) {
    const image = loaded.get(e.src);
    if (image) {
      const ratio = Math.min(w / image.naturalWidth, h / image.naturalHeight);
      const iw = image.naturalWidth * ratio;
      const ih = image.naturalHeight * ratio;
      ctx.drawImage(image, (w - iw) / 2, (h - ih) / 2, iw, ih);
    }
  }
  if (e.type === "text" || e.type === "field") drawText(ctx, e, content, s);
  ctx.restore();
}

/** Draws the whole unit label at `pxPerMm` pixels per millimetre. */
export function renderLabel(canvas: HTMLCanvasElement, content: DesignContent, layout: Layout, size: LabelSize, pxPerMm: number, loaded: Map<string, HTMLImageElement | null>) {
  canvas.width = Math.round(size.width * pxPerMm);
  canvas.height = Math.round(size.height * pxPerMm);
  const ctx = canvas.getContext("2d")!;
  WRAP.forEach((face, index) => {
    ctx.fillStyle = layout.backgrounds?.[face] ?? content.colors.primary;
    ctx.fillRect(Math.floor((size.width * index) / 3 * pxPerMm), 0, Math.ceil(size.width / 3 * pxPerMm) + 1, canvas.height);
  });
  for (const element of layout.elements) drawElement(ctx, element, content, pxPerMm, loaded);
  return canvas;
}

/** The three wrap panels of the unit label, at the resolution the 3D preview and the flat view use. */
export async function renderWrapFaces(content: DesignContent, layout: Layout, size: LabelSize): Promise<Partial<Record<PanelFace, HTMLCanvasElement>>> {
  const loaded = await prepare(layout);
  const full = renderLabel(document.createElement("canvas"), content, layout, size, LABEL_SIZE / size.height, loaded);
  const third = full.width / 3;
  return Object.fromEntries(WRAP.map((face, index) => {
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(third);
    canvas.height = full.height;
    canvas.getContext("2d")!.drawImage(full, index * third, 0, third, full.height, 0, 0, canvas.width, canvas.height);
    return [face, canvas];
  }));
}

/** The design's own layout, or the market template's when it has none yet. */
export function layoutOf(content: DesignContent, template: Template & { variant?: { product: { slug: string } } }, line: string): Layout {
  return (content.artwork?.layout?.unit as Layout | undefined) ?? templateLayout(content, template, line);
}
