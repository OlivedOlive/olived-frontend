"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export interface BulkPrefillValues {
  oilCategory: string;
  organicPreference: string;
  format: string;
}

interface BulkPrefillContextValue {
  values: BulkPrefillValues;
  set: (patch: Partial<BulkPrefillValues>) => void;
}

const BulkPrefillContext = createContext<BulkPrefillContextValue | null>(null);

const EMPTY: BulkPrefillValues = { oilCategory: "", organicPreference: "", format: "" };

/** Lets "Request This Oil" / "Ask About This Format" buttons pre-select fields in the bulk form. */
export function BulkPrefillProvider({ children }: { children: ReactNode }) {
  const [values, setValues] = useState(EMPTY);
  return (
    <BulkPrefillContext value={{ values, set: (patch) => setValues((v) => ({ ...v, ...patch })) }}>
      {children}
    </BulkPrefillContext>
  );
}

export function useBulkPrefill() {
  return useContext(BulkPrefillContext);
}

/** An anchor to the bulk form that also pre-fills it. */
export function PrefillLink({
  prefill,
  className,
  children,
}: {
  prefill: Partial<BulkPrefillValues>;
  className?: string;
  children: ReactNode;
}) {
  const ctx = useBulkPrefill();
  return (
    <a href="#bulk-request-form" className={className} onClick={() => ctx?.set(prefill)}>
      {children}
    </a>
  );
}
