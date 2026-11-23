import mark from "@/assets/images/studio/oussoul-mark.png";
import type { DesignContent, PackagePart, Panel, PanelFace, Template } from "./types";

export const FACES: PanelFace[] = ["front", "back", "left", "right", "top", "bottom"];
export const LABEL_SIZE = 680;
export const WRAP_PANEL_WIDTH = 226;

/**
 * Text size of a wrap panel drawn from the market template, as a percentage of the panel width. The
 * backend's text-height check uses the same value (TEMPLATE_TEXT_SIZE in designs/validate.ts).
 */
export const TEMPLATE_TEXT_SIZE = 6.2;
/** Template text is set this much narrower than the typeface, like the condensed type on the real labels. Height is unchanged. */
const CONDENSE = .8;

/** Fills a market template's copy for a bottle size: {ml}, {flOz}, {servingsTbsp} and {servings15}. */
export function fillCopy(copy: Record<string, string>, ml: number) {
  const tokens: Record<string, string> = {
    ml: String(ml),
    flOz: (ml / 29.5735).toFixed(1),
    servingsTbsp: String(Math.round(ml / 14.79)),
    servings15: String(Math.round(ml / 15)),
  };
  return Object.fromEntries(Object.entries(copy).map(([key, text]) => [
    key, text.replace(/\{(\w+)\}/g, (_, token: string) => tokens[token] ?? `{${token}}`),
  ]));
}

type ProductTemplate = Template & { variant?: { volumeMl: number; product: { slug: string } } };

export function getPackaging(template: ProductTemplate) {
  const slug = template.variant?.product.slug ?? "";
  const format = template.zones?.format ?? (template.kind === "TIN" ? "Tin" : "Marasca glass");
  const volume = template.variant?.volumeMl ?? 750;
  const line = slug.startsWith("orzeta-") ? slug.slice(7) : "";
  return { slug, format, volume, line };
}

export function getLabelReference(line: string, code?: string) {
  const country = code?.toLowerCase() ?? "";
  const groveMarkets = ["sa", "ae", "ca", "us", "fr", "jp", "kw", "qa", "gb", "ru", "tw"];
  if (line === "sun") return { src: "/studio/labels/sun-de.webp", market: "Germany", exact: country === "de" };
  if (line === "grove") {
    const exact = groveMarkets.includes(country);
    return { src: "/studio/labels/grove-" + (exact ? country : "fr") + ".webp", market: exact ? "" : "France", exact };
  }
  if (line === "organic") return { src: "/studio/labels/organic-reference.webp", market: "", exact: false };
  return null;
}

export function getArtworkLogo(content: DesignContent, line: string, slug: string) {
  if (content.artwork?.logo) return content.artwork.logo;
  if (line) return "/studio/labels/mark-" + (line === "sun" ? "sun" : "grove") + ".png";
  if (slug === "oussoul" || content.fields.brandName === "Oussoul") return mark.src;
  return undefined;
}

type Block = { text: string; style?: "title" | "name" | "claim" | "box" | "table" | "small" };

/** The order of the real ORZETA labels: back information, front, and nutrition panel. */
function templateBlocks(content: DesignContent, face: PanelFace, line: string): Block[] {
  const f = content.fields;
  const has = (key: string) => Boolean(f[key]?.trim());
  const block = (key: string, style?: Block["style"]): Block[] => (has(key) ? [{ text: f[key]!.trim(), style }] : []);
  if (face === "back") {
    return [
      ...block("foodType"), ...block("storage"), ...block("ingredients"), ...block("producer"), ...block("organicControl"),
      ...block("productionDate"), ...block("bestBefore"), ...block("lot"), ...block("destinationCountry"), ...block("marks"),
      ...block("importer", "box"), ...block("barcode", "box"),
    ];
  }
  if (face === "front") {
    return [
      ...block("productName", "name"), ...block("productNameFr", "name"), ...block("productNameAr", "name"),
      ...block("origin"), ...block("claim", "claim"),
    ];
  }
  if (face === "right") {
    return [
      ...(has("brandName") ? [{ text: f.brandName!.trim(), style: "title" as const }] : []),
      ...block("categoryStatement", "small"), ...block("nutrition", "table"),
      ...(line ? [{ text: "www.orzeta.com", style: "small" as const }] : []),
    ];
  }
  return [];
}

/** Wrap panels of the unit label that follow the market template unless the client writes their own text. */
const TEMPLATE_FACES: PanelFace[] = ["back", "front", "right"];

export function defaultPanel(content: DesignContent, part: PackagePart, face: PanelFace): Panel {
  if (part === "unit" && TEMPLATE_FACES.includes(face)) {
    const blocks = templateBlocks(content, face, "");
    const text = [...blocks.map((b) => b.text), ...(face === "front" && content.fields.netQuantity ? [content.fields.netQuantity] : [])].join("\n\n");
    return { text: text.slice(0, 500), x: 50, y: 50, size: TEMPLATE_TEXT_SIZE };
  }
  return { text: "", x: 50, y: 50, size: 6 };
}

/** A line whose first letter is Arabic is set right to left; mixed lines that start in Latin stay left to right. */
const ARABIC_FIRST = /^[^A-Za-z\u0600-\u06FF]*[\u0600-\u06FF]/;

/** Splits text into lines no wider than `width`, measuring as if the type were condensed. */
function wrap(ctx: CanvasRenderingContext2D, text: string, width: number) {
  return text.split("\n").flatMap((paragraph) => {
    const lines = [""];
    for (const word of paragraph.split(/\s+/)) {
      const current = lines[lines.length - 1];
      const candidate = current ? current + " " + word : word;
      if (current && ctx.measureText(candidate).width * CONDENSE > width) lines.push(word);
      else lines[lines.length - 1] = candidate;
    }
    return lines;
  });
}

/**
 * Draws a wrap panel from the market template, top to bottom like the real labels: left-aligned
 * information (Arabic lines right-aligned), white boxes for the importer and the barcode, and the
 * nutrition table in two columns.
 */
function drawTemplatePanel(ctx: CanvasRenderingContext2D, content: DesignContent, face: PanelFace, line: string, top: number, family: string, ink: string) {
  const { width, height } = ctx.canvas;
  const pad = width * .07;
  const inner = width - pad * 2;
  const body = width * TEMPLATE_TEXT_SIZE / 100;
  const centered = face === "front";
  let y = top;
  const write = (text: string, size: number, weight = "", color = ink, boxWidth = inner, left = pad) => {
    ctx.font = `${weight} ${size}px ${family}`.trim();
    ctx.fillStyle = color;
    for (const row of wrap(ctx, text, boxWidth)) {
      const arabic = ARABIC_FIRST.test(row);
      ctx.direction = arabic ? "rtl" : "ltr";
      ctx.textAlign = centered ? "center" : arabic ? "right" : "left";
      const x = centered ? left + boxWidth / 2 : arabic ? left + boxWidth : left;
      ctx.fillText(row, x, y + size * .82, boxWidth);
      y += size * 1.24;
    }
    ctx.direction = "ltr";
  };

  for (const block of templateBlocks(content, face, line)) {
    if (block.style === "box") {
      ctx.font = `${body}px ${family}`;
      const rows = wrap(ctx, block.text, inner - body);
      const boxHeight = rows.length * body * 1.24 + body;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(pad, y, inner, boxHeight);
      y += body / 2;
      write(block.text, body, "", "#1c1a16", inner - body, pad + body / 2);
      y += body * .9;
    } else if (block.style === "table") {
      const [title, ...rows] = block.text.split("\n");
      write(title ?? "", body * 1.05, "bold");
      ctx.strokeStyle = ink;
      ctx.lineWidth = Math.max(1, width / 320);
      for (const row of rows) {
        const [label, value] = row.split("\t");
        if (value === undefined) {
          write(label, body * .92);
          continue;
        }
        // The value keeps its own width; the label wraps in the space left of it.
        ctx.font = `${body}px ${family}`;
        const valueWidth = Math.min(inner * .45, ctx.measureText(value).width * CONDENSE);
        const start = y;
        write(label, body, "", ink, inner - valueWidth - body * .6);
        ctx.font = `${body}px ${family}`;
        ctx.textAlign = "right";
        ctx.fillStyle = ink;
        ctx.fillText(value, width - pad, start + body * .82, valueWidth);
        y += body * .18;
        ctx.beginPath();
        ctx.moveTo(pad, y);
        ctx.lineTo(width - pad, y);
        ctx.stroke();
        y += body * .22;
      }
      y += body * .5;
    } else if (block.style === "name") {
      write(block.text, body * 1.45, "bold");
      y += body * .45;
    } else if (block.style === "title") {
      write(block.text, body * (face === "right" ? 1.9 : 1.15), face === "right" ? "bold" : "italic bold", face === "front" ? content.colors.secondary : ink);
      y += body * .6;
    } else if (block.style === "claim") {
      write(block.text, body, "bold", content.colors.secondary);
      y += body * .8;
    } else if (block.style === "small") {
      write(block.text, body * .92);
      y += body * .7;
    } else {
      write(block.text, body);
      y += body * .7;
    }
  }

  // The line signature and the net quantity sit at the foot of the front panel, as on the real labels.
  if (face === "front" && line) {
    y = Math.max(y, height * .76);
    write(line[0].toUpperCase() + line.slice(1) + " Signature", body * 1.15, "italic bold", content.colors.secondary);
  }
  if (face === "front" && content.fields.netQuantity?.trim()) {
    y = Math.max(y + body, height * .88);
    write(content.fields.netQuantity.trim(), body * 1.45, "bold");
  }
}

export function drawLabel(content: DesignContent, part: PackagePart, face: PanelFace, logo?: CanvasImageSource, line = "") {
  const height = LABEL_SIZE;
  const width = part === "unit" && face !== "top" && face !== "bottom" ? WRAP_PANEL_WIDTH : LABEL_SIZE;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  const { primary, secondary } = content.colors;
  const custom = content.artwork?.panels[part]?.[face];
  const template = !custom && part === "unit" && TEMPLATE_FACES.includes(face);
  const panel = custom ?? defaultPanel(content, part, face);
  const font = content.artwork?.font ?? "serif";
  const family = font === "mono" ? "monospace" : font === "sans" ? "Arial, sans-serif" : "Georgia, serif";
  const front = face === "front";
  ctx.fillStyle = primary;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = line ? (line === "grove" ? "#fff9e8" : "#162f25") : secondary;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  let logoBottom = height * .05;
  if (front) {
    const placement = content.artwork?.logoPlacement ?? { x: 50, y: 10, size: 70 };
    if (logo) {
      const bounds = logo as HTMLImageElement;
      const logoWidth = width * placement.size / 100;
      const logoHeight = logoWidth * bounds.naturalHeight / bounds.naturalWidth;
      ctx.drawImage(logo, width * placement.x / 100 - logoWidth / 2, height * placement.y / 100, logoWidth, logoHeight);
      logoBottom = height * placement.y / 100 + logoHeight;
    } else if (content.fields.brandName) {
      ctx.font = "bold " + width * .17 + "px " + family;
      ctx.fillText(content.fields.brandName, width / 2, height * .24, width * .86);
      logoBottom = height * .3;
    }
  }
  if (template) {
    drawTemplatePanel(ctx, content, face, line, front ? logoBottom + width * .08 : height * .05, family, ctx.fillStyle as string);
    return canvas;
  }
  if (face === "right" && part === "unit") {
    ctx.font = "bold " + width * .10 + "px Arial";
    ctx.fillText("NUTRITION", width / 2, height * .13, width * .85);
    ctx.strokeStyle = ctx.fillStyle;
    ctx.beginPath();
    ctx.moveTo(width * .12, height * .18);
    ctx.lineTo(width * .88, height * .18);
    ctx.stroke();
  }
  if (face === "back" && part === "unit") {
    ctx.font = "bold " + width * .095 + "px Arial";
    ctx.fillText("PRODUCT INFORMATION", width / 2, height * .13, width * .85);
  }
  const fontPx = width * panel.size / 100;
  ctx.font = (front ? "bold " : "") + fontPx + "px " + family;
  const lines = panel.text.split("\n").flatMap((paragraph) => {
    const words = paragraph.split(/\s+/);
    const wrapped = [""];
    for (const word of words) {
      const current = wrapped[wrapped.length - 1];
      const candidate = current ? current + " " + word : word;
      if (current && ctx.measureText(candidate).width > width * .83) wrapped.push(word);
      else wrapped[wrapped.length - 1] = candidate;
    }
    return wrapped;
  });
  const lineHeight = fontPx * 1.23;
  lines.forEach((text, index) => ctx.fillText(text, width * panel.x / 100, height * panel.y / 100 + (index - (lines.length - 1) / 2) * lineHeight, width * .88));
  if (front && line) {
    ctx.fillStyle = secondary;
    ctx.font = "italic bold " + width * .12 + "px Georgia";
    ctx.fillText(line[0].toUpperCase() + line.slice(1) + " Signature", width / 2, height * .91);
  }
  return canvas;
}

export async function loadArtworkLogo(src: string | undefined) {
  if (!src) return undefined;
  const image = new Image();
  image.src = src;
  try {
    await image.decode();
    return image;
  } catch {
    return undefined;
  }
}
