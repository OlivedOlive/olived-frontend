import Link from "next/link";
import type { ReactNode } from "react";

/** The two-part pill that opens every section: a number chip and a label. */
export function Tag({ n, children, light }: { n: number; children: ReactNode; light?: boolean }) {
  return (
    <p className={light ? "ld-tag ld-tag-light" : "ld-tag"} data-rv>
      <span>{String(n).padStart(2, "0")}</span>
      <span>{children}</span>
    </p>
  );
}

/** A button in two pieces: the label box and a separate square arrow box. */
export function SplitButton({ href, children, light }: { href: string; children: ReactNode; light?: boolean }) {
  const className = light ? "ld-btn ld-btn-light" : "ld-btn";
  const content = (
    <>
      <span>{children}</span>
      <i aria-hidden="true">→</i>
    </>
  );
  // In-page anchors stay plain links so the smooth scroll can take them.
  return href.startsWith("#") ? (
    <a href={href} className={className}>
      {content}
    </a>
  ) : (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}

/** A heading whose lines slide up one after the other. The second line can be greyer. */
export function Lines({ lines, as: As = "h2", soft }: { lines: string[]; as?: "h1" | "h2"; soft?: boolean }) {
  return (
    <As className={soft ? "ld-lines ld-lines-soft" : "ld-lines"}>
      {lines.map((line) => (
        <span className="ld-line" key={line}>
          <span>{line}</span>
        </span>
      ))}
    </As>
  );
}

export const icons = {
  plus: (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M8 3v10M3 8h10" />
    </svg>
  ),
  leaf: (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3 13c0-6 4-10 10-10 0 6-4 10-10 10zM3 13l5-5" />
    </svg>
  ),
  doc: (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M4 2h5l3 3v9H4zM9 2v3h3M6 8h4M6 11h4" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3 8.5l3.2 3.2L13 5" />
    </svg>
  ),
  scale: (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M2 13h12M4 13V8M8 13V4M12 13V6" />
    </svg>
  ),
  globe: (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="5.5" />
      <path d="M2.5 8h11M8 2.5c2 2 2 9 0 11M8 2.5c-2 2-2 9 0 11" />
    </svg>
  ),
};
