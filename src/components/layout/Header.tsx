"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import logoWhite from "@/assets/images/logo-olived-white.png";
import logoBlack from "@/assets/images/logo-olived-black.png";
import { localizeHref, stripLocale, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { lightHeaderRoutes, navItems } from "@/lib/site";
import { LanguageSwitch } from "./LanguageSwitch";
import { ThemeToggle } from "./ThemeToggle";

/** "Get started" opens the OLIVED Studio sign-up (app/studio), which leads into the studio. */
const STUDIO_SIGN_UP = "/studio/register";

export function Header({ locale, t }: { locale: Locale; t: Dictionary["common"] }) {
  const fullPath = usePathname();
  // Menu state is keyed on the full path, so switching language also closes it.
  const pathname = stripLocale(fullPath);
  const href = (path: string) => localizeHref(locale, path);
  const [scrolled, setScrolled] = useState(false);
  // The menu remembers the route it was opened on, so any navigation closes it.
  const [menuOpenOn, setMenuOpenOn] = useState<string | null>(null);
  const menuOpen = menuOpenOn === fullPath;
  const toggleRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const isHome = pathname === "/";
  // On the home page the quote form is on the page itself.
  const quoteHref = isHome ? "#export-enquiry" : href("/contact");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = useCallback((restoreFocus: boolean) => {
    setMenuOpenOn(null);
    if (restoreFocus) toggleRef.current?.focus();
  }, [setMenuOpenOn]);

  // Lock page scroll, move focus into the menu, close on Escape.
  useEffect(() => {
    if (!menuOpen) return;
    document.body.style.overflow = "hidden";
    overlayRef.current?.querySelector("a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu(true);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen, closeMenu]);

  // Basic focus trap inside the open menu.
  const onOverlayKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab" || !overlayRef.current) return;
    const focusable = overlayRef.current.querySelectorAll<HTMLElement>("a, button");
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) return;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const headerClass = [
    "site-header",
    lightHeaderRoutes.has(pathname) && "site-header-light",
    scrolled && "is-scrolled",
    menuOpen && "is-menu-open",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <header className={headerClass} id="site-header">
        <div className="container-wide">
          <div className="header-inner">
            <Link href={href("/")} className="logo" aria-label={t.homeLink}>
              <Image src={logoWhite} alt="OLIVED" className="logo-light" loading="eager" fetchPriority="high" />
              <Image src={logoBlack} alt="" className="logo-dark" loading="eager" />
            </Link>

            <nav className="main-nav" aria-label={t.mainNavigation}>
              {navItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={href(item.href)}
                    className={active ? "nav-item active" : "nav-item"}
                    aria-current={active ? "page" : undefined}
                  >
                    {t.nav[item.key]}
                  </Link>
                );
              })}
            </nav>

            <div className="header-actions">
              <LanguageSwitch locale={locale} label={t.language} />
              <ThemeToggle toDark={t.themeToDark} toLight={t.themeToLight} />
              <Link href={quoteHref} className="btn btn-outline-light">
                {t.requestQuote}
              </Link>
              <Link href={STUDIO_SIGN_UP} className="btn btn-gold">
                {t.getStarted}
              </Link>
              <button
                ref={toggleRef}
                type="button"
                className={menuOpen ? "mobile-toggle is-active" : "mobile-toggle"}
                aria-label={menuOpen ? t.closeMenu : t.openMenu}
                aria-expanded={menuOpen}
                aria-controls="mobile-nav-overlay"
                onClick={() => setMenuOpenOn(menuOpen ? null : fullPath)}
              >
                <span />
                <span />
                <span />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div
        ref={overlayRef}
        id="mobile-nav-overlay"
        className={menuOpen ? "mobile-nav-overlay is-open" : "mobile-nav-overlay"}
        aria-hidden={!menuOpen}
        inert={!menuOpen}
        onKeyDown={onOverlayKeyDown}
      >
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={href(item.href)}
            className={pathname === item.href ? "mobile-nav-link active" : "mobile-nav-link"}
            onClick={() => closeMenu(false)}
          >
            {t.nav[item.key]}
          </Link>
        ))}
        <div className="mobile-nav-cta">
          <Link href={quoteHref} className="btn btn-primary" onClick={() => closeMenu(false)}>
            {t.requestQuote}
          </Link>
          <Link href={STUDIO_SIGN_UP} className="btn btn-gold" onClick={() => closeMenu(false)}>
            {t.getStarted}
          </Link>
        </div>
        <LanguageSwitch locale={locale} label={t.language} variant="menu" onNavigate={() => closeMenu(false)} />
      </div>
    </>
  );
}
