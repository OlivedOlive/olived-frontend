"use client";

import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const media = () => window.matchMedia("(prefers-color-scheme: dark)");

/** The theme in effect: an explicit choice on <html data-theme>, otherwise the device setting. */
function readTheme(): Theme {
  const set = document.documentElement.getAttribute("data-theme");
  if (set === "dark" || set === "light") return set;
  return media().matches ? "dark" : "light";
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  const mq = media();
  mq.addEventListener("change", onChange);
  return () => {
    observer.disconnect();
    mq.removeEventListener("change", onChange);
  };
}

const serverTheme = (): Theme => "light";

export function ThemeToggle({ toDark, toLight }: { toDark: string; toLight: string }) {
  // The server cannot know the theme, so it renders "light"; React re-renders after hydration.
  const theme = useSyncExternalStore(subscribe, readTheme, serverTheme);
  const next: Theme = theme === "dark" ? "light" : "dark";
  const label = next === "dark" ? toDark : toLight;

  const toggle = () => {
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Private mode: the choice simply is not remembered.
    }
  };

  return (
    <button type="button" className="theme-toggle" onClick={toggle} aria-label={label} title={label}>
      {/* Both icons render; CSS shows the one matching the current theme, so there is no flash. */}
      <svg className="theme-icon-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      <svg className="theme-icon-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}
