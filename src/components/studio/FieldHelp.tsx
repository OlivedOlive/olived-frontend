"use client";

import { FIELD_GUIDES, SIDE_NAMES, STEP_GUIDES } from "@/lib/studio/field-guides";

/**
 * The "?" guide of one label field: where it goes, what it is, how to write it for this market, whether the
 * market requires it, what can be changed, and the market template's wording to start from.
 */
export function FieldHelp({ field, label, market, required, templateText, current, onUseTemplate }: {
  field: string;
  label: string;
  market: { code: string; name: string };
  required: boolean;
  /** The market template's wording for this field. */
  templateText?: string;
  current?: string;
  onUseTemplate?: (text: string) => void;
}) {
  const guide = FIELD_GUIDES[field];
  if (!guide) return null;
  const note = guide.markets?.[market.code];
  return (
    <details className="studio-field-help" onClick={(e) => e.stopPropagation()}>
      <summary aria-label={`Guide: ${label}`} title={`How to fill in ${label}`}>?</summary>
      <div className="studio-field-help-body">
        <div className="flex flex-wrap gap-1.5">
          <span className="studio-field-side" data-side={guide.side}>{SIDE_NAMES[guide.side]}</span>
          <span className={`studio-field-need ${required ? "studio-field-need-yes" : ""}`}>
            {required ? `Required for ${market.name}` : "Optional"}
          </span>
        </div>
        <p>{guide.what}</p>
        <ul>{guide.how.map((line) => <li key={line}>{line}</li>)}</ul>
        {note && <p className="studio-field-note"><strong>{market.name}:</strong> {note}</p>}
        {guide.edit && <p className="studio-field-edit"><strong>You can change:</strong> {guide.edit}</p>}
        {templateText && (
          <div className="studio-field-template">
            <span>{market.name} template wording</span>
            <q>{templateText}</q>
            {onUseTemplate && templateText !== current && (
              <button type="button" className="studio-place" onClick={(e) => { e.preventDefault(); onUseTemplate(templateText); }}>
                Use this wording
              </button>
            )}
          </div>
        )}
      </div>
    </details>
  );
}

/** What a step's label sides hold, and what the client can change there. */
export function StepGuide({ step }: { step: "front" | "sides" }) {
  const guide = STEP_GUIDES[step];
  return (
    <details className="studio-step-guide">
      <summary>{guide.title}</summary>
      <div className="studio-step-guide-body">
        <span className="ws-section-title">On this side</span>
        <ul>{guide.holds.map((line) => <li key={line}>{line}</li>)}</ul>
        <span className="ws-section-title">What you can change</span>
        <ul>{guide.edit.map((line) => <li key={line}>{line}</li>)}</ul>
        <p className="text-mid">Open the <strong>?</strong> next to a field for what to write in it.</p>
      </div>
    </details>
  );
}
