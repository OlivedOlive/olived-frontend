import type { MetadataRoute } from "next";
import { localizeHref, locales, type Locale } from "@/i18n/config";
import { navItems, site } from "@/lib/site";

/** Every page in every language, each listing its translations. */
export default function sitemap(): MetadataRoute.Sitemap {
  const url = (locale: Locale, href: string) => `${site.url}${localizeHref(locale, href)}`;

  return navItems.flatMap(({ href }) =>
    locales.map((locale) => ({
      url: url(locale, href),
      alternates: { languages: Object.fromEntries(locales.map((l) => [l, url(l, href)])) },
    })),
  );
}
