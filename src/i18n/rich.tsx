import { Fragment, type ReactNode } from "react";

/**
 * Renders the light markup used in dictionary strings:
 * **bold**, *italic* and a newline for a line break.
 */
export function rich(text: string): ReactNode {
  return text.split("\n").map((line, li) => (
    <Fragment key={li}>
      {li > 0 && <br />}
      {line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, pi) => {
        if (part.startsWith("**") && part.endsWith("**")) return <strong key={pi}>{part.slice(2, -2)}</strong>;
        if (part.startsWith("*") && part.endsWith("*") && part.length > 2) return <em key={pi}>{part.slice(1, -1)}</em>;
        return part;
      })}
    </Fragment>
  ));
}
