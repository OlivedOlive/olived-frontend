"use client";

/**
 * An inline script that runs once from the server HTML (before first paint) and is
 * inert on the client. Must be a Client Component: the type has to differ between the
 * server render ("text/javascript") and the client render ("text/plain"), otherwise React
 * warns about rendering a <script>. Pattern from the Next.js "preventing flash" guide.
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
