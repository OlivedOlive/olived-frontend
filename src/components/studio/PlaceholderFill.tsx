"use client";

import { useState } from "react";

type Kind =
  | { kind: "month"; format: (year: string, month: string) => string }
  | { kind: "date"; format: (year: string, month: string, day: string) => string }
  | { kind: "address" }
  | { kind: "text"; numeric?: boolean };

/** Canada's bilingual month codes for "AA MO JJ" dates. */
const CANADA_MONTHS = ["JA", "FE", "MR", "AL", "MA", "JN", "JL", "AU", "SE", "OC", "NO", "DE"];
const arabicDigits = (text: string) => text.replace(/\d/g, (d) => String.fromCharCode(0x0660 + Number(d)));

/** What a template placeholder asks for, read from its wording. */
function kindOf(placeholder: string): Kind {
  const inner = placeholder.slice(1, -1).trim();
  if (/^MM\/(YYYY|JJJJ|AAAA)$/i.test(inner)) return { kind: "month", format: (y, m) => `${m}/${y}` };
  if (/^MM\/DD\/YYYY$/i.test(inner)) return { kind: "date", format: (y, m, d) => `${m}/${d}/${y}` };
  if (/^DD\/MM\/YYYY$/i.test(inner) || /^date$/i.test(inner)) return { kind: "date", format: (y, m, d) => `${d}/${m}/${y}` };
  if (inner === "ДД.ММ.ГГГГ") return { kind: "date", format: (y, m, d) => `${d}.${m}.${y}` };
  if (/^YYYY\.MM\.DD$/i.test(inner)) return { kind: "date", format: (y, m, d) => `${y}.${m}.${d}` };
  if (inner === "西元年/月/日") return { kind: "date", format: (y, m, d) => `${y}/${m}/${d}` };
  if (inner === "يوم/شهر/سنة") return { kind: "date", format: (y, m, d) => arabicDigits(`${d}/${m}/${y}`) };
  if (/^AA MO JJ$/i.test(inner)) return { kind: "date", format: (y, m, d) => `${y.slice(2)} ${CANADA_MONTHS[Number(m) - 1]} ${d}` };
  if (/import|anschrift|adress|address|مستورد|輸入者|進口商|상호|импорт/i.test(inner)) return { kind: "address" };
  if (/gtin|barcode/i.test(inner)) return { kind: "text", numeric: true };
  return { kind: "text" };
}

/** The [placeholders] still in a text, in order, each once. */
export const placeholdersIn = (text: string) => [...new Set(text.match(/\[[^\]]+\]/g) ?? [])];

/**
 * One fill-in box per [placeholder] left in a field: a date picker for dates, a box for codes and
 * addresses. Filling one in puts the value in the text, in the format the template shows. The first box
 * has the id `fill-<idKey>`, so a check can jump straight to it.
 */
export function PlaceholderFill({ text, idKey, onChange }: { text: string; idKey: string; onChange: (text: string) => void }) {
  const items = placeholdersIn(text);
  if (!items.length) return null;
  return (
    <span className="studio-fill" aria-label="Fill in the placeholders">
      <span className="studio-fill-title">Fill in</span>
      {items.map((placeholder, index) => (
        <FillRow key={placeholder} placeholder={placeholder} id={index === 0 ? `fill-${idKey}` : undefined}
          onApply={(value) => onChange(text.replace(placeholder, value))} />
      ))}
    </span>
  );
}

function FillRow({ placeholder, id, onApply }: { placeholder: string; id?: string; onApply: (value: string) => void }) {
  const kind = kindOf(placeholder);
  const [value, setValue] = useState("");
  const label = placeholder.slice(1, -1);
  const apply = () => {
    const v = value.trim();
    if (!v) return;
    if (kind.kind === "month") {
      const [y, m] = v.split("-");
      if (y && m) onApply(kind.format(y, m));
    } else if (kind.kind === "date") {
      const [y, m, d] = v.split("-");
      if (y && m && d) onApply(kind.format(y, m, d));
    } else {
      onApply(v);
    }
  };
  const keys = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (kind.kind !== "address" || e.ctrlKey || e.metaKey)) { e.preventDefault(); apply(); }
  };
  return (
    <span className="studio-fill-row">
      <span className="studio-fill-label">{label}</span>
      <span className="studio-fill-input">
        {kind.kind === "address" ? (
          <textarea id={id} className="input py-1.5 text-sm" rows={3} value={value} placeholder="Company name, street, postcode, city, country"
            onChange={(e) => setValue(e.target.value)} onKeyDown={keys} />
        ) : (
          <input id={id} className="input min-h-9 px-2 text-sm" value={value}
            type={kind.kind === "month" ? "month" : kind.kind === "date" ? "date" : "text"}
            inputMode={kind.kind === "text" && kind.numeric ? "numeric" : undefined}
            placeholder={kind.kind === "text" ? (label.includes("XXXXX") ? "e.g. L2611A" : label) : undefined}
            onChange={(e) => setValue(e.target.value)} onKeyDown={keys} />
        )}
        <button type="button" className="studio-place" disabled={!value.trim()} onClick={(e) => { e.preventDefault(); apply(); }}>Put in</button>
      </span>
    </span>
  );
}
