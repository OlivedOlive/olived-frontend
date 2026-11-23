import {
  Cormorant_Garamond,
  Great_Vibes,
  Inter,
  Lora,
  Montserrat,
  Noto_Naskh_Arabic,
  Noto_Sans_Arabic,
  Oswald,
  Playfair_Display,
  Roboto_Condensed,
} from "next/font/google";

/*
 * Typefaces of the label editor. All are under the SIL Open Font License, so they may be embedded in
 * the Studio and in print files. They are served from this site and only load when the editor uses
 * them. The backend's text-height check knows each one's x-height (X_HEIGHT in designs/validate.ts):
 * add a typeface in both places.
 */
const robotoCondensed = Roboto_Condensed({ subsets: ["latin", "cyrillic"], display: "swap", preload: false });
const inter = Inter({ subsets: ["latin", "cyrillic"], display: "swap", preload: false });
const montserrat = Montserrat({ subsets: ["latin", "cyrillic"], display: "swap", preload: false });
const oswald = Oswald({ subsets: ["latin", "cyrillic"], display: "swap", preload: false });
const cormorant = Cormorant_Garamond({ subsets: ["latin", "cyrillic"], weight: ["400", "600", "700"], style: ["normal", "italic"], display: "swap", preload: false });
const playfair = Playfair_Display({ subsets: ["latin", "cyrillic"], style: ["normal", "italic"], display: "swap", preload: false });
const lora = Lora({ subsets: ["latin", "cyrillic"], style: ["normal", "italic"], display: "swap", preload: false });
const greatVibes = Great_Vibes({ subsets: ["latin"], weight: "400", display: "swap", preload: false });
const notoSansArabic = Noto_Sans_Arabic({ subsets: ["arabic"], display: "swap", preload: false });
const notoNaskhArabic = Noto_Naskh_Arabic({ subsets: ["arabic"], display: "swap", preload: false });

export type FontKey =
  | "roboto-condensed" | "inter" | "montserrat" | "oswald" | "cormorant" | "playfair" | "lora" | "great-vibes"
  | "noto-sans-arabic" | "noto-naskh-arabic" | "serif" | "sans" | "mono";

/** Arabic, Cyrillic and East Asian letters a Latin typeface lacks fall back to these. */
const FALLBACK = `${notoSansArabic.style.fontFamily}, "Hiragino Sans", "Yu Gothic", "Malgun Gothic", "Microsoft JhengHei", sans-serif`;

export const FONTS: { key: FontKey; label: string; group: string; family: string }[] = [
  { key: "roboto-condensed", label: "Roboto Condensed", group: "Label sans", family: robotoCondensed.style.fontFamily },
  { key: "inter", label: "Inter", group: "Label sans", family: inter.style.fontFamily },
  { key: "montserrat", label: "Montserrat", group: "Label sans", family: montserrat.style.fontFamily },
  { key: "oswald", label: "Oswald", group: "Display", family: oswald.style.fontFamily },
  { key: "cormorant", label: "Cormorant Garamond", group: "Serif", family: cormorant.style.fontFamily },
  { key: "playfair", label: "Playfair Display", group: "Serif", family: playfair.style.fontFamily },
  { key: "lora", label: "Lora", group: "Serif", family: lora.style.fontFamily },
  { key: "great-vibes", label: "Great Vibes", group: "Script", family: greatVibes.style.fontFamily },
  { key: "noto-sans-arabic", label: "Noto Sans Arabic", group: "Arabic", family: notoSansArabic.style.fontFamily },
  { key: "noto-naskh-arabic", label: "Noto Naskh Arabic", group: "Arabic", family: notoNaskhArabic.style.fontFamily },
];

/** Typefaces of designs made before the editor. */
const LEGACY: Record<string, string> = { serif: "Georgia, serif", sans: "Arial, sans-serif", mono: "monospace" };

/** The CSS font-family of a typeface key, with fallbacks for other scripts. */
export function fontFamily(key: string | undefined) {
  const found = FONTS.find((font) => font.key === key);
  return `${found?.family ?? LEGACY[key ?? ""] ?? FONTS[0]!.family}, ${FALLBACK}`;
}

let loading: Promise<unknown> | null = null;

/** Loads every editor typeface, so the canvas never draws with a fallback by mistake. */
export function loadFonts() {
  loading ??= Promise.all(FONTS.flatMap(({ family }) =>
    ["400", "700", "italic 400"].map((style) => document.fonts.load(`${style} 16px ${family}`).catch(() => [])),
  ));
  return loading;
}
