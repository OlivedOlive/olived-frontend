"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import orzeta from "@/assets/images/orzeta-grove.webp";
import oussoul from "@/assets/images/studio/oussoul.webp";
import privateLabel from "@/assets/images/private-label.png";
import { PackagingPreview } from "@/components/studio/PackagingPreview";
import { Steps } from "@/components/studio/Steps";
import { fillCopy } from "@/lib/studio/label-artwork";
import { postJson } from "@/lib/studio/post";
import type { DesignContent, Market, PanelFace, Product } from "@/lib/studio/types";

const PATHS = [
  { id: "orzeta", title: "ORZETA", description: "Sun, Grove and Organic", image: orzeta },
  { id: "oussoul", title: "Oussoul / أصول", description: "Black and gold collection", image: oussoul },
  { id: "private", title: "Private label", description: "Design under your own brand", image: privateLabel },
] as const;

const PALETTES: Record<string, { primary: string; secondary: string }> = {
  "orzeta-sun": { primary: "#f65318", secondary: "#102c23" },
  "orzeta-grove": { primary: "#073b2f", secondary: "#fff3df" },
  "orzeta-organic": { primary: "#f2e8d9", secondary: "#243b2b" },
  oussoul: { primary: "#191817", secondary: "#d8b461" },
};

export function NewDesignForm({ products, markets }: { products: Product[]; markets: Market[] }) {
  const router = useRouter();
  const [path, setPath] = useState<string>(PATHS.find(({ id }) => products.some((p) => p.slug.startsWith(id)))?.id ?? "catalog");
  const [productId, setProductId] = useState("");
  const [variantId, setVariantId] = useState("");
  const [marketId, setMarketId] = useState(markets[0]?.id ?? "");
  const [packagingId, setPackagingId] = useState("");
  const [face, setFace] = useState<PanelFace>("front");
  const [step, setStep] = useState<"product" | "details">("product");
  const [name, setName] = useState("");
  const [saleLocation, setSaleLocation] = useState("");
  const [salesChannel, setSalesChannel] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const available = products.filter((item) => item.variants.some((v) => v.templates.length) && (path === "catalog" || item.slug.startsWith(path)));
  const product = available.find((item) => item.id === productId) ?? available[0];
  const variants = product?.variants.filter((item) => item.templates.length) ?? [];
  const variant = variants.find((item) => item.id === variantId) ?? variants[0];
  const market = markets.find((item) => item.id === marketId);
  const template = variant?.templates.find((item) => item.id === packagingId) ?? variant?.templates[0];
  // The design starts with the market's legal wording, sized for this bottle. Organic-only lines are left
  // out for other oils, and private-label clients start without a brand name.
  const marketCopy = fillCopy(market?.copy ?? {}, variant?.volumeMl ?? 750);
  if (!product?.slug.includes("organic")) delete marketCopy.organicControl;
  const content: DesignContent = {
    fields: {
      ...marketCopy,
      brandName: path === "orzeta" ? "ORZETA" : path === "oussoul" ? "Oussoul" : "",
    },
    colors: PALETTES[product?.slug ?? ""] ?? { primary: "#243b2b", secondary: "#f1e5ce" },
    artwork: { font: "serif", panels: {} },
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const templateId = template?.id;
    if (!product || !variant || !templateId || !market) return;
    setBusy(true);
    setError("");
    const result = await postJson<{ design: { id: string } }>("/designs", {
      name: name.trim() || `${product.name} · ${market.name}`,
      templateId,
      marketId,
      content: {
        ...content,
        fields: {
          ...content.fields,
          saleLocation,
          salesChannel,
        },
      },
    });
    if (result.ok) {
      router.push("/studio/designs/" + encodeURIComponent(result.data.design.id));
      return;
    }
    setError(Object.values(result.fields)[0] ?? result.error);
    setBusy(false);
  }

  const preview = template && variant && product && (
    <PackagingPreview key={template.id} content={content} template={{ ...template, variant: { ...variant, product } }}
      part="unit" face={face} onFace={setFace} marketCode={market?.code} initialView="3d" initialYaw={-35} />
  );

  return (
    <form onSubmit={submit} className="grid gap-6">
      <div className="card studio-steps-bar">
        <Steps current={step} onSelect={(next) => next === "product" && setStep("product")} available={["product"]} />
      </div>
      {step === "product" && (<>
        <fieldset className="grid gap-3 sm:grid-cols-3">
          <legend className="mb-3 text-sm font-semibold">1. Choose the brand</legend>
          {PATHS.map((item) => (
            <button key={item.id} type="button" aria-pressed={path === item.id}
              disabled={!products.some((p) => p.slug.startsWith(item.id) && p.variants.some((v) => v.templates.length))}
              onClick={() => { setPath(item.id); setProductId(""); setVariantId(""); }}
              className="studio-brand-card text-left">
              <div className="studio-brand-image">
                <Image src={item.image} alt="" fill sizes="(min-width: 640px) 33vw, 100vw" />
              </div>
              <span className="block text-lg font-semibold">{item.title}</span>
              <span className="text-sm text-mid">{item.description}</span>
            </button>
          ))}
        </fieldset>
        {path === "catalog" && <p className="text-sm text-mid">Load the OLIVED catalog to enable the brand collections.</p>}
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="card grid gap-5">
            <h2 className="text-2xl">2. Choose the product and the bottle</h2>
            <label className="field">Product
              <select className="input" value={product?.id ?? ""} onChange={(e) => { setProductId(e.target.value); setVariantId(""); }}>
                {available.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}
              </select>
            </label>
            <label className="field">Format and capacity
              <select className="input" value={variant?.id ?? ""} onChange={(e) => { setVariantId(e.target.value); setPackagingId(""); }}>
                {variants.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}
              </select>
            </label>
            <label className="field">Packaging
              <select className="input" value={template?.id ?? ""} onChange={(e) => setPackagingId(e.target.value)}>
                {variant?.templates.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </label>
            {product?.description && <p className="text-sm text-mid">{product.description}</p>}
            <button type="button" className="btn justify-self-start" disabled={!variant || !template} onClick={() => setStep("details")}>
              Next: details →
            </button>
          </div>
          {preview}
        </div>
      </>)}
      {step === "details" && (
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="card grid gap-5">
            <h2 className="text-2xl">Where will you sell it?</h2>
            <p className="text-sm text-mid">{product?.name} · {variant?.name} · {template?.name}</p>
            <label className="field">Destination market
              <select className="input" value={marketId} onChange={(e) => setMarketId(e.target.value)} required>
                {markets.map((item) => <option value={item.id} key={item.id}>{item.name}{item.draft ? " (draft)" : ""}</option>)}
              </select>
              <span className="text-xs text-mid">The label starts with this market&apos;s required wording{market?.languages.length ? ", in " + market.languages.join(" / ") : ""}.</span>
            </label>
            <label className="field">Sales location or retailer
              <input className="input" value={saleLocation} onChange={(e) => setSaleLocation(e.target.value)} maxLength={160} required placeholder="City, store or distributor" />
            </label>
            <label className="field">Sales channel
              <select className="input" value={salesChannel} onChange={(e) => setSalesChannel(e.target.value)} required>
                <option value="" disabled>Choose a channel</option>
                <option>Retail</option><option>Online</option><option>Food service</option><option>Wholesale</option>
              </select>
            </label>
            <label className="field">Project name <span className="font-normal text-mid">(optional)</span>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={160}
                placeholder={product && market ? `${product.name} · ${market.name}` : "e.g. Grove · France launch"} />
            </label>
            {error && <p role="alert" className="text-sm text-danger">{error}</p>}
            <div className="flex flex-wrap gap-3">
              <button type="button" className="btn btn-outline" onClick={() => setStep("product")}>← Back</button>
              <button type="submit" className="btn" disabled={busy || !variant}>{busy ? "Creating…" : "Next: design the front →"}</button>
            </div>
          </div>
          {preview}
        </div>
      )}
    </form>
  );
}
