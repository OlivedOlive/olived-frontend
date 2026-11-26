"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AssetLibrary } from "@/components/studio/AssetLibrary";
import { BarcodeHint } from "@/components/studio/BarcodeHint";
import { LabelEditor } from "@/components/studio/LabelEditor";
import { MarketChecklist } from "@/components/studio/MarketChecklist";
import { PackagingPreview, PARTS } from "@/components/studio/PackagingPreview";
import { Steps, type ProjectStep } from "@/components/studio/Steps";
import { defaultPanel, fillCopy, getPackaging } from "@/lib/studio/label-artwork";
import { requestField } from "@/lib/studio/focus-field";
import { fitLayout, layoutOf, placeFields } from "@/lib/studio/layout";
import { postJson } from "@/lib/studio/post";
import type { Artwork, CheckResult, DesignContent, DesignDetail, PackagePart, Panel, PanelFace } from "@/lib/studio/types";

const CHECK_INTERVAL_MS = 3000;
const EMPTY_ARTWORK: Artwork = { font: "serif", panels: {} };
/** Fields printed on the front of the label; every other label field goes on the left or right side. */
const FRONT_KEYS = ["brandName", "productName", "productNameFr", "productNameAr", "origin", "claim", "netQuantity"];
/** Fields about the sale itself, not printed on the label. */
const DETAIL_KEYS = ["saleLocation", "salesChannel", "destinationCountry"];
const stepOf = (key: string): ProjectStep => (DETAIL_KEYS.includes(key) ? "details" : FRONT_KEYS.includes(key) ? "front" : "sides");
const ORDER: ProjectStep[] = ["details", "front", "sides", "review"];
const OPTIONAL_FIELDS = [
  { key: "ingredients", label: "Ingredients" },
  { key: "nutrition", label: "Nutrition statement" },
  { key: "lot", label: "Lot and date coding" },
  { key: "barcode", label: "Barcode / GTIN reference" },
];

/**
 * A packaging project, step by step: the sale details, the front of the label, its left and right sides,
 * then the 3D check and the submission. Moving between steps saves the work.
 */
export function DesignEditor({ design }: { design: DesignDetail }) {
  const router = useRouter();
  const version = design.versions[0];
  const [content, setContent] = useState<DesignContent>(
    version?.content ?? { fields: {}, colors: { primary: "#1c1a16", secondary: "#e8d9bc" } },
  );
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [part, setPart] = useState<PackagePart>("retail");
  const [face, setFace] = useState<PanelFace>("front");
  const [library, setLibrary] = useState(false);
  // Set once this visit sends the design for review, to show the way back to the Studio.
  const [sent, setSent] = useState(false);
  // The latest live check, so each text box shows whether it passes now, not at the last submission.
  const [live, setLive] = useState<CheckResult[] | null>(null);

  const rules = design.market.ruleSets[0]?.rules;
  const requiredFields = rules?.requiredFields ?? [];
  const artwork = content.artwork ?? EMPTY_ARTWORK;
  const { line, slug, volume } = getPackaging(design.template);
  const organic = slug.includes("organic");
  const extraFields = [...OPTIONAL_FIELDS, ...(organic ? [{ key: "organicControl", label: "Organic control body and mark" }] : [])];
  const fields = [...requiredFields, ...extraFields.filter((field) => !requiredFields.some(({ key }) => key === field.key))];
  const templateCopy = fillCopy(rules?.copy ?? {}, volume);
  const emptyWithTemplate = fields.filter(({ key }) => templateCopy[key] && !content.fields[key]?.trim());
  const logoPlacement = artwork.logoPlacement ?? { x: 50, y: 10, size: 70 };
  const labelFit = artwork.labelFit ?? { offset: 7, height: 84 };
  const panel = artwork.panels[part]?.[face] ?? defaultPanel(content, part, face);
  const validation = version?.validationResults[0];
  const issues = validation?.issues ?? [];
  const review = version?.approvals[0];
  const editable = design.status === "DRAFT" || design.status === "CHANGES_REQUESTED";
  const checking = design.status === "SUBMITTED" && !validation;
  const [step, setStep] = useState<ProjectStep>(editable ? "front" : "review");

  // The market check runs in the background, so reload until its result arrives.
  useEffect(() => {
    if (!checking) return;
    const timer = setInterval(() => router.refresh(), CHECK_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [checking, router]);

  function change(next: DesignContent) {
    // Text frames on the label follow their wording, so a field edited in the form refits its block.
    const unit = next.artwork?.layout?.unit;
    if (unit) {
      const fitted = fitLayout(unit, next);
      if (fitted !== unit) next = { ...next, artwork: { ...next.artwork!, layout: { ...next.artwork!.layout, unit: fitted } } };
    }
    setContent(next);
    setDirty(true);
    setMessage("");
  }

  function changePanel(next: Panel) {
    change({ ...content, artwork: { ...artwork, panels: {
      ...artwork.panels,
      [part]: { ...artwork.panels[part], [face]: next },
    } } });
  }

  async function save() {
    const result = await postJson(`/designs/${design.id}/versions`, { content });
    if (!result.ok) {
      setMessage(result.error);
      return false;
    }
    setDirty(false);
    return true;
  }

  /** Moving to another step keeps the work: unsaved changes are saved first. */
  async function goTo(next: ProjectStep) {
    if (dirty && editable) {
      setBusy(true);
      await save();
      setBusy(false);
    }
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function run(action: "save" | "submit") {
    setBusy(true);
    const saved = !dirty || (await save());
    if (saved && action === "submit") {
      const result = await postJson(`/designs/${design.id}/submit`);
      if (!result.ok) setMessage(result.error);
      else {
        setSent(true);
        setStep("review");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else if (saved) {
      setMessage("Saved.");
    }
    router.refresh();
    setBusy(false);
  }

  const next = ORDER[ORDER.indexOf(step) + 1];
  const previous = ORDER[ORDER.indexOf(step) - 1];
  const stepFields = fields.filter(({ key }) => stepOf(key) === step);
  const stepEmpty = emptyWithTemplate.filter(({ key }) => stepOf(key) === step);
  const variant = design.template.variant;
  const openField = (key: string) => setStep(stepOf(key));
  /** Sides of the label, by position: 0 left side, 1 front, 2 right side. */
  const SIDE_NAMES = ["left side", "front", "right side"];
  const fallbackPanel = (key: string): 0 | 1 | 2 => (stepOf(key) === "front" ? 1 : key === "nutrition" || key === "categoryStatement" ? 2 : 0);

  /** Puts fields that have text but no block back on the label, then shows the first one selected. */
  function placeMissing(keys: string[]) {
    const wanted = keys.map((key) => ({ key, label: fields.find((f) => f.key === key)?.label }));
    const { layout, placed } = placeFields(layoutOf(content, design.template, line), content, design.template, line, wanted, fallbackPanel);
    if (!placed.length) return;
    change({ ...content, artwork: { ...artwork, layout: { ...artwork.layout, unit: layout } } });
    const first = keys[0]!;
    const sides = [...new Set(keys.map((key) => {
      const block = layout.elements.find((e) => e.field === key);
      return block ? SIDE_NAMES[Math.min(2, Math.floor(((block.x + block.w / 2) / (Number(design.template.widthMm) || 170)) * 3))] : "";
    }).filter(Boolean))];
    setMessage(`Added ${keys.length > 1 ? `${keys.length} blocks` : wanted[0]!.label ?? "the block"} to the ${sides.join(" and ")}. Move it where you like.`);
    setStep(stepOf(first));
    requestField(first);
  }

  const fieldList = (
    <div className="grid gap-3">
      {editable && stepEmpty.length > 0 && (
        <button type="button" className="btn btn-outline justify-self-start" disabled={busy} onClick={() => change({
          ...content,
          fields: { ...content.fields, ...Object.fromEntries(stepEmpty.map(({ key }) => [key, templateCopy[key]])) },
        })}>
          Fill {stepEmpty.length} empty field{stepEmpty.length > 1 ? "s" : ""} with the {design.market.name} wording
        </button>
      )}
      {stepFields.map(({ key, label }) => {
        const own = live?.filter((r) => r.field === key) ?? [];
        const problem = live ? own.find((r) => r.status === "error") ?? own.find((r) => r.status === "warning") : undefined;
        const issue = live
          ? problem && { message: problem.message, severity: problem.status === "warning" ? "warning" as const : undefined }
          : issues.find((i) => i.field === key);
        const value = content.fields[key] ?? "";
        return (
          <label key={key} className="field">
            {label}
            <textarea id={`field-${key}`} className="input py-2"
              rows={Math.min(10, Math.max(1, value.split("\n").length, Math.ceil(value.length / 48)))}
              value={value} disabled={!editable || busy} maxLength={2000} placeholder={templateCopy[key]}
              onChange={(e) => change({ ...content, fields: { ...content.fields, [key]: e.target.value } })} />
            {key === "barcode" && <BarcodeHint text={value} />}
            {problem?.code === "notPlaced" && editable ? (
              <span className="flex flex-wrap items-center gap-2 font-normal text-danger">
                Not on the label.
                <button type="button" className="studio-place" disabled={busy} onClick={(e) => { e.preventDefault(); placeMissing([key]); }}>＋ Add to label</button>
              </span>
            ) : issue ? <span className={`font-normal ${issue.severity === "warning" ? "text-gold" : "text-danger"}`}>{issue.message}</span>
              : live && own.length > 0 && <span className="font-normal text-success">✓ OK for {design.market.name}</span>}
          </label>
        );
      })}
    </div>
  );

  const navigation = (
    <div className="ws-bar">
      {previous && <button type="button" className="btn btn-outline" disabled={busy} onClick={() => goTo(previous)}>← Back</button>}
      {editable && <button type="button" className="btn btn-outline" disabled={busy || !dirty} onClick={() => run("save")}>{dirty ? "Save" : "Saved ✓"}</button>}
      {message && <p role="status" className="text-sm text-mid">{message}</p>}
      <span className="ws-spacer" />
      {next && (
        <button type="button" className="btn" disabled={busy} onClick={() => goTo(next)}>
          Next: {next === "front" ? "design the front" : next === "sides" ? "left and right sides" : "3D check"} →
        </button>
      )}
    </div>
  );

  return (
    <div className="grid gap-4">
      <div className="card studio-steps-bar"><Steps current={step} onSelect={goTo} available={ORDER} /></div>

      {design.status === "CHANGES_REQUESTED" && review && (
        <p role="status" className="rounded-xl border border-danger/30 bg-white p-3 text-sm text-danger">
          The OLIVED team asked for changes{review.comment ? `: ${review.comment}` : "."}
        </p>
      )}
      {rules?.draft && (
        <p role="note" className="rounded-xl border border-gold/40 bg-sand p-3 text-sm">
          <strong>Draft market.</strong> This template comes from label photos and has not been verified yet. Confirm every statement with your importer before printing.
        </p>
      )}

      {step === "details" && (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="card grid gap-4">
            <h2 className="text-3xl">Details</h2>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
              <dt className="text-mid">Product</dt><dd>{variant.product.name}</dd>
              <dt className="text-mid">Format</dt><dd>{variant.name} · {design.template.name}</dd>
              <dt className="text-mid">Market</dt><dd>{design.market.name} · {design.market.languages.join(" / ") || "languages to confirm"}</dd>
            </dl>
            <fieldset className="grid gap-3" disabled={!editable || busy}>
              <label className="field">Sales location or retailer
                <input id="field-saleLocation" className="input" value={content.fields.saleLocation ?? ""} maxLength={160} placeholder="City, store or distributor"
                  onChange={(e) => change({ ...content, fields: { ...content.fields, saleLocation: e.target.value } })} />
              </label>
              <label className="field">Sales channel
                <select id="field-salesChannel" className="input" value={content.fields.salesChannel ?? ""}
                  onChange={(e) => change({ ...content, fields: { ...content.fields, salesChannel: e.target.value } })}>
                  <option value="">Choose a channel</option>
                  <option value="Retail">Retail</option><option value="Online">Online</option>
                  <option value="Food service">Food service</option><option value="Wholesale">Wholesale</option>
                </select>
              </label>
              {fieldList}
              <div className="grid grid-cols-2 gap-4">
                {(["primary", "secondary"] as const).map((key) => (
                  <label key={key} className="field">
                    {key === "primary" ? "Label colour" : "Accent colour"}
                    <input type="color" className="input cursor-pointer p-1" value={content.colors[key]}
                      onChange={(e) => change({ ...content, colors: { ...content.colors, [key]: e.target.value } })} />
                  </label>
                ))}
              </div>
            </fieldset>
            {navigation}
          </div>
          <PackagingPreview key="details" content={content} template={design.template} part="unit" face={face} onFace={setFace}
            marketCode={design.market.code} initialView="3d" initialYaw={-35} />
        </div>
      )}

      {(step === "front" || step === "sides") && (
        <div className="studio-workspace">
          <LabelEditor key={step} focus={step} content={content} template={design.template} line={line} editable={editable && !busy}
            fields={stepFields} onChange={change}
            header={
              <div className="ws-head">
                <h2>{step === "front" ? "Design the front" : "Design the left and right sides"}</h2>
                <p>
                  {step === "front"
                    ? "Brand, logo, product name and net quantity: the side that faces the shopper. Click a block to move, resize or restyle it."
                    : "Product information, importer and barcode on the left; nutrition on the right. Pick the side under “Add to” before adding text or a logo."}
                </p>
              </div>
            }
            footer={navigation}
            sidebar={
              <div className="grid gap-3">
                <h3 className="ws-section-title">{step === "front" ? "Text on the front" : "Text on the sides"}</h3>
                {fieldList}
                <hr className="border-line" />
              </div>
            } />
          <div className="ws-right">
            {editable && (
              <div className="card p-4">
                <MarketChecklist designId={design.id} content={content} only={stepFields.map(({ key }) => key)}
                  onField={openField} onResults={setLive} onPlace={editable ? placeMissing : undefined} title={`Checks for ${step === "front" ? "the front" : "the sides"}`} />
              </div>
            )}
            <PackagingPreview key={step} content={content} template={design.template} part="unit" face={face} onFace={setFace}
              marketCode={design.market.code} initialView="3d" initialYaw={step === "front" ? 0 : 90}
              title={step === "front" ? "Front on the bottle" : "Sides on the bottle"} />
          </div>
        </div>
      )}

      {step === "review" && (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
          <div className="card grid content-start gap-4">
            <h2 className="text-3xl">3D check & submit</h2>
            <p className="text-sm text-mid">Turn the bottle to check every side. When the checklist is complete, submit the design: the OLIVED team reviews it before printing.</p>
            {editable && <MarketChecklist designId={design.id} content={content} onField={openField} onResults={setLive} onPlace={placeMissing} />}
            <p className="text-sm text-mid">
              The checks guide compliance with {design.market.name}&apos;s labelling rules. The destination&apos;s regulatory sign-off is still required before printing.
              {rules?.source && <> <a href={rules.source} target="_blank" rel="noreferrer" className="underline">Official source</a>.</>}
            </p>
            {design.template.kind === "BOTTLE_LABEL" && (
              <details>
                <summary className="cursor-pointer text-sm font-medium">Label height on the bottle</summary>
                <fieldset className="mt-3 grid gap-3" disabled={!editable || busy}>
                  <label className="field">Label top offset · {labelFit.offset}%
                    <input type="range" min={0} max={Math.min(55, 100 - labelFit.height)} value={labelFit.offset}
                      onChange={(e) => change({ ...content, artwork: { ...artwork, labelFit: { ...labelFit, offset: Number(e.target.value) } } })} />
                  </label>
                  <label className="field">Label height · {labelFit.height}%
                    <input type="range" min={30} max={Math.min(90, 100 - labelFit.offset)} value={labelFit.height}
                      onChange={(e) => change({ ...content, artwork: { ...artwork, labelFit: { ...labelFit, height: Number(e.target.value) } } })} />
                  </label>
                </fieldset>
              </details>
            )}
            <details>
              <summary className="cursor-pointer text-sm font-medium">Retail box and shipping case (optional)</summary>
              <fieldset className="mt-3 grid gap-3" disabled={!editable || busy}>
                <div className="studio-segment flex-wrap" aria-label="Packaging component">
                  {PARTS.filter((item) => item.id !== "unit").map((item) => (
                    <button type="button" aria-pressed={part === item.id} key={item.id} onClick={() => { setPart(item.id); setFace("front"); }}>{item.name}</button>
                  ))}
                </div>
                <label className="field"><span className="capitalize">{face} text</span>
                  <textarea className="input py-2" rows={4} maxLength={500} value={panel.text} onChange={(e) => changePanel({ ...panel, text: e.target.value })} />
                </label>
                {(["x", "y", "size"] as const).map((key) => (
                  <label className="field" key={key}>
                    {key === "x" ? "Horizontal placement" : key === "y" ? "Vertical placement" : "Type scale"} · {panel[key]}%
                    <input type="range" min={key === "size" ? 4 : 5} max={key === "size" ? 22 : 95} step="1"
                      value={panel[key]} onChange={(e) => changePanel({ ...panel, [key]: Number(e.target.value) })} />
                  </label>
                ))}
                <label className="field">Typeface
                  <select className="input" value={artwork.font} onChange={(e) => change({ ...content, artwork: { ...artwork, font: e.target.value as Artwork["font"] } })}>
                    <option value="serif">Serif</option><option value="sans">Sans serif</option><option value="mono">Monospace</option>
                  </select>
                </label>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className="btn btn-outline" onClick={() => setLibrary(true)}>{artwork.logo ? "Change box logo" : "Choose a box logo"}</button>
                  {artwork.logo && <button type="button" className="btn btn-outline" onClick={() => {
                    const remaining = { ...artwork };
                    delete remaining.logo;
                    change({ ...content, artwork: remaining });
                  }}>Remove logo</button>}
                </div>
                {(artwork.logo || line || slug === "oussoul" || content.fields.brandName === "Oussoul") && (
                  <div className="grid gap-3">
                    {(["x", "y", "size"] as const).map((key) => (
                      <label className="field" key={key}>{key === "x" ? "Logo horizontal" : key === "y" ? "Logo vertical" : "Logo scale"} · {logoPlacement[key]}%
                        <input type="range" min={key === "x" ? 15 : key === "y" ? 0 : 8} max={key === "x" ? 85 : key === "y" ? 80 : 70}
                          value={logoPlacement[key]} onChange={(e) => change({ ...content, artwork: {
                            ...artwork, logoPlacement: { ...logoPlacement, [key]: Number(e.target.value) },
                          } })} />
                      </label>
                    ))}
                  </div>
                )}
                <PackagingPreview key={part} content={content} template={design.template} part={part} face={face} onFace={setFace} marketCode={design.market.code} />
              </fieldset>
            </details>
            {library && <AssetLibrary onClose={() => setLibrary(false)} onPick={(url) => {
              change({ ...content, artwork: { ...artwork, logo: url } });
              setLibrary(false);
            }} />}

            {(sent || design.status === "SUBMITTED" || design.status === "APPROVED") && (
              <div role="status" className="studio-done">
                <span className="studio-done-icon" aria-hidden="true">✓</span>
                <div className="grid gap-1">
                  <strong>{design.status === "APPROVED" ? "Finished: approved by the OLIVED team" : "Sent for review"}</strong>
                  <span className="text-sm">
                    {design.status === "APPROVED"
                      ? review?.comment || "Your packaging is approved and ready for the print files."
                      : "The OLIVED team checks every design and will answer here. You can follow it from your Studio dashboard."}
                  </span>
                  <span className="mt-2 flex flex-wrap gap-2">
                    <Link href="/studio/designs" className="btn">← Back to my Studio</Link>
                    <Link href="/studio/designs/new" className="btn btn-outline">Start a new design</Link>
                  </span>
                </div>
              </div>
            )}
            {checking && <p role="status" className="text-sm text-mid">Checking this design against the market rules…</p>}
            {design.status === "SUBMITTED" && validation?.passed && (
              <p role="status" className="text-sm text-success">Checklist complete. Waiting for review by the OLIVED team.</p>
            )}
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" className="btn btn-outline" disabled={busy} onClick={() => goTo("sides")}>← Back</button>
              {editable && <button type="button" className="btn" disabled={busy} onClick={() => run("submit")}>Submit for review</button>}
              {editable && <button type="button" className="btn btn-outline" disabled={busy || !dirty} onClick={() => run("save")}>{dirty ? "Save" : "Saved"}</button>}
              {message && <p role="status" className="text-sm text-mid">{message}</p>}
              <Link href="/studio/designs" className="ml-auto text-sm font-medium text-olive underline-offset-4 hover:underline">My designs</Link>
            </div>
          </div>
          <PackagingPreview key="review" content={content} template={design.template} part="unit" face={face} onFace={setFace}
            marketCode={design.market.code} initialView="3d" initialYaw={-35} />
        </div>
      )}
    </div>
  );
}
