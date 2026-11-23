"use client";

import { useEffect, useState } from "react";
import { postJson } from "@/lib/studio/post";
import type { CheckResult, DesignContent } from "@/lib/studio/types";

const ORDER: CheckResult["status"][] = ["error", "warning", "unverified", "pass"];
const ICON: Record<CheckResult["status"], string> = { error: "✕", warning: "!", unverified: "?", pass: "✓" };
const TONE: Record<CheckResult["status"], string> = {
  error: "text-danger", warning: "text-gold", unverified: "text-mid", pass: "text-success",
};

/**
 * The market's checks, run on the unsaved design as the client types. Clicking a check that names a
 * field moves to that field.
 */
export function MarketChecklist({ designId, content }: { designId: string; content: DesignContent }) {
  const [results, setResults] = useState<CheckResult[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let current = true;
    const timer = setTimeout(() => {
      void postJson<{ results: CheckResult[] }>(`/designs/${encodeURIComponent(designId)}/check`, { content }).then((result) => {
        if (!current) return;
        setFailed(!result.ok);
        if (result.ok) setResults(result.data.results);
      });
    }, 450);
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [designId, content]);

  if (!results) return <p className="text-sm text-mid">{failed ? "The checks could not run. Try again in a moment." : "Checking…"}</p>;

  const sorted = [...results].sort((a, b) => ORDER.indexOf(a.status) - ORDER.indexOf(b.status));
  const count = (status: CheckResult["status"]) => results.filter((r) => r.status === status).length;
  const focus = (field?: string) => field && document.getElementById(`field-${field}`)?.focus();

  return (
    <div className="grid gap-2" aria-live="polite">
      <p className="text-sm font-medium">
        {count("error") === 0 ? "Ready to submit" : `${count("error")} to fix`}
        <span className="font-normal text-mid">
          {" "}· {count("pass")} passed{count("warning") ? ` · ${count("warning")} to confirm` : ""}
          {count("unverified") ? ` · ${count("unverified")} pending supplier data` : ""}
        </span>
      </p>
      <ul className="grid gap-1.5">
        {sorted.map((result, index) => (
          <li key={index}>
            <button type="button" disabled={!result.field} onClick={() => focus(result.field)}
              className="flex w-full gap-2 rounded-lg px-2 py-1 text-left text-sm enabled:cursor-pointer enabled:hover:bg-sand">
              <span aria-hidden="true" className={`w-4 shrink-0 font-semibold ${TONE[result.status]}`}>{ICON[result.status]}</span>
              <span>
                <span className="font-medium">{result.label}</span>
                {result.status !== "pass" && result.message && <span className="block text-mid">{result.message}</span>}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
