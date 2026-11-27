"use client";

import { useEffect, useRef, useState } from "react";
import { requestField } from "@/lib/studio/focus-field";
import { postJson } from "@/lib/studio/post";
import type { CheckResult, DesignContent } from "@/lib/studio/types";

const ORDER: CheckResult["status"][] = ["error", "warning", "unverified", "pass"];
const ICON: Record<CheckResult["status"], string> = { error: "✕", warning: "!", unverified: "?", pass: "✓" };
const TONE: Record<CheckResult["status"], string> = {
  error: "text-danger", warning: "text-gold", unverified: "text-mid", pass: "text-success",
};
/** How long a check that was just fixed stays in the open list, marked "Fixed". */
const FIXED_MS = 4000;
/**
 * A stable key for each result. A market can have two checks with the same name on the same field (a
 * required text and its wording, for example), so repeats are numbered in the order the server sends them.
 */
type Keyed = CheckResult & { key: string };
function withKeys(results: CheckResult[]): Keyed[] {
  const seen = new Map<string, number>();
  return results.map((result) => {
    const base = `${result.label}|${result.field ?? ""}`;
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    return { ...result, key: n ? `${base}|${n}` : base };
  });
}

/**
 * The market's checks, run on the unsaved design as the client types. Clicking a check that names a
 * field opens the step that edits it and selects the text to replace. A check fixed while typing turns
 * green and stays in view for a moment, so the client sees it pass.
 */
export function MarketChecklist({ designId, content, only, onField, onResults, onPlace, onTextSize, title }: {
  designId: string;
  content: DesignContent;
  /** Show only the checks of these fields (and the layout checks, which name no field). */
  only?: string[];
  /** Opens the step where a field is edited; the field then gets the focus. */
  onField?: (key: string) => void;
  /** Every result of the latest run, for messages next to the fields. */
  onResults?: (results: CheckResult[]) => void;
  /** Puts fields that have text but no block back on the label. */
  onPlace?: (fields: string[]) => void;
  /** Enlarges the blocks that are too small, to the size each needs. */
  onTextSize?: (sizes: Record<string, number>) => void;
  title?: string;
}) {
  const [raw, setResults] = useState<CheckResult[] | null>(null);
  // The content the shown results belong to: while it differs from the current one, a check is on its way.
  const [checkedFor, setCheckedFor] = useState<DesignContent | null>(null);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  const [fixed, setFixed] = useState<Record<string, number>>({});
  const previous = useRef<Map<string, CheckResult["status"]>>(new Map());
  const report = useRef(onResults);
  useEffect(() => { report.current = onResults; });

  useEffect(() => {
    let current = true;
    let again: ReturnType<typeof setTimeout> | undefined;
    const timer = setTimeout(() => {
      void postJson<{ results: CheckResult[] }>(`/designs/${encodeURIComponent(designId)}/check`, { content }).then((result) => {
        if (!current) return;
        setFailed(!result.ok);
        if (!result.ok) {
          // A lost connection or a busy server: try again shortly rather than show stale results as current.
          again = setTimeout(() => setRetry((n) => n + 1), 3000);
          return;
        }
        const now = Date.now();
        const keyed = withKeys(result.data.results);
        const newlyFixed = keyed.filter((r) => r.status === "pass" && previous.current.has(r.key) && previous.current.get(r.key) !== "pass");
        previous.current = new Map(keyed.map((r) => [r.key, r.status]));
        if (newlyFixed.length) setFixed((list) => ({ ...list, ...Object.fromEntries(newlyFixed.map((r) => [r.key, now])) }));
        setResults(result.data.results);
        setCheckedFor(content);
        report.current?.(result.data.results);
      });
    }, 450);
    return () => {
      current = false;
      clearTimeout(timer);
      clearTimeout(again);
    };
  }, [designId, content, retry]);

  // "Fixed" marks fade after a few seconds.
  useEffect(() => {
    const keys = Object.keys(fixed);
    if (!keys.length) return;
    const timer = setTimeout(() => {
      const now = Date.now();
      setFixed((list) => Object.fromEntries(Object.entries(list).filter(([, at]) => now - at < FIXED_MS)));
    }, FIXED_MS);
    return () => clearTimeout(timer);
  }, [fixed]);

  // Keys are worked out when drawing, from the results as the server sent them.
  const all = raw && withKeys(raw);
  const results = all && only ? all.filter((r) => !r.field || only.includes(r.field)) : all;
  if (!results) return <p className="text-sm text-mid">{failed ? "The checks could not run. Trying again…" : "Checking…"}</p>;

  const checking = checkedFor !== content;
  const sorted = [...results].sort((a, b) => ORDER.indexOf(a.status) - ORDER.indexOf(b.status));
  const count = (status: CheckResult["status"]) => results.filter((r) => r.status === status).length;
  const isFixed = (result: Keyed) => result.status === "pass" && result.key in fixed;
  const missing = onPlace ? [...new Set(results.filter((r) => r.code === "notPlaced" && r.field).map((r) => r.field!))] : [];
  const focus = (field?: string) => {
    if (!field) return;
    onField?.(field);
    requestField(field);
  };

  return (
    <div className="grid gap-2" aria-live="polite">
      <p className="text-sm font-medium">
        {title && <span className="block">{title}</span>}
        {count("error") === 0 ? (only ? "Nothing to fix here" : "Ready to submit") : `${count("error")} to fix`}
        <span className="font-normal text-mid">
          {" "}· {count("pass")} passed{count("warning") ? ` · ${count("warning")} to confirm` : ""}
          {count("unverified") ? ` · ${count("unverified")} pending supplier data` : ""}
        </span>
        <span className={`studio-checking ${checking || failed ? "" : "studio-checking-idle"}`} aria-hidden={!checking && !failed}>
          {failed ? "Could not re-check, trying again…" : checking ? "Checking your changes…" : "Up to date"}
        </span>
      </p>
      {missing.length > 1 && (
        <button type="button" className="studio-place-all" onClick={() => onPlace!(missing)}>
          ＋ Add all {missing.length} missing to the label
        </button>
      )}
      {[sorted.filter((r) => r.status !== "pass" || isFixed(r)), sorted.filter((r) => r.status === "pass" && !isFixed(r))].map((group, n) => {
        if (!group.length) return null;
        const list = (
          <ul className="grid gap-1.5">
            {group.map((result) => (
              <li key={result.key} className="studio-check-row">
                <button type="button" disabled={!result.field} onClick={() => focus(result.field)}
                  title={result.field && result.status !== "pass" ? "Go to this text and fix it" : undefined}
                  className={`studio-check flex w-full gap-2 rounded-lg px-2 py-1 text-left text-sm enabled:cursor-pointer enabled:hover:bg-sand ${isFixed(result) ? "studio-check-fixed" : ""}`}>
                  <span aria-hidden="true" className={`w-4 shrink-0 font-semibold ${TONE[result.status]}`}>{ICON[result.status]}</span>
                  <span className="min-w-0 flex-1">
                    <span className="font-medium">{result.label}</span>
                    {isFixed(result) && <span className="studio-fixed-tag">Fixed</span>}
                    {result.status !== "pass" && result.message && <span className="block text-mid">{result.message}</span>}
                  </span>
                  {result.field && result.status !== "pass" && !result.code && <span aria-hidden="true" className="studio-check-go">Fix →</span>}
                </button>
                {onTextSize && result.code === "textSize" && result.sizes && (
                  <button type="button" className="studio-place" onClick={() => onTextSize(result.sizes!)}
                    title="Enlarge every block in this list to the size it needs">
                    Make the text big enough
                  </button>
                )}
                {onPlace && result.code === "notPlaced" && result.field && (
                  <button type="button" className="studio-place" onClick={() => onPlace([result.field!])} title={`Put ${result.label} back on the label`}>
                    ＋ Add to label
                  </button>
                )}
              </li>
            ))}
          </ul>
        );
        // Passed checks are folded away, so the list shows what still needs attention.
        return n === 0 ? <div key="open">{list}</div> : (
          <details key="passed">
            <summary className="cursor-pointer px-2 text-sm text-success">✓ {group.length} check{group.length > 1 ? "s" : ""} passed</summary>
            <div className="mt-1">{list}</div>
          </details>
        );
      })}
    </div>
  );
}
