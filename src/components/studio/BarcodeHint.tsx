import {
  defaultBarHeight, MIN_MAGNIFICATION, MODULE_MM, moduleFor, nominalBarHeight, readBarcode, symbolModules,
} from "@/lib/studio/barcode";

/**
 * What the barcode text gives on the label: the barcode drawn and its print size, or what to change.
 * `widthMm` is the space the block offers, when it is on the label.
 */
export function BarcodeHint({ text, widthMm, barHeight }: { text: string; widthMm?: number; barHeight?: number }) {
  const status = readBarcode(text);
  if (!status.ok) {
    const message = status.reason === "checkDigit"
      ? `This number does not scan: the last digit should be ${status.expected}. Check it against your GS1 number.`
      : status.reason === "length"
        ? "Type the full number: 13 digits (EAN-13), 12 for the US and Canada (UPC-A), or 8 (EAN-8)."
        : "Type the GTIN from GS1 (13 digits, or 12 for the US and Canada) and the barcode is drawn on the label.";
    return <span className={`studio-barcode-hint ${status.reason === "none" ? "" : "studio-barcode-bad"}`}>{message}</span>;
  }
  const { barcode } = status;
  if (widthMm === undefined) return <span className="studio-barcode-hint studio-barcode-good">✓ {barcode.kind} barcode drawn on the label.</span>;
  const moduleMm = moduleFor(barcode, widthMm);
  const percent = Math.round((moduleMm / MODULE_MM) * 100);
  const bar = barHeight ?? defaultBarHeight(barcode, moduleMm);
  const small = moduleMm < MODULE_MM * MIN_MAGNIFICATION - 1e-6;
  const short = bar < nominalBarHeight(barcode, moduleMm) * .5 - .05;
  const minimum = Math.ceil(symbolModules(barcode) * MODULE_MM * MIN_MAGNIFICATION);
  return (
    <span className={`studio-barcode-hint ${small ? "studio-barcode-bad" : short ? "" : "studio-barcode-good"}`}>
      {small
        ? `${barcode.kind} at ${percent}%: below the GS1 minimum of 80%, tills may not read it. Make the block at least ${minimum} mm wide.`
        : `✓ ${barcode.kind} at ${percent}% (${moduleMm.toFixed(2)} mm bars), ${bar.toFixed(1)} mm high.`}
      {!small && short && " The bars are shorter than half the GS1 height: test a print with the retailer's scanner."}
    </span>
  );
}
