/**
 * Retail barcodes drawn from the number the client types: EAN-13 (13 digits), UPC-A (12 digits, used in
 * the US and Canada) and EAN-8 (8 digits). The bars follow the GS1 General Specifications: 7-module digit
 * patterns, guard bars, quiet zones, and a module of 0.33 mm at 100% magnification (80% to 200% allowed).
 */

export type Barcode = {
  kind: "EAN-13" | "UPC-A" | "EAN-8";
  digits: string;
  /** One entry per module: true is a bar. */
  modules: boolean[];
  /** Modules of guard bars, which run down between the digits. */
  guards: Set<number>;
  /** Quiet zone in modules, left and right. */
  quiet: [number, number];
};

/** Nominal module width, in millimetres, at 100% magnification. */
export const MODULE_MM = .33;
/** Nominal bar height of EAN-13 and UPC-A at 100%, in modules (22.85 mm). */
export const BAR_MODULES = 22.85 / MODULE_MM;
export const MIN_MAGNIFICATION = .8;
export const MAX_MAGNIFICATION = 2;

const L = ["0001101", "0011001", "0010011", "0111101", "0100011", "0110001", "0101111", "0111011", "0110111", "0001011"];
const G = ["0100111", "0110011", "0011011", "0100001", "0011101", "0111001", "0000101", "0010001", "0001001", "0010111"];
const R = ["1110010", "1100110", "1101100", "1000010", "1011100", "1001110", "1010000", "1000100", "1001000", "1110100"];
/** Which left-half digits use the G set, by the first digit of an EAN-13. */
const PARITY = ["LLLLLL", "LLGLGG", "LLGGLG", "LLGGGL", "LGLLGG", "LGGLLG", "LGGGLL", "LGLGLG", "LGLGGL", "LGGLGL"];

/** The GS1 check digit of the digits before it. */
export function checkDigit(body: string) {
  const sum = [...body].reverse().reduce((total, d, i) => total + Number(d) * (i % 2 === 0 ? 3 : 1), 0);
  return String((10 - (sum % 10)) % 10);
}

/**
 * The barcode number in a field's text, if there is one: 8, 12 or 13 digits, spaces and dashes allowed,
 * anywhere in the text ("EAN 619 1234 567890"). Brackets mean a placeholder, so there is none yet.
 */
export function barcodeNumber(text: string) {
  if (/\[[^\]]*\]/.test(text)) return null;
  const match = /(?:^|[^\d])((?:\d[\s-]?){7,12}\d)(?!\d)/.exec(text);
  const digits = match?.[1]?.replace(/[\s-]/g, "") ?? "";
  return [8, 12, 13].includes(digits.length) ? digits : null;
}

export type BarcodeStatus =
  | { ok: true; barcode: Barcode }
  | { ok: false; reason: "none" | "length" | "checkDigit"; expected?: string };

/** Reads a field's text: a drawable barcode, or why there is none. */
export function readBarcode(text: string): BarcodeStatus {
  const digits = barcodeNumber(text);
  if (!digits) {
    const loose = text.replace(/\[[^\]]*\]/g, "").replace(/[^\d]/g, "");
    return { ok: false, reason: loose.length >= 6 ? "length" : "none" };
  }
  const expected = checkDigit(digits.slice(0, -1));
  if (expected !== digits.at(-1)) return { ok: false, reason: "checkDigit", expected };
  return { ok: true, barcode: encode(digits) };
}

function encode(digits: string): Barcode {
  const bits: string[] = [];
  const guards = new Set<number>();
  const guard = (pattern: string) => {
    for (const bit of pattern) {
      if (bit === "1") guards.add(bits.length);
      bits.push(bit);
    }
  };
  const data = (pattern: string, extend = false) => {
    for (const bit of pattern) {
      if (bit === "1" && extend) guards.add(bits.length);
      bits.push(bit);
    }
  };
  if (digits.length === 8) {
    guard("101");
    for (const d of digits.slice(0, 4)) data(L[Number(d)]!);
    guard("01010");
    for (const d of digits.slice(4)) data(R[Number(d)]!);
    guard("101");
    return { kind: "EAN-8", digits, modules: bits.map((b) => b === "1"), guards, quiet: [7, 7] };
  }
  const upc = digits.length === 12;
  const ean = upc ? `0${digits}` : digits;
  const parity = PARITY[Number(ean[0])]!;
  guard("101");
  [...ean.slice(1, 7)].forEach((d, i) => data((parity[i] === "G" ? G : L)[Number(d)]!, upc && i === 0));
  guard("01010");
  [...ean.slice(7)].forEach((d, i) => data(R[Number(d)]!, upc && i === 5));
  guard("101");
  return { kind: upc ? "UPC-A" : "EAN-13", digits, modules: bits.map((b) => b === "1"), guards, quiet: upc ? [9, 9] : [11, 7] };
}

/** Width of the whole symbol, quiet zones included, in modules. */
export const symbolModules = (barcode: Barcode) => barcode.quiet[0] + barcode.modules.length + barcode.quiet[1];

/** The smallest size the Studio draws. Below 80% the Studio warns: tills may not read it. */
export const SMALLEST_MAGNIFICATION = .6;

/** The module size that fits a width, from 60% to 200% of the GS1 nominal size. */
export function moduleFor(barcode: Barcode, widthMm: number) {
  const fit = widthMm / symbolModules(barcode);
  return Math.min(MODULE_MM * MAX_MAGNIFICATION, Math.max(MODULE_MM * SMALLEST_MAGNIFICATION, fit));
}

/** The GS1 nominal bar height for this size, in millimetres. */
export const nominalBarHeight = (barcode: Barcode, moduleMm: number) =>
  moduleMm * (barcode.kind === "EAN-8" ? 18.23 / MODULE_MM : BAR_MODULES);

/** Bar height when the client has not set one: half the nominal height, as on most bottle labels. */
export const defaultBarHeight = (barcode: Barcode, moduleMm: number) => Math.round(nominalBarHeight(barcode, moduleMm) * .5 * 10) / 10;

/** The shortest bars the Studio draws, in millimetres. */
export const MIN_BAR_MM = 4;

export type BarcodeStyle = "gs1" | "simple";

/** Height of the drawn symbol: bars, then the digits underneath. */
export const symbolHeight = (barcode: Barcode, moduleMm: number, barHeightMm = defaultBarHeight(barcode, moduleMm)) =>
  Math.max(MIN_BAR_MM, barHeightMm) + moduleMm * 9;

/**
 * Draws the symbol with its top-left corner at (x, y), in canvas pixels. `px` is pixels per millimetre.
 * "gs1" sets the digits between the guard bars, as GS1 prints them; "simple" centres the number under
 * plain bars.
 */
export function drawBarcode(
  ctx: CanvasRenderingContext2D, barcode: Barcode, x: number, y: number, moduleMm: number, px: number, font: string,
  ink = "#000000", barHeightMm = defaultBarHeight(barcode, moduleMm), style: BarcodeStyle = "gs1",
) {
  const m = moduleMm * px;
  const bars = Math.max(MIN_BAR_MM, barHeightMm) * px;
  const guardExtra = style === "gs1" ? 5 * m : 0;
  const left = x + barcode.quiet[0] * m;
  ctx.save();
  ctx.fillStyle = ink;
  barcode.modules.forEach((bar, i) => {
    if (!bar) return;
    // Bars are drawn a hair narrower than a module, as printers spread ink.
    ctx.fillRect(left + i * m, y, m * .96, bars + (barcode.guards.has(i) ? guardExtra : 0));
  });
  const size = 9 * m * .95;
  ctx.font = `${Math.round(size * 10) / 10}px ${font}`;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "center";
  const baseline = y + bars + 8.4 * m;
  const d = barcode.digits;
  if (style === "simple") {
    if ("letterSpacing" in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${m * .6}px`;
    ctx.fillText(d, left + (barcode.modules.length * m) / 2, baseline);
    ctx.restore();
    return;
  }
  const at = (text: string, fromModule: number, widthModules: number) => {
    const step = (widthModules * m) / text.length;
    [...text].forEach((c, i) => ctx.fillText(c, left + fromModule * m + step * (i + .5), baseline));
  };
  if (barcode.kind === "EAN-8") {
    at(d.slice(0, 4), 3, 28);
    at(d.slice(4), 36, 28);
  } else if (barcode.kind === "UPC-A") {
    ctx.font = `${Math.round(size * .75 * 10) / 10}px ${font}`;
    ctx.fillText(d[0]!, left - 4.5 * m, baseline);
    ctx.fillText(d[11]!, left + (barcode.modules.length + 4.5) * m, baseline);
    ctx.font = `${Math.round(size * 10) / 10}px ${font}`;
    at(d.slice(1, 6), 10, 35);
    at(d.slice(6, 11), 50, 35);
  } else {
    ctx.fillText(d[0]!, left - 6 * m, baseline);
    at(d.slice(1, 7), 3, 42);
    at(d.slice(7), 50, 42);
    // The ">" marks the end of the right quiet zone, as on most EAN-13 prints.
    ctx.fillText(">", left + (barcode.modules.length + 4) * m, baseline);
  }
  ctx.restore();
}
