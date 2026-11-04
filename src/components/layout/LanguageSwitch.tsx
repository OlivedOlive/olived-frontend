"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { localizeHref, LOCALE_COOKIE, localeLabel, locales, stripLocale, type Locale } from "@/i18n/config";

/** Remembers the visitor's language for future visits to "/" (read by src/proxy.ts). */
function saveLocale(l: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
}

/** Links to the same page in each language and remembers the choice for future visits. */
export function LanguageSwitch({
  locale,
  label,
  variant = "header",
  onNavigate,
}: {
  locale: Locale;
  label: string;
  variant?: "header" | "menu";
  onNavigate?: () => void;
}) {
  const path = stripLocale(usePathname());
  const remember = (l: Locale) => {
    saveLocale(l);
    onNavigate?.();
  };
  const text = (l: Locale) => (variant === "menu" ? localeLabel[l].name : localeLabel[l].short);

  return (
    <nav className={variant === "menu" ? "lang-switch lang-switch-menu" : "lang-switch"} aria-label={label}>
      {locales.map((l, i) => (
        <span key={l} className="lang-item">
          {i > 0 && (
            <span className="lang-sep" aria-hidden="true">
              /
            </span>
          )}
          {l === locale ? (
            <span className="lang-current" aria-current="true" lang={l} title={localeLabel[l].name}>
              {text(l)}
            </span>
          ) : (
            <Link
              href={localizeHref(l, path)}
              hrefLang={l}
              lang={l}
              className="lang-link"
              title={localeLabel[l].name}
              onClick={() => remember(l)}
            >
              {text(l)}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
