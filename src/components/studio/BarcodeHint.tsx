"use client";

import {
  defaultBarHeight, gs1Office, hasPlaceholder, marketBarcode, MIN_MAGNIFICATION, MODULE_MM, moduleFor, nominalBarHeight,
  readBarcode, symbolModules, typedDigits, withCheckDigit,
} from "@/lib/studio/barcode";

/** GS1's own page to find the GS1 office of each country. */
const GS1_OFFICES_URL = "https://www.gs1.org/contact";

/**
 * Help under the barcode text: what the label shows, which GS1 office the number comes from, one-click fixes
 * (a missing check digit, leftover placeholder text) and a guide to getting the right number for the market.
 * `widthMm` is the space the block offers, when it is on the label.
 */
export function BarcodeHint({ text, widthMm, barHeight, market, olivedBrand = false, onChange }: {
  text: string;
  widthMm?: number;
  barHeight?: number;
  market?: { code: string; name: string };
  /** ORZETA and Oussoul: numbers come from OLIVED's GS1 Tunisia membership. */
  olivedBrand?: boolean;
  onChange?: (text: string) => void;
}) {
  const status = readBarcode(text);
  const digits = typedDigits(text);
  const expected = market ? marketBarcode(market.code) : null;
  const placeholderLeft = hasPlaceholder(text) && digits.length >= 6;

  // What the label shows.
  let line: { tone: "good" | "bad" | ""; text: string };
  if (!status.ok) {
    line = status.reason === "checkDigit"
      ? { tone: "bad", text: `Not drawn: this number does not scan. With these first digits, the last one should be ${status.expected}. Check the number GS1 gave you; changing the last digit may give someone else's number.` }
      : status.reason === "length"
        ? { tone: "bad", text: `Not drawn: ${digits.length} digits typed. A retail barcode has 13 digits (EAN-13), 12 in the US and Canada (UPC-A), or 8 (EAN-8).` }
        : { tone: "", text: `Type the barcode number (GTIN) and the barcode is drawn on the label.` };
  } else if (widthMm === undefined) {
    line = { tone: "good", text: `✓ ${status.barcode.kind} barcode drawn on the label.` };
  } else {
    const barcode = status.barcode;
    const moduleMm = moduleFor(barcode, widthMm);
    const percent = Math.round((moduleMm / MODULE_MM) * 100);
    const bar = barHeight ?? defaultBarHeight(barcode, moduleMm);
    const small = moduleMm < MODULE_MM * MIN_MAGNIFICATION - 1e-6;
    const short = bar < nominalBarHeight(barcode, moduleMm) * .5 - .05;
    line = small
      ? { tone: "bad", text: `${barcode.kind} at ${percent}%: below the GS1 minimum of 80%, tills may not read it. Make the block at least ${Math.ceil(symbolModules(barcode) * MODULE_MM * MIN_MAGNIFICATION)} mm wide.` }
      : { tone: short ? "" : "good", text: `✓ ${barcode.kind} at ${percent}% (${moduleMm.toFixed(2)} mm bars), ${bar.toFixed(1)} mm high.${short ? " The bars are shorter than half the GS1 height: test a print with the retailer's scanner." : ""}` };
  }

  // Where the number comes from.
  const office = digits.length >= 3 ? gs1Office(status.ok ? status.barcode.digits : digits) : null;
  const wrongBrand = olivedBrand && office && office.prefix !== "619" && status.ok;
  const kindMismatch = status.ok && expected && status.barcode.kind !== "EAN-8" && status.barcode.kind !== expected.kind && expected.kind === "EAN-13";

  // One-click fixes.
  const fixes: { label: string; value: string }[] = [];
  if (!status.ok && digits.length === 12 && expected?.kind !== "UPC-A") {
    fixes.push({ label: `Add the check digit: ${withCheckDigit(digits)}`, value: withCheckDigit(digits) });
  }
  if (!status.ok && digits.length === 11 && expected?.kind === "UPC-A") {
    fixes.push({ label: `Add the check digit: ${withCheckDigit(digits)}`, value: withCheckDigit(digits) });
  }
  if (placeholderLeft) fixes.push({ label: "Remove the [placeholder] text", value: digits });

  return (
    <span className="studio-barcode-help">
      <span className={`studio-barcode-hint ${line.tone === "good" ? "studio-barcode-good" : line.tone === "bad" ? "studio-barcode-bad" : ""}`}>{line.text}</span>
      {office && (
        <span className="studio-barcode-office">
          Prefix <strong>{office.prefix}</strong>
          {office.restricted ? " · a restricted (in-store) number: it is not unique outside one shop, so do not print it on retail packaging."
            : office.office ? ` · issued through ${office.office}` : " · GS1 office not in the Studio's list"}
        </span>
      )}
      {wrongBrand && (
        <span className="studio-barcode-hint studio-barcode-bad">
          ORZETA and Oussoul numbers come from OLIVED&apos;s GS1 Tunisia membership and start with 619. Ask the OLIVED team for this product&apos;s number.
        </span>
      )}
      {kindMismatch && (
        <span className="studio-barcode-hint">This is a UPC-A (12 digits). Retailers in {market!.name} usually expect an EAN-13; check with your importer.</span>
      )}
      {onChange && fixes.length > 0 && (
        <span className="flex flex-wrap gap-1.5">
          {fixes.map((fix) => (
            <button key={fix.label} type="button" className="studio-place" onClick={(e) => { e.preventDefault(); onChange(fix.value); }}>{fix.label}</button>
          ))}
        </span>
      )}
      {market && <BarcodeGuide market={market} olivedBrand={olivedBrand} open={!status.ok && digits.length < 6} />}
    </span>
  );
}

/** How to get the right barcode number for the design's market and brand, step by step. */
function BarcodeGuide({ market, olivedBrand, open }: { market: { code: string; name: string }; olivedBrand: boolean; open: boolean }) {
  const expected = marketBarcode(market.code);
  return (
    <details className="studio-barcode-guide" open={open}>
      <summary>How to get the right barcode for {market.name}</summary>
      <ol>
        <li>
          <strong>Barcode type: {expected.kind}</strong> ({expected.kind === "UPC-A" ? "12" : "13"} digits). {expected.note}
        </li>
        {olivedBrand ? (
          <li>
            <strong>Who gives the number: OLIVED.</strong> ORZETA and Oussoul are OLIVED&apos;s brands, so their barcodes come from
            OLIVED&apos;s GS1 Tunisia membership and start with <strong>619</strong>. Ask the OLIVED team for the number of this
            product and bottle size; do not make one up.
          </li>
        ) : (
          <li>
            <strong>Who gives the number: GS1, to the brand owner.</strong> For a private label, the company that owns the brand
            (usually you, the importer) joins the GS1 office of its own country and receives a company prefix. The first digits
            show that GS1 office, not the country of sale: a German importer selling in Kuwait uses its GS1 Germany number.
            {" "}<a href={GS1_OFFICES_URL} target="_blank" rel="noreferrer">Find your GS1 office</a>.
          </li>
        )}
        <li>
          <strong>One number per product.</strong> Each bottle size, and each different product, needs its own number. Never
          reuse one number for two products.
        </li>
        <li>
          <strong>Type the full number here.</strong> GS1 numbers end with a check digit; the Studio checks it and only draws a
          barcode that will scan. If you have the number without its last digit, the Studio offers to add it.
        </li>
        <li>
          <strong>Test before printing.</strong> Scan a printed proof with a phone or the retailer&apos;s scanner.
        </li>
      </ol>
    </details>
  );
}
