import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale, LOCALE_COOKIE, locales, type Locale } from "./i18n/config";

/** Saved choice first, then the browser's Accept-Language, then English. */
function pickLocale(request: NextRequest): Locale {
  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  if (saved && isLocale(saved)) return saved;

  const header = request.headers.get("accept-language") ?? "";
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { lang: tag.toLowerCase().split("-")[0], q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  for (const { lang } of ranked) if (isLocale(lang)) return lang;
  return defaultLocale;
}

/** Sends /maison to /fr/maison (etc.) so every page lives under a language prefix. */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasLocale = locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  // OLIVED Studio (app/studio) is English only and has no language prefix.
  const isStudio = pathname === "/studio" || pathname.startsWith("/studio/");
  // Files (favicon.svg, og-image.jpg, robots.txt…) are served as they are.
  if (hasLocale || isStudio || /\.[a-z0-9]+$/i.test(pathname)) return;

  const url = request.nextUrl.clone();
  url.pathname = `/${pickLocale(request)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip Next internals and the API; files with an extension are skipped in the function above.
  matcher: ["/((?!_next/static|_next/image|api).*)"],
};
