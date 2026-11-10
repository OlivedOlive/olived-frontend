/** Placeholder shown while studio data streams in from the API. */
export function Loading({ label = "Loading…", lines = 3 }: { label?: string; lines?: number }) {
  return (
    <div role="status" aria-live="polite" className="grid gap-3">
      <span className="sr-only">{label}</span>
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} aria-hidden className="h-16 animate-pulse border border-line bg-white" />
      ))}
    </div>
  );
}
