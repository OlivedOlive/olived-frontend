"use client";

import { useEffect, useRef, useState } from "react";
import { postJson } from "@/lib/studio/post";

type Asset = { id: string; name: string; mimeType: string; sizeBytes: number; url: string };

/** OLIVED's own brand marks, shipped with the Studio. */
export const BRAND_MARKS = [
  { name: "ORZETA Sun mark", url: "/studio/labels/mark-sun.png" },
  { name: "ORZETA Grove mark", url: "/studio/labels/mark-grove.png" },
];

const TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
const MAX_BYTES = 5 * 1024 * 1024;

/**
 * The company's logos and images, stored on the Studio server and reused across its designs.
 * Uploading adds a file to the library; choosing one hands its address to the label.
 */
export function AssetLibrary({ onPick, onClose, extra = [] }: { onPick: (url: string, name: string) => void; onClose: () => void; extra?: { name: string; url: string }[] }) {
  const [assets, setAssets] = useState<Asset[] | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const dialog = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let current = true;
    fetch("/api/studio/assets")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: { assets: Asset[] }) => current && setAssets(data.assets))
      .catch(() => current && (setAssets([]), setMessage("Your library could not be loaded.")));
    dialog.current?.focus();
    return () => { current = false; };
  }, []);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setMessage("");
    for (const file of Array.from(files)) {
      if (!TYPES.includes(file.type) || file.size > MAX_BYTES) {
        setMessage(`${file.name}: choose a PNG, JPEG, WebP or SVG image up to 5 MB.`);
        continue;
      }
      try {
        const res = await fetch("/api/studio/assets", {
          method: "POST",
          headers: { "Content-Type": file.type, "X-File-Name": encodeURIComponent(file.name) },
          body: file,
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) setMessage(`${file.name}: ${data.error ?? "the upload failed."}`);
        else setAssets((list) => [data.asset as Asset, ...(list ?? [])]);
      } catch {
        setMessage("We could not reach the studio. Check your connection and try again.");
      }
    }
    setBusy(false);
  }

  async function remove(asset: Asset) {
    if (!window.confirm(`Delete “${asset.name}” from your library? Designs that use it will lose the image.`)) return;
    const result = await postJson(`/assets/${asset.id}/delete`);
    if (result.ok) setAssets((list) => list?.filter((item) => item.id !== asset.id) ?? null);
    else setMessage(result.error);
  }

  const tiles = [...extra, ...BRAND_MARKS];

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4" onClick={onClose}>
      <div ref={dialog} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Logo and image library"
        className="card grid max-h-[85vh] w-full max-w-2xl gap-4 overflow-auto outline-none"
        onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.key === "Escape" && onClose()}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl">Logos and images</h2>
          <button type="button" className="btn btn-outline" onClick={onClose}>Close</button>
        </div>
        <label className="grid cursor-pointer justify-items-center gap-1 rounded-xl border-2 border-dashed border-line p-5 text-center text-sm hover:bg-sand/60"
          onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); void upload(e.dataTransfer.files); }}>
          <span className="font-semibold">{busy ? "Uploading…" : "Upload a logo or image"}</span>
          <span className="text-mid">PNG, JPEG, WebP or SVG, up to 5 MB. For print, use an SVG or a PNG of at least 1500 px.</span>
          <input type="file" className="sr-only" multiple accept={TYPES.join(",")} disabled={busy}
            onChange={(e) => { void upload(e.target.files); e.target.value = ""; }} />
        </label>
        {message && <p role="status" className="text-sm text-danger">{message}</p>}
        <h3 className="text-sm font-semibold">Your library</h3>
        {assets === null ? <p className="text-sm text-mid">Loading…</p> : assets.length === 0 ? (
          <p className="text-sm text-mid">No images yet. Uploaded logos stay here for all your designs.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {assets.map((asset) => (
              <li key={asset.id} className="grid gap-1">
                <button type="button" className="studio-asset" onClick={() => onPick(asset.url, asset.name)} title={`Use ${asset.name}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- a private file of the company, not optimisable */}
                  <img src={asset.url} alt="" />
                </button>
                <span className="truncate text-xs" title={asset.name}>{asset.name}</span>
                <button type="button" className="justify-self-start text-xs text-danger underline" onClick={() => void remove(asset)}>Delete</button>
              </li>
            ))}
          </ul>
        )}
        <h3 className="text-sm font-semibold">OLIVED brand marks</h3>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {tiles.map((tile) => (
            <li key={tile.url} className="grid gap-1">
              <button type="button" className="studio-asset" onClick={() => onPick(tile.url, tile.name)} title={`Use ${tile.name}`}>
                {/* eslint-disable-next-line @next/next/no-img-element -- drawn on the label canvas at print size */}
                <img src={tile.url} alt="" />
              </button>
              <span className="truncate text-xs">{tile.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
