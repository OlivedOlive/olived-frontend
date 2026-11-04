/** Supported languages. English is the default and the fallback. */
export const locales = ["en", "fr", "ar"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const isLocale = (value: string): value is Locale => (locales as readonly string[]).includes(value);

export const localeDir: Record<Locale, "ltr" | "rtl"> = { en: "ltr", fr: "ltr", ar: "rtl" };

/** Each language is shown in its own name in the switcher. */
export const localeLabel: Record<Locale, { short: string; name: string }> = {
  en: { short: "EN", name: "English" },
  fr: { short: "FR", name: "Français" },
  ar: { short: "ع", name: "العربية" },
};

/** Cookie remembering the visitor's language choice; read by src/proxy.ts. */
export const LOCALE_COOKIE = "NEXT_LOCALE";

/** "/maison" + "fr" -> "/fr/maison". Keeps #hash and ?query. */
export function localizeHref(locale: Locale, href: string): string {
  if (!href.startsWith("/")) return href;
  return href === "/" ? `/${locale}` : `/${locale}${href}`;
}

/** "/fr/maison" -> "/maison"; "/fr" -> "/". */
export function stripLocale(pathname: string): string {
  const parts = pathname.split("/");
  if (parts[1] && isLocale(parts[1])) {
    const rest = "/" + parts.slice(2).join("/");
    return rest === "/" ? "/" : rest.replace(/\/$/, "");
  }
  return pathname;
}

/** Canonical URL plus hreflang links to the same page in every language (for search engines). */
export function alternates(locale: Locale, path: string) {
  return {
    canonical: localizeHref(locale, path),
    languages: {
      ...Object.fromEntries(locales.map((l) => [l, localizeHref(l, path)])),
      "x-default": localizeHref(defaultLocale, path),
    },
  };
}
