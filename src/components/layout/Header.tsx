"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import logoWhite from "@/assets/images/logo-olived-white.png";
import logoBlack from "@/assets/images/logo-olived-black.png";
import { lightHeaderRoutes, navItems } from "@/lib/site";

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  // The menu remembers the route it was opened on, so any navigation closes it.
  const [menuOpenOn, setMenuOpenOn] = useState<string | null>(null);
  const menuOpen = menuOpenOn === pathname;
  const toggleRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const isHome = pathname === "/";
  // On the home page the quote form is on the page itself.
  const quoteHref = isHome ? "#export-enquiry" : "/contact";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = useCallback((restoreFocus: boolean) => {
    setMenuOpenOn(null);
    if (restoreFocus) toggleRef.current?.focus();
  }, []);

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
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <header className={headerClass} id="site-header">
        <div className="container-wide">
          <div className="header-inner">
            <Link href="/" className="logo" aria-label="OLIVED — home">
              <Image src={logoWhite} alt="OLIVED" className="logo-light" preload />
              <Image src={logoBlack} alt="" className="logo-dark" loading="eager" />
            </Link>

            <nav className="main-nav" aria-label="Main navigation">
              {navItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={active ? "nav-item active" : "nav-item"}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="header-actions">
              <div className="lang-switch" aria-label="Language">
                <span className="lang-current" aria-current="true">
                  EN
                </span>
                <span className="lang-sep" aria-hidden="true">
                  /
                </span>
                <span className="lang-disabled" title="French version coming soon">
                  FR
                </span>
              </div>
              <Link href={quoteHref} className="btn btn-outline-light">
                Request a Quote
              </Link>
              <button
                ref={toggleRef}
                type="button"
                className={menuOpen ? "mobile-toggle is-active" : "mobile-toggle"}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                aria-controls="mobile-nav-overlay"
                onClick={() => setMenuOpenOn(menuOpen ? null : pathname)}
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
            href={item.href}
            className={pathname === item.href ? "mobile-nav-link active" : "mobile-nav-link"}
            onClick={() => closeMenu(false)}
          >
            {item.label}
          </Link>
        ))}
        <div className="mobile-nav-cta">
          <Link href={quoteHref} className="btn btn-primary" onClick={() => closeMenu(false)}>
            Request a Quote
          </Link>
        </div>
      </div>
    </>
  );
}
