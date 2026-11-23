"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AssetLibrary } from "@/components/studio/AssetLibrary";
import { LabelEditor } from "@/components/studio/LabelEditor";
import { MarketChecklist } from "@/components/studio/MarketChecklist";
import { PackagingPreview, PARTS } from "@/components/studio/PackagingPreview";
import { defaultPanel, fillCopy, getPackaging } from "@/lib/studio/label-artwork";
import { fitLayout } from "@/lib/studio/layout";
import { postJson } from "@/lib/studio/post";
import type { Artwork, DesignContent, DesignDetail, PackagePart, Panel, PanelFace } from "@/lib/studio/types";

const CHECK_INTERVAL_MS = 3000;
const EMPTY_ARTWORK: Artwork = { font: "serif", panels: {} };
const OPTIONAL_FIELDS = [
  { key: "ingredients", label: "Ingredients" },
  { key: "nutrition", label: "Nutrition statement" },
  { key: "lot", label: "Lot and date coding" },
  { key: "barcode", label: "Barcode / GTIN reference" },
];

export function DesignEditor({ design }: { design: DesignDetail }) {
  const router = useRouter();
  const version = design.versions[0];
  const [content, setContent] = useState<DesignContent>(
    version?.content ?? { fields: {}, colors: { primary: "#1c1a16", secondary: "#e8d9bc" } },
  );
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [part, setPart] = useState<PackagePart>("unit");
  const [face, setFace] = useState<PanelFace>("front");
  const [library, setLibrary] = useState(false);

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

  async function run(action: "save" | "submit") {
    setBusy(true);
    const saved = !dirty || (await save());
    if (saved && action === "submit") {
      const result = await postJson(`/designs/${design.id}/submit`);
      if (!result.ok) setMessage(result.error);
    } else if (saved) {
      setMessage("Saved.");
    }
    router.refresh();
    setBusy(false);
  }

  return (
    <div className="grid gap-6">
    <div className="card grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="studio-segment flex-wrap" aria-label="Packaging component">
          {PARTS.map((item) => (
            <button type="button" aria-pressed={part === item.id} key={item.id} onClick={() => { setPart(item.id); setFace("front"); }}>
              {item.name}
            </button>
          ))}
        </div>
        {editable && (
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-outline" disabled={busy || !dirty} onClick={() => run("save")}>{dirty ? "Save" : "Saved"}</button>
          </div>
        )}
      </div>
      {part === "unit" ? (
        <LabelEditor content={content} template={design.template} line={line} editable={editable && !busy} fields={fields} onChange={change} />
      ) : (
        <p className="text-sm text-mid">The {PARTS.find((item) => item.id === part)?.name.toLowerCase()} is set up with the controls below and shown in the preview.</p>
      )}
    </div>
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
      <div className="card grid content-start gap-4">
        <fieldset className="grid gap-3 rounded-xl border border-line bg-sand/50 p-4" disabled={!editable || busy}>
          <legend className="px-2 text-sm font-semibold">Where will you sell?</legend>
          <p className="text-sm font-medium">{design.market.name} · {design.market.languages.join(" / ") || "Languages to confirm"}</p>
          <label className="field">Sales location or retailer
            <input className="input" value={content.fields.saleLocation ?? ""} maxLength={160} placeholder="City, store or distributor"
              onChange={(e) => change({ ...content, fields: { ...content.fields, saleLocation: e.target.value } })} />
            {issues.find((i) => i.field === "saleLocation")?.message && <span className="text-danger">{issues.find((i) => i.field === "saleLocation")?.message}</span>}
          </label>
          <label className="field">Sales channel
            <select className="input" value={content.fields.salesChannel ?? ""}
              onChange={(e) => change({ ...content, fields: { ...content.fields, salesChannel: e.target.value } })}>
              <option value="">Choose a channel</option>
              <option value="Retail">Retail</option><option value="Online">Online</option>
              <option value="Food service">Food service</option><option value="Wholesale">Wholesale</option>
            </select>
            {issues.find((i) => i.field === "salesChannel")?.message && <span className="text-danger">{issues.find((i) => i.field === "salesChannel")?.message}</span>}
          </label>
        </fieldset>
        <h2 className="text-2xl">{part === "unit" ? "Label settings" : "Artwork controls"}</h2>
        <fieldset className="grid gap-3" disabled={!editable || busy}>
          {part !== "unit" && (<>
          <label className="field"><span className="capitalize">{face} artwork</span>
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
            <button type="button" className="btn btn-outline" onClick={() => setLibrary(true)}>{artwork.logo ? "Change logo" : "Choose a logo"}</button>
            {artwork.logo && <button type="button" className="btn btn-outline" onClick={() => {
              const remaining = { ...artwork };
              delete remaining.logo;
              change({ ...content, artwork: remaining });
            }}>Remove logo</button>}
          </div>
          {(artwork.logo || line || slug === "oussoul" || content.fields.brandName === "Oussoul") && (
            <details>
              <summary className="cursor-pointer text-sm font-medium">Logo position and scale</summary>
              <div className="mt-3 grid gap-3">
                {(["x", "y", "size"] as const).map((key) => (
                  <label className="field" key={key}>{key === "x" ? "Logo horizontal" : key === "y" ? "Logo vertical" : "Logo scale"} · {logoPlacement[key]}%
                    <input type="range" min={key === "x" ? 15 : key === "y" ? 0 : 8} max={key === "x" ? 85 : key === "y" ? 80 : 70}
                      value={logoPlacement[key]} onChange={(e) => change({ ...content, artwork: {
                        ...artwork, logoPlacement: { ...logoPlacement, [key]: Number(e.target.value) },
                      } })} />
                  </label>
                ))}
              </div>
            </details>
          )}
          </>)}
          {part === "unit" && design.template.kind === "BOTTLE_LABEL" && (
            <details>
              <summary className="cursor-pointer text-sm font-medium">Label fit in 3D</summary>
              <div className="mt-3 grid gap-3">
                <label className="field">Label top offset · {labelFit.offset}%
                  <input type="range" min={0} max={Math.min(55, 100 - labelFit.height)} value={labelFit.offset}
                    onChange={(e) => change({ ...content, artwork: { ...artwork, labelFit: { ...labelFit, offset: Number(e.target.value) } } })} />
                </label>
                <label className="field">Label height · {labelFit.height}%
                  <input type="range" min={30} max={Math.min(90, 100 - labelFit.offset)} value={labelFit.height}
                    onChange={(e) => change({ ...content, artwork: { ...artwork, labelFit: { ...labelFit, height: Number(e.target.value) } } })} />
                </label>
              </div>
            </details>
          )}
        </fieldset>
        {library && <AssetLibrary onClose={() => setLibrary(false)} onPick={(url) => {
          change({ ...content, artwork: { ...artwork, logo: url } });
          setLibrary(false);
        }} />}
        <details className="grid gap-3" open>
          <summary className="mb-3 cursor-pointer font-medium">Market checklist · {design.market.name}</summary>
          <div className="grid gap-3">
        {rules?.draft && (
          <p role="note" className="rounded-xl border border-gold/40 bg-sand p-3 text-sm">
            <strong>Draft market.</strong> This template comes from label photos and has not been verified yet. Confirm every statement with your importer before printing.
          </p>
        )}
        {editable && <MarketChecklist designId={design.id} content={content} />}
        <p className="text-sm text-mid">
          The checks guide compliance with {design.market.name}&apos;s labelling rules. OLIVED reviews every design, and the destination&apos;s regulatory sign-off is still required before printing.
          {rules?.source && <> <a href={rules.source} target="_blank" rel="noreferrer" className="underline">Official source</a>.</>}
        </p>
        {editable && emptyWithTemplate.length > 0 && (
          <button type="button" className="btn btn-outline justify-self-start" disabled={busy} onClick={() => change({
            ...content,
            fields: { ...content.fields, ...Object.fromEntries(emptyWithTemplate.map(({ key }) => [key, templateCopy[key]])) },
          })}>
            Fill {emptyWithTemplate.length} empty field{emptyWithTemplate.length > 1 ? "s" : ""} with the {design.market.name} wording
          </button>
        )}
        {fields.map(({ key, label }) => {
          const issue = issues.find((i) => i.field === key);
          const value = content.fields[key] ?? "";
          return (
            <label key={key} className="field">
              {label}
              <textarea
                id={`field-${key}`}
                className="input py-2"
                rows={Math.min(10, Math.max(1, value.split("\n").length, Math.ceil(value.length / 48)))}
                value={value}
                disabled={!editable || busy}
                maxLength={2000}
                placeholder={templateCopy[key]}
                onChange={(e) => change({ ...content, fields: { ...content.fields, [key]: e.target.value } })}
              />
              {issue && <span className={`font-normal ${issue.severity === "warning" ? "text-gold" : "text-danger"}`}>{issue.message}</span>}
            </label>
          );
        })}
          </div>
        </details>

        <div className="grid grid-cols-2 gap-4">
          {(["primary", "secondary"] as const).map((key) => (
            <label key={key} className="field capitalize">
              {key === "primary" ? "Background colour" : "Accent colour"}
              <input
                type="color"
                className="input cursor-pointer p-1"
                value={content.colors[key]}
                disabled={!editable || busy}
                onChange={(e) => change({ ...content, colors: { ...content.colors, [key]: e.target.value } })}
              />
            </label>
          ))}
        </div>

        {design.status === "CHANGES_REQUESTED" && review && (
          <p role="status" className="text-sm text-danger">
            The OLIVED team asked for changes{review.comment ? `: ${review.comment}` : "."}
          </p>
        )}
        {design.status === "APPROVED" && (
          <p role="status" className="whitespace-pre-wrap break-words text-sm text-success">
            Approved by the OLIVED team.{review?.comment && ` ${review.comment}`}
          </p>
        )}
        {message && (
          <p role="status" className="text-sm text-mid">
            {message}
          </p>
        )}
        {checking && (
          <p role="status" className="text-sm text-mid">
            Checking this design against the market rules…
          </p>
        )}
        {design.status === "SUBMITTED" && validation?.passed && (
          <p role="status" className="text-sm text-success">
            Checklist complete. Waiting for review by the OLIVED team.
          </p>
        )}

        {editable && (
          <div className="flex flex-wrap gap-3">
            <button type="button" className="btn" disabled={busy} onClick={() => run("submit")}>
              Submit for review
            </button>
            <button type="button" className="btn btn-outline" disabled={busy || !dirty} onClick={() => run("save")}>
              Save
            </button>
          </div>
        )}
      </div>

      <div className="grid content-start lg:sticky lg:top-5 lg:self-start">
        <PackagingPreview
          content={content}
          template={design.template}
          part={part}
          face={face}
          onFace={setFace}
          marketCode={design.market.code}
          initialView={part === "unit" ? "3d" : "flat"}
          key={part === "unit" ? "unit" : "other"}
        />
      </div>
    </div>
    </div>
  );
}
