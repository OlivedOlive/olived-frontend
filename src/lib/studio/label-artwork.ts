import mark from "@/assets/images/studio/oussoul-mark.png";
import type { DesignContent, PackagePart, Panel, PanelFace, Template } from "./types";

export const FACES: PanelFace[] = ["front", "back", "left", "right", "top", "bottom"];
export const LABEL_SIZE = 680;
export const WRAP_PANEL_WIDTH = 226;

const STARTER_COPY: Record<string, [string, string, string]> = {
  DE: ["Natives Olivenöl extra", "Tunesien", "Vor Licht und Wärme geschützt aufbewahren."],
  FR: ["Huile d’olive vierge extra", "Tunisie", "À conserver à l’abri de la chaleur et de la lumière."],
  CA: ["Extra virgin olive oil", "Tunisia / Tunisie", "Keep in a cool, dark place / Conserver au frais et à l’abri de la lumière."],
  US: ["Extra virgin olive oil", "Tunisia", "Store in a cool, dark place."],
  GB: ["Extra virgin olive oil", "Tunisia", "Store away from heat and light."],
  JP: ["食用オリーブ油", "チュニジア", "直射日光、高温多湿を避けて保存してください。"],
  TW: ["特級初榨橄欖油", "突尼西亞", "請置於陰涼處，避免陽光直射。"],
  RU: ["Масло оливковое нерафинированное Extra Virgin", "Тунис", "Хранить в защищённом от света месте, вдали от источников тепла."],
};

export function getStarterCopy(code?: string): Record<string, string> {
  const [productName, origin, storage] = STARTER_COPY[code ?? ""] ??
    ["Extra virgin olive oil", "Tunisia", ""];
  const localized: Record<string, string> = code === "CA" ? { productNameFr: "Huile d’olive extra vierge" }
    : ["SA", "AE", "KW", "QA"].includes(code ?? "") ? { productNameAr: "زيت زيتون بكر ممتاز" } : {};
  return { productName, origin, storage, ...localized };
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

export function defaultPanel(content: DesignContent, part: PackagePart, face: PanelFace): Panel {
  const f = content.fields;
  if (face === "front") {
    return { text: [f.productName || f.productNameEn, f.productNameFr, f.productNameAr, f.origin, f.netQuantity].filter(Boolean).join("\n"), x: 50, y: 60, size: 11 };
  }
  if (face === "back" && part === "unit") {
    return { text: [f.ingredients, f.storage, f.importer, f.lot, f.barcode].filter(Boolean).join("\n\n"), x: 50, y: 48, size: 8 };
  }
  if (face === "right" && part === "unit") {
    return { text: f.nutrition ?? "", x: 50, y: 47, size: 8 };
  }
  return { text: "", x: 50, y: 50, size: 6 };
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
  const panel = content.artwork?.panels[part]?.[face] ?? defaultPanel(content, part, face);
  const font = content.artwork?.font ?? "serif";
  const family = font === "mono" ? "monospace" : font === "sans" ? "Arial, sans-serif" : "Georgia, serif";
  const front = face === "front";
  ctx.fillStyle = primary;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = line ? (line === "grove" ? "#fff9e8" : "#162f25") : secondary;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  if (front) {
    const placement = content.artwork?.logoPlacement ?? { x: 50, y: 10, size: 70 };
    if (logo) {
      const bounds = logo as HTMLImageElement;
      const logoWidth = width * placement.size / 100;
      const logoHeight = logoWidth * bounds.naturalHeight / bounds.naturalWidth;
      ctx.drawImage(logo, width * placement.x / 100 - logoWidth / 2, height * placement.y / 100, logoWidth, logoHeight);
    } else if (content.fields.brandName) {
      ctx.font = "bold " + width * .17 + "px " + family;
      ctx.fillText(content.fields.brandName, width / 2, height * .24, width * .86);
    }
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
