"use client";

import { useState } from "react";

/** Brand and label colours offered as one-click swatches. */
export const BASE_SWATCHES = ["#000000", "#ffffff", "#243b2b", "#3f5f2f", "#7d9a4f", "#f2e8d9", "#a07a3c", "#d8b461", "#f65318", "#9b2f2f"];

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** "#abc", "abc", "#aabbcc" or "aabbcc" as "#aabbcc"; anything else as null. */
export function normaliseHex(text: string) {
  const match = HEX.exec(text.trim());
  if (!match) return null;
  const digits = match[1]!.length === 3 ? [...match[1]!].map((c) => c + c).join("") : match[1]!;
  return `#${digits.toLowerCase()}`;
}

export const toRgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];
export const fromRgb = (rgb: number[]) => `#${rgb.map((v) => Math.max(0, Math.min(255, Math.round(v || 0))).toString(16).padStart(2, "0")).join("")}`;

/**
 * A colour, set with the picker, typed as HEX (#1c1a16) or as RGB (28, 26, 22), or chosen from swatches.
 * Typing only applies once the value is a complete colour, so a half-typed code never breaks the label.
 */
export function ColorField({ label, value, onChange, clearable = false, swatches = [], compact = false }: {
  label: string;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  /** Offers "none", for fills and outlines. */
  clearable?: boolean;
  /** The design's own colours, shown before the base swatches. */
  swatches?: string[];
  compact?: boolean;
}) {
  const [mode, setMode] = useState<"hex" | "rgb">("hex");
  // What is being typed; otherwise the fields show the current colour, so changes made elsewhere
  // (picker, swatches, undo) always show.
  const [typedHex, setTypedHex] = useState<string | null>(null);
  const [typedRgb, setTypedRgb] = useState<string[] | null>(null);
  const text = typedHex ?? value ?? "";
  const rgb = typedRgb ?? (value ? toRgb(value).map(String) : ["", "", ""]);

  const list = [...new Set([...swatches.filter(Boolean).map((s) => s.toLowerCase()), ...BASE_SWATCHES])].slice(0, compact ? 10 : 14);

  return (
    <div className="studio-color grid gap-1.5" role="group" aria-label={label}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium">{label}</span>
        <span className="studio-color-modes" role="radiogroup" aria-label={`${label} format`}>
          {(["hex", "rgb"] as const).map((m) => (
            <button key={m} type="button" role="radio" aria-checked={mode === m} onClick={() => setMode(m)}>{m.toUpperCase()}</button>
          ))}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <label className="studio-color-chip" style={{ background: value ?? "transparent" }} title="Open the colour picker">
          <input type="color" className="sr-only" value={value ?? "#ffffff"} aria-label={`${label}: picker`}
            onChange={(e) => onChange(e.target.value.toLowerCase())} />
          {!value && <span aria-hidden="true">∅</span>}
        </label>
        {mode === "hex" ? (
          <input className="input min-h-9 px-2 font-mono text-xs uppercase" value={text} maxLength={7} spellCheck={false}
            placeholder={clearable ? "None" : "#000000"} aria-label={`${label}: HEX code`}
            onChange={(e) => {
              setTypedHex(e.target.value);
              const hex = normaliseHex(e.target.value);
              if (hex) onChange(hex);
              else if (!e.target.value.trim() && clearable) onChange(undefined);
            }}
            onBlur={() => setTypedHex(null)} />
        ) : (
          <div className="grid flex-1 grid-cols-3 gap-1" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setTypedRgb(null); }}>
            {(["R", "G", "B"] as const).map((channel, index) => (
              <label key={channel} className="studio-color-channel">
                <span>{channel}</span>
                <input type="number" min={0} max={255} step={1} className="input min-h-9 px-1.5 text-xs" value={rgb[index]}
                  aria-label={`${label}: ${channel === "R" ? "red" : channel === "G" ? "green" : "blue"} (0 to 255)`}
                  onChange={(e) => {
                    const next = rgb.map((v, n) => (n === index ? e.target.value : v));
                    setTypedRgb(next);
                    if (next.every((v) => v !== "" && Number(v) >= 0 && Number(v) <= 255)) onChange(fromRgb(next.map(Number)));
                  }} />
              </label>
            ))}
          </div>
        )}
        {clearable && value && (
          <button type="button" className="le-tool le-mini" onClick={() => onChange(undefined)} aria-label={`Remove ${label}`} title="None">×</button>
        )}
      </div>
      <div className="studio-swatches" aria-label={`${label}: swatches`}>
        {list.map((swatch) => (
          <button key={swatch} type="button" style={{ background: swatch }} aria-pressed={swatch === value}
            title={swatch.toUpperCase()} aria-label={`Use ${swatch.toUpperCase()}`} onClick={() => onChange(swatch)} />
        ))}
      </div>
    </div>
  );
}
