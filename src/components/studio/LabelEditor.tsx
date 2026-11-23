"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import oussoulMark from "@/assets/images/studio/oussoul-mark.png";
import { AssetLibrary } from "@/components/studio/AssetLibrary";
import { FONTS, loadFonts } from "@/lib/studio/fonts";
import {
  fitLayout, inkFor, labelSize, newId, prepare, PT, renderLabel, SAFE_MARGIN, templateLayout, textHeight,
  type LabelElement, type Layout,
} from "@/lib/studio/layout";
import type { DesignContent, Template } from "@/lib/studio/types";

type EditorTemplate = Template & { variant?: { product: { slug: string } } };
type Handle = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";
type Guide = { axis: "x" | "y"; at: number };
type Gesture =
  | { kind: "move"; id: string; start: { x: number; y: number }; origin: LabelElement; before: Layout }
  | { kind: "resize"; id: string; handle: Handle; start: { x: number; y: number }; origin: LabelElement; before: Layout }
  | { kind: "rotate"; id: string; centre: { x: number; y: number }; origin: LabelElement; before: Layout };

const BASE_PX_PER_MM = 4;
const HANDLES: Handle[] = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];
const HANDLE_POS: Record<Handle, [number, number]> = { nw: [0, 0], n: [.5, 0], ne: [1, 0], e: [1, .5], se: [1, 1], s: [.5, 1], sw: [0, 1], w: [0, .5] };
const CURSOR: Record<Handle, string> = { n: "ns-resize", s: "ns-resize", e: "ew-resize", w: "ew-resize", ne: "nesw-resize", sw: "nesw-resize", nw: "nwse-resize", se: "nwse-resize" };
const PANEL_NAMES = { back: "Product information", front: "Front", right: "Nutrition" } as const;
const textual = (e: LabelElement) => e.type === "text" || e.type === "field";
const round = (value: number, step = .1) => Math.round(value / step) * step;

/**
 * The pro editor of the unit label. Every block of the label is an element the client can move, resize,
 * rotate and restyle; they can add their own text, logos and shapes. Positions are in millimetres on the
 * real label, with folds, the safety margin and snapping shown while dragging.
 */
export function LabelEditor({
  content, template, line, editable, fields, onChange,
}: {
  content: DesignContent;
  template: EditorTemplate;
  line: string;
  editable: boolean;
  /** Market and optional fields the client can place on the label. */
  fields: { key: string; label: string }[];
  onChange: (content: DesignContent) => void;
}) {
  const size = labelSize(template);
  const saved = content.artwork?.layout?.unit;
  // Text frames are measured with the real typefaces, so the starting layout waits for them.
  const [fontsReady, setFontsReady] = useState(false);
  useEffect(() => { void loadFonts().then(() => setFontsReady(true)); }, []);
  const layout = useMemo(() => saved ?? templateLayout(content, template, line), [saved, content, template, line, fontsReady]); // eslint-disable-line react-hooks/exhaustive-deps
  // While a gesture runs, the layout lives here; the design only changes when it ends (one undo step).
  const [draft, setDraft] = useState<Layout | null>(null);
  const shown = draft ?? layout;
  const [selected, setSelected] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [showGuides, setShowGuides] = useState(true);
  const [library, setLibrary] = useState<"add" | "replace" | null>(null);
  const [undo, setUndo] = useState<Layout[]>([]);
  const [redo, setRedo] = useState<Layout[]>([]);
  const canvas = useRef<HTMLCanvasElement>(null);
  const workspace = useRef<HTMLDivElement>(null);
  const gesture = useRef<Gesture | null>(null);
  const scale = BASE_PX_PER_MM * zoom;
  const element = shown.elements.find((e) => e.id === selected) ?? null;
  const placed = new Set(shown.elements.filter((e) => e.field).map((e) => e.field!));
  const labelOf = (key: string) => fields.find((f) => f.key === key)?.label ?? key;

  // Draw the label at screen resolution whenever it changes.
  useEffect(() => {
    let current = true;
    void prepare(shown).then((loaded) => {
      if (current && canvas.current) renderLabel(canvas.current, content, shown, size, scale * (window.devicePixelRatio || 1), loaded);
    });
    return () => { current = false; };
  }, [content, shown, size.width, size.height, scale]); // eslint-disable-line react-hooks/exhaustive-deps

  const commit = useCallback((next: Layout, before: Layout = layout) => {
    setUndo((list) => [...list.slice(-80), before]);
    setRedo([]);
    onChange({ ...content, artwork: { font: "sans", panels: {}, ...content.artwork, layout: { ...content.artwork?.layout, unit: fitLayout(next, content) } } });
  }, [content, layout, onChange]);

  const patch = (id: string, changes: Partial<LabelElement>) =>
    commit({ ...layout, elements: layout.elements.map((e) => (e.id === id ? { ...e, ...changes } : e)) });

  function restore(target: Layout | undefined, from: Layout[], to: (update: (list: Layout[]) => Layout[]) => void, back: (update: (list: Layout[]) => Layout[]) => void) {
    if (!target) return;
    back((list) => [...list, layout]);
    to(() => from.slice(0, -1));
    onChange({ ...content, artwork: { font: "sans", panels: {}, ...content.artwork, layout: { ...content.artwork?.layout, unit: target } } });
  }
  const doUndo = () => restore(undo.at(-1), undo, setUndo, setRedo);
  const doRedo = () => restore(redo.at(-1), redo, setRedo, setUndo);

  function add(element: Omit<LabelElement, "id">) {
    const next = { id: newId(), ...element } as LabelElement;
    if (textual(next)) next.h = Math.max(2, textHeight(next, content));
    commit({ ...layout, elements: [...layout.elements, next] });
    setSelected(next.id);
  }
  const frontLeft = size.width / 3 + size.width / 3 * .12;
  const frontWidth = size.width / 3 * .76;
  const ink = inkFor(content, line);
  const addText = () => add({ type: "text", name: "Text", text: "Your text", x: frontLeft, y: size.height * .45, w: frontWidth, h: 5, font: "roboto-condensed", size: 10, color: ink, align: "center" });
  const addField = (key: string) => add({ type: "field", field: key, name: labelOf(key), x: frontLeft, y: size.height * .45, w: frontWidth, h: 5, font: "roboto-condensed", size: 6.5, color: ink, lineHeight: 1.2, ...(key === "nutrition" ? { table: true } : {}) });
  const addShape = (shape: "rect" | "ellipse" | "line") => add({
    type: "shape", shape, name: shape === "rect" ? "Rectangle" : shape === "ellipse" ? "Ellipse" : "Line",
    x: frontLeft, y: size.height * .4, w: frontWidth, h: shape === "line" ? 1 : 20,
    ...(shape === "line" ? { stroke: ink, strokeWidth: .3 } : { fill: content.colors.secondary }), radius: 0,
  });
  function pickImage(url: string, name: string) {
    if (library === "replace" && element) patch(element.id, { src: url, name });
    else {
      const image = new Image();
      image.onload = () => {
        const w = size.width / 3 * .5;
        const h = image.naturalWidth && image.naturalHeight ? Math.min(size.height * .5, (w * image.naturalHeight) / image.naturalWidth) : w;
        add({ type: "image", name, src: url, x: size.width / 2 - w / 2, y: size.height * .15, w, h });
      };
      image.onerror = () => add({ type: "image", name, src: url, x: size.width / 2 - 25, y: size.height * .15, w: 50, h: 50 });
      image.src = url;
    }
    setLibrary(null);
  }

  function remove(id: string) {
    commit({ ...layout, elements: layout.elements.filter((e) => e.id !== id) });
    setSelected(null);
  }
  function duplicate(id: string) {
    const source = layout.elements.find((e) => e.id === id);
    if (!source) return;
    const copy = { ...source, id: newId(), name: `${source.name ?? source.type} copy`, x: source.x + 3, y: source.y + 3, locked: false };
    commit({ ...layout, elements: [...layout.elements, copy] });
    setSelected(copy.id);
  }
  function reorder(id: string, to: "up" | "down" | "top" | "bottom") {
    const list = [...layout.elements];
    const index = list.findIndex((e) => e.id === id);
    const [item] = list.splice(index, 1);
    const target = to === "top" ? list.length : to === "bottom" ? 0 : Math.max(0, Math.min(list.length, index + (to === "up" ? 1 : -1)));
    list.splice(target, 0, item!);
    commit({ ...layout, elements: list });
  }
  function alignTo(id: string, where: "left" | "center" | "right" | "top" | "middle" | "bottom") {
    const e = layout.elements.find((item) => item.id === id);
    if (!e) return;
    const third = size.width / 3;
    const panel = Math.min(2, Math.max(0, Math.floor((e.x + e.w / 2) / third)));
    const left = panel * third;
    const margin = third * .07;
    const changes: Partial<LabelElement> =
      where === "left" ? { x: left + margin } : where === "center" ? { x: left + third / 2 - e.w / 2 } : where === "right" ? { x: left + third - margin - e.w }
        : where === "top" ? { y: size.height * .05 } : where === "middle" ? { y: size.height / 2 - e.h / 2 } : { y: size.height * .95 - e.h };
    patch(id, changes);
  }

  // --- Pointer gestures -------------------------------------------------------------------------

  const toMm = (event: { clientX: number; clientY: number }) => {
    const box = workspace.current!.querySelector(".le-page")!.getBoundingClientRect();
    return { x: (event.clientX - box.left) / scale, y: (event.clientY - box.top) / scale };
  };

  function snapTargets(id: string) {
    const w = size.width;
    const h = size.height;
    const xs = [0, w, w / 3, (2 * w) / 3, w / 6, w / 2, (5 * w) / 6, SAFE_MARGIN, w - SAFE_MARGIN];
    for (const fold of [w / 3, (2 * w) / 3]) xs.push(fold - SAFE_MARGIN, fold + SAFE_MARGIN);
    const ys = [0, h, h / 2, SAFE_MARGIN, h - SAFE_MARGIN];
    for (const other of shown.elements) {
      if (other.id === id || other.hidden) continue;
      xs.push(other.x, other.x + other.w / 2, other.x + other.w);
      ys.push(other.y, other.y + other.h / 2, other.y + other.h);
    }
    return { xs, ys };
  }

  /** Moves a set of edges by the smallest distance that lines one of them up with a target. */
  function snap(edges: number[], targets: number[], threshold: number) {
    let best: { delta: number; at: number } | null = null;
    for (const edge of edges) for (const target of targets) {
      const delta = target - edge;
      if (Math.abs(delta) <= threshold && (!best || Math.abs(delta) < Math.abs(best.delta))) best = { delta, at: target };
    }
    return best;
  }

  function begin(event: ReactPointerEvent, next: Gesture) {
    if (!editable) return;
    event.stopPropagation();
    event.preventDefault();
    (event.target as Element).setPointerCapture?.(event.pointerId);
    gesture.current = next;
    workspace.current?.focus({ preventScroll: true });
  }

  function onPointerMove(event: ReactPointerEvent) {
    const g = gesture.current;
    if (!g) return;
    const point = toMm(event);
    const o = g.origin;
    let changes: Partial<LabelElement> = {};
    const found: Guide[] = [];
    const threshold = 6 / scale; // six screen pixels
    if (g.kind === "move") {
      let x = o.x + point.x - g.start.x;
      let y = o.y + point.y - g.start.y;
      if (event.shiftKey) { // Constrain to one axis.
        if (Math.abs(point.x - g.start.x) > Math.abs(point.y - g.start.y)) y = o.y; else x = o.x;
      }
      if (!event.altKey) {
        const { xs, ys } = snapTargets(g.id);
        const sx = snap([x, x + o.w / 2, x + o.w], xs, threshold);
        const sy = snap([y, y + o.h / 2, y + o.h], ys, threshold);
        if (sx) { x += sx.delta; found.push({ axis: "x", at: sx.at }); }
        if (sy) { y += sy.delta; found.push({ axis: "y", at: sy.at }); }
      }
      changes = { x: round(x, .05), y: round(y, .05) };
    } else if (g.kind === "resize") {
      const dx = point.x - g.start.x;
      const dy = point.y - g.start.y;
      let { x, y, w, h } = o;
      const hd = g.handle;
      if (hd.includes("e")) w = o.w + dx;
      if (hd.includes("w")) { w = o.w - dx; x = o.x + dx; }
      if (hd.includes("s")) h = o.h + dy;
      if (hd.includes("n")) { h = o.h - dy; y = o.y + dy; }
      const corner = hd.length === 2;
      if (corner && (o.type === "image" || event.shiftKey)) { // Keep the proportions.
        const ratio = Math.max(w / o.w, h / o.h);
        w = o.w * ratio;
        h = o.h * ratio;
        if (hd.includes("w")) x = o.x + o.w - w;
        if (hd.includes("n")) y = o.y + o.h - h;
      }
      if (!event.altKey && !o.rotation) {
        const { xs, ys } = snapTargets(g.id);
        if (hd.includes("e")) { const s = snap([x + w], xs, threshold); if (s) { w += s.delta; found.push({ axis: "x", at: s.at }); } }
        if (hd.includes("w")) { const s = snap([x], xs, threshold); if (s) { x += s.delta; w -= s.delta; found.push({ axis: "x", at: s.at }); } }
        if (!textual(o) && hd.includes("s")) { const s = snap([y + h], ys, threshold); if (s) { h += s.delta; found.push({ axis: "y", at: s.at }); } }
        if (!textual(o) && hd.includes("n")) { const s = snap([y], ys, threshold); if (s) { y += s.delta; h -= s.delta; found.push({ axis: "y", at: s.at }); } }
      }
      w = Math.max(1, w);
      h = Math.max(.5, h);
      changes = { x: round(x, .05), y: round(y, .05), w: round(w, .05) };
      if (textual(o)) {
        // Text frames take their height from the wording; a corner scales the type with the frame.
        if (corner) changes.size = Math.max(3, round((o.size ?? 9) * (w / o.w), .1));
        changes.h = textHeight({ ...o, ...changes } as LabelElement, content);
        if (hd.includes("n")) changes.y = round(o.y + o.h - changes.h, .05);
      } else {
        changes.h = round(h, .05);
      }
    } else {
      let angle = (Math.atan2(point.y - g.centre.y, point.x - g.centre.x) * 180) / Math.PI + 90;
      if (angle > 180) angle -= 360;
      angle = event.shiftKey ? Math.round(angle / 15) * 15 : Math.round(angle);
      if (!event.shiftKey) for (const right of [-180, -90, 0, 90, 180]) if (Math.abs(angle - right) < 3) angle = right;
      changes = { rotation: angle === -180 ? 180 : angle };
    }
    setGuides(found);
    setDraft({ ...g.before, elements: g.before.elements.map((e) => (e.id === g.id ? { ...e, ...changes } : e)) });
  }

  function onPointerUp() {
    const g = gesture.current;
    gesture.current = null;
    setGuides([]);
    if (g && draft) commit(draft, g.before);
    setDraft(null);
  }

  // --- Keyboard ---------------------------------------------------------------------------------

  function onKeyDown(event: React.KeyboardEvent) {
    if (!editable || (event.target as HTMLElement).closest("input, textarea, select")) return;
    const mod = event.ctrlKey || event.metaKey;
    if (mod && event.key.toLowerCase() === "z") { event.preventDefault(); if (event.shiftKey) doRedo(); else doUndo(); return; }
    if (mod && event.key.toLowerCase() === "y") { event.preventDefault(); doRedo(); return; }
    if (!element) return;
    if (mod && event.key.toLowerCase() === "d") { event.preventDefault(); duplicate(element.id); return; }
    if (event.key === "Delete" || event.key === "Backspace") { event.preventDefault(); if (!element.locked) remove(element.id); return; }
    if (event.key === "Escape") { setSelected(null); return; }
    const step = event.shiftKey ? 5 : .5;
    const move = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[event.key];
    if (move && !element.locked) {
      event.preventDefault();
      patch(element.id, { x: round(element.x + move[0]!, .05), y: round(element.y + move[1]!, .05) });
    }
  }

  // --- Inspector helpers --------------------------------------------------------------------------

  const num = (label: string, value: number | undefined, onSet: (value: number) => void, opts: { step?: number; min?: number; max?: number; unit?: string } = {}) => (
    <label className="field text-xs">{label}{opts.unit ? ` (${opts.unit})` : ""}
      <input type="number" className="input min-h-9 px-2 text-sm" step={opts.step ?? .1} min={opts.min} max={opts.max}
        value={value === undefined ? "" : Math.round(value * 100) / 100}
        onChange={(e) => { const v = Number(e.target.value); if (e.target.value !== "" && Number.isFinite(v)) onSet(v); }} />
    </label>
  );
  const colour = (label: string, value: string | undefined, onSet: (value: string | undefined) => void, clearable = false) => (
    <label className="field text-xs">{label}
      <span className="flex items-center gap-1">
        <input type="color" className="input min-h-9 w-12 cursor-pointer p-1" value={value ?? "#ffffff"} onChange={(e) => onSet(e.target.value)} />
        <input className="input min-h-9 px-2 font-mono text-xs" value={value ?? ""} placeholder={clearable ? "None" : ""} maxLength={7}
          onChange={(e) => { const v = e.target.value; if (/^#[0-9a-f]{6}$/i.test(v)) onSet(v.toLowerCase()); else if (!v && clearable) onSet(undefined); }} />
        {clearable && value && <button type="button" className="le-tool le-mini" onClick={() => onSet(undefined)} aria-label={`Remove ${label}`}>×</button>}
      </span>
    </label>
  );

  const mm = (value: number) => `${(Math.round(value * 10) / 10).toLocaleString()} mm`;
  const xHeightMm = element && textual(element) ? (element.size ?? 9) * PT * .5 : 0;
  const empty = (e: LabelElement) => e.type === "field" && !content.fields[e.field ?? ""]?.trim();
  const unplaced = fields.filter((f) => !placed.has(f.key) && f.key !== "destinationCountry");

  return (
    <section className="grid gap-3" aria-label="Label editor">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="le-tool" disabled={!editable} onClick={addText}>＋ Text</button>
        <label className="le-tool">＋ Field
          <select className="max-w-40 bg-transparent text-xs" disabled={!editable} value="" onChange={(e) => e.target.value && addField(e.target.value)}>
            <option value="">{unplaced.length ? `${unplaced.length} not on the label` : "Choose"}</option>
            {unplaced.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
            {fields.filter((f) => placed.has(f.key)).map((f) => <option key={f.key} value={f.key}>{f.label} (again)</option>)}
          </select>
        </label>
        <button type="button" className="le-tool" disabled={!editable} onClick={() => setLibrary("add")}>＋ Logo / image</button>
        <button type="button" className="le-tool" disabled={!editable} onClick={() => addShape("rect")}>▭ Box</button>
        <button type="button" className="le-tool" disabled={!editable} onClick={() => addShape("ellipse")}>◯ Ellipse</button>
        <button type="button" className="le-tool" disabled={!editable} onClick={() => addShape("line")}>― Line</button>
        <span className="mx-1 h-6 w-px bg-line" />
        <button type="button" className="le-tool" disabled={!editable || !undo.length} onClick={doUndo} title="Undo (Ctrl+Z)">↶ Undo</button>
        <button type="button" className="le-tool" disabled={!editable || !redo.length} onClick={doRedo} title="Redo (Ctrl+Y)">↷ Redo</button>
        <span className="mx-1 h-6 w-px bg-line" />
        <button type="button" className="le-tool" onClick={() => setZoom((z) => Math.max(.5, round(z - .25, .25)))} aria-label="Zoom out">−</button>
        <button type="button" className="le-tool w-16 justify-center" onClick={() => setZoom(1)} title="Reset zoom">{Math.round(zoom * 100)}%</button>
        <button type="button" className="le-tool" onClick={() => setZoom((z) => Math.min(4, round(z + .25, .25)))} aria-label="Zoom in">+</button>
        <button type="button" className="le-tool" aria-pressed={showGuides} onClick={() => setShowGuides((v) => !v)}>Guides</button>
        {saved && editable && (
          <button type="button" className="le-tool" onClick={() => {
            if (window.confirm("Go back to the market template layout? Your arrangement is replaced (Undo brings it back).")) {
              setUndo((list) => [...list, layout]);
              const next = { ...content.artwork!, layout: { ...content.artwork?.layout } };
              delete next.layout.unit;
              onChange({ ...content, artwork: next });
              setSelected(null);
            }
          }}>Restore template layout</button>
        )}
      </div>

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_19rem]">
        <div ref={workspace} className="le-workspace" tabIndex={0} onKeyDown={onKeyDown}
          onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
          onPointerDown={() => setSelected(null)}>
          <div className="le-page" style={{ width: size.width * scale, height: size.height * scale }}>
            <canvas ref={canvas} role="img" aria-label="Unit label artwork" />
            <div className="le-overlay">
              {showGuides && (<>
                <div className="le-fold" style={{ left: (size.width / 3) * scale }} />
                <div className="le-fold" style={{ left: ((2 * size.width) / 3) * scale }} />
                <div className="le-safe" style={{ inset: SAFE_MARGIN * scale }} />
                {(["back", "front", "right"] as const).map((panel, index) => (
                  <span key={panel} className="le-ruler" style={{ left: (index * size.width / 3) * scale + 4, top: -16 }}>{PANEL_NAMES[panel]}</span>
                ))}
                <span className="le-ruler" style={{ right: 0, bottom: -16 }}>{size.width} × {size.height} mm</span>
              </>)}
              {fontsReady && shown.elements.map((e) => !e.hidden && (
                <div key={e.id} className="le-box" data-selected={e.id === selected} data-locked={Boolean(e.locked)} data-empty={empty(e)}
                  title={e.name ?? (e.field ? labelOf(e.field) : e.type)}
                  style={{ left: e.x * scale, top: e.y * scale, width: e.w * scale, height: e.h * scale, transform: e.rotation ? `rotate(${e.rotation}deg)` : undefined }}
                  onPointerDown={(event) => {
                    event.stopPropagation();
                    setSelected(e.id);
                    if (!e.locked) begin(event, { kind: "move", id: e.id, start: toMm(event), origin: e, before: layout });
                  }}
                  onDoubleClick={() => document.getElementById("le-text")?.focus()}>
                  {e.id === selected && editable && !e.locked && (<>
                    {HANDLES.filter((hd) => !textual(e) || !["n", "s"].includes(hd)).map((hd) => (
                      <span key={hd} className="le-handle" style={{ left: `${HANDLE_POS[hd][0] * 100}%`, top: `${HANDLE_POS[hd][1] * 100}%`, cursor: CURSOR[hd] }}
                        onPointerDown={(event) => begin(event, { kind: "resize", id: e.id, handle: hd, start: toMm(event), origin: e, before: layout })} />
                    ))}
                    <span className="le-rotate" title="Rotate (Shift: 15° steps)"
                      onPointerDown={(event) => begin(event, { kind: "rotate", id: e.id, centre: { x: e.x + e.w / 2, y: e.y + e.h / 2 }, origin: e, before: layout })} />
                  </>)}
                </div>
              ))}
              {guides.map((g, index) => (
                <div key={index} className="le-guide" style={g.axis === "x"
                  ? { left: g.at * scale, top: -20, bottom: -20, width: 1 }
                  : { top: g.at * scale, left: -20, right: -20, height: 1 }} />
              ))}
            </div>
          </div>
        </div>

        <aside className="grid content-start gap-3 rounded-xl border border-line bg-sand/40 p-3 text-sm">
          {element ? (
            <fieldset className="grid gap-3" disabled={!editable}>
              <div className="flex items-center justify-between gap-2">
                <input className="input min-h-9 px-2 text-sm font-semibold" aria-label="Element name" maxLength={60}
                  value={element.name ?? ""} placeholder={element.field ? labelOf(element.field) : element.type}
                  onChange={(e) => patch(element.id, { name: e.target.value })} />
                <button type="button" className="le-tool le-mini" onClick={() => setSelected(null)} aria-label="Deselect">✕</button>
              </div>
              {element.type === "field" && (
                <label className="field text-xs">{labelOf(element.field ?? "")} <span className="font-normal text-mid">(the same text as in the form)</span>
                  <textarea id="le-text" className="input py-1.5 text-sm" rows={4} maxLength={2000} value={content.fields[element.field ?? ""] ?? ""}
                    onChange={(e) => {
                      const next = { ...content, fields: { ...content.fields, [element.field!]: e.target.value } };
                      onChange({ ...next, artwork: { font: "sans", panels: {}, ...next.artwork, layout: { ...next.artwork?.layout, unit: fitLayout(layout, next) } } });
                    }} />
                </label>
              )}
              {element.type === "text" && (
                <label className="field text-xs">Text
                  <textarea id="le-text" className="input py-1.5 text-sm" rows={3} maxLength={2000} value={element.text ?? ""}
                    onChange={(e) => patch(element.id, { text: e.target.value })} />
                </label>
              )}
              <div className="grid grid-cols-2 gap-2">
                {num("X", element.x, (v) => patch(element.id, { x: v }), { unit: "mm" })}
                {num("Y", element.y, (v) => patch(element.id, { y: v }), { unit: "mm" })}
                {num("Width", element.w, (v) => patch(element.id, { w: Math.max(1, v) }), { unit: "mm", min: 1 })}
                {textual(element) ? <p className="self-end pb-2 text-xs text-mid">Height {mm(element.h)} (fits the text)</p>
                  : num("Height", element.h, (v) => patch(element.id, { h: Math.max(.5, v) }), { unit: "mm", min: .5 })}
                {num("Rotation", element.rotation ?? 0, (v) => patch(element.id, { rotation: Math.max(-360, Math.min(360, v)) }), { unit: "°", step: 1 })}
                {num("Opacity", Math.round((element.opacity ?? 1) * 100), (v) => patch(element.id, { opacity: Math.max(0, Math.min(1, v / 100)) }), { unit: "%", step: 5, min: 0, max: 100 })}
              </div>

              {textual(element) && (<>
                <label className="field text-xs">Typeface
                  <select className="input min-h-9 px-2 text-sm" value={element.font ?? "roboto-condensed"} onChange={(e) => patch(element.id, { font: e.target.value })}>
                    {[...new Set(FONTS.map((f) => f.group))].map((group) => (
                      <optgroup key={group} label={group}>
                        {FONTS.filter((f) => f.group === group).map((f) => <option key={f.key} value={f.key} style={{ fontFamily: f.family }}>{f.label}</option>)}
                      </optgroup>
                    ))}
                  </select>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {num("Size", element.size ?? 9, (v) => patch(element.id, { size: Math.max(3, Math.min(300, v)) }), { unit: "pt", step: .5, min: 3 })}
                  <label className="field text-xs">Weight
                    <select className="input min-h-9 px-2 text-sm" value={element.weight ?? 400} onChange={(e) => patch(element.id, { weight: Number(e.target.value) as LabelElement["weight"] })}>
                      <option value={400}>Regular</option><option value={500}>Medium</option><option value={600}>Semibold</option><option value={700}>Bold</option>
                    </select>
                  </label>
                  {num("Line height", element.lineHeight ?? 1.22, (v) => patch(element.id, { lineHeight: Math.max(.7, Math.min(3, v)) }), { step: .05 })}
                  {num("Letter spacing", Math.round((element.tracking ?? 0) * 1000), (v) => patch(element.id, { tracking: Math.max(-.1, Math.min(.6, v / 1000)) }), { step: 10, unit: "‰" })}
                </div>
                <p className="text-xs text-mid">Letters about {mm(xHeightMm)} high (x-height). Market minimums are checked in the checklist.</p>
                <div className="flex flex-wrap gap-1">
                  {(["left", "center", "right"] as const).map((a) => (
                    <button key={a} type="button" className="le-tool le-mini" aria-pressed={(element.align ?? "left") === a} onClick={() => patch(element.id, { align: a })}>
                      {a === "left" ? "⟸" : a === "center" ? "≡" : "⟹"}<span className="sr-only">Align {a}</span>
                    </button>
                  ))}
                  <button type="button" className="le-tool le-mini font-bold" aria-pressed={(element.weight ?? 400) >= 700} onClick={() => patch(element.id, { weight: (element.weight ?? 400) >= 700 ? 400 : 700 })}>B</button>
                  <button type="button" className="le-tool le-mini italic" aria-pressed={Boolean(element.italic)} onClick={() => patch(element.id, { italic: !element.italic })}>I</button>
                  <button type="button" className="le-tool le-mini" aria-pressed={Boolean(element.uppercase)} onClick={() => patch(element.id, { uppercase: !element.uppercase })}>AA</button>
                  <button type="button" className="le-tool le-mini" aria-pressed={Boolean(element.table)} onClick={() => patch(element.id, { table: !element.table })} title="Two columns: text, tab, value">Table</button>
                </div>
                {colour("Text colour", element.color, (v) => patch(element.id, { color: v ?? "#1c1a16" }))}
                <div className="grid grid-cols-2 gap-2">
                  {colour("Box fill", element.fill, (v) => patch(element.id, { fill: v }), true)}
                  {num("Box padding", element.padding ?? 0, (v) => patch(element.id, { padding: Math.max(0, Math.min(20, v)) }), { unit: "mm", min: 0 })}
                </div>
              </>)}

              {element.type === "shape" && (<>
                <div className="flex gap-1">
                  {(["rect", "ellipse", "line"] as const).map((s) => (
                    <button key={s} type="button" className="le-tool le-mini" aria-pressed={(element.shape ?? "rect") === s} onClick={() => patch(element.id, { shape: s })}>
                      {s === "rect" ? "Box" : s === "ellipse" ? "Ellipse" : "Line"}
                    </button>
                  ))}
                </div>
                {element.shape !== "line" && colour("Fill", element.fill, (v) => patch(element.id, { fill: v }), true)}
                {colour("Outline", element.stroke, (v) => patch(element.id, { stroke: v }), true)}
                <div className="grid grid-cols-2 gap-2">
                  {num("Outline width", element.strokeWidth ?? .3, (v) => patch(element.id, { strokeWidth: Math.max(0, Math.min(20, v)) }), { unit: "mm", step: .05, min: 0 })}
                  {element.shape !== "line" && element.shape !== "ellipse" && num("Corner radius", element.radius ?? 0, (v) => patch(element.id, { radius: Math.max(0, Math.min(100, v)) }), { unit: "mm", min: 0 })}
                </div>
              </>)}

              {element.type === "image" && (
                <button type="button" className="le-tool justify-self-start" onClick={() => setLibrary("replace")}>Replace image…</button>
              )}

              <div className="grid gap-1">
                <span className="text-xs font-medium">Align on its panel</span>
                <div className="flex flex-wrap gap-1">
                  {(["left", "center", "right", "top", "middle", "bottom"] as const).map((where) => (
                    <button key={where} type="button" className="le-tool le-mini capitalize" disabled={element.locked} onClick={() => alignTo(element.id, where)}>{where}</button>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                <button type="button" className="le-tool le-mini" onClick={() => reorder(element.id, "top")} title="Bring to front">⇈</button>
                <button type="button" className="le-tool le-mini" onClick={() => reorder(element.id, "up")} title="Bring forward">↑</button>
                <button type="button" className="le-tool le-mini" onClick={() => reorder(element.id, "down")} title="Send backward">↓</button>
                <button type="button" className="le-tool le-mini" onClick={() => reorder(element.id, "bottom")} title="Send to back">⇊</button>
                <button type="button" className="le-tool le-mini" aria-pressed={Boolean(element.locked)} onClick={() => patch(element.id, { locked: !element.locked })}>{element.locked ? "Locked" : "Lock"}</button>
                <button type="button" className="le-tool le-mini" onClick={() => duplicate(element.id)} title="Duplicate (Ctrl+D)">Duplicate</button>
                <button type="button" className="le-tool le-mini text-danger" disabled={element.locked} onClick={() => remove(element.id)} title="Delete">Delete</button>
              </div>
            </fieldset>
          ) : (
            <fieldset className="grid gap-3" disabled={!editable}>
              <p className="text-xs text-mid">Click a block on the label to edit it. Drag to move, use the handles to resize or rotate. Arrow keys nudge 0.5 mm (Shift: 5 mm), Alt turns snapping off.</p>
              <h3 className="text-xs font-semibold">Panel backgrounds</h3>
              {(["back", "front", "right"] as const).map((panel) => (
                <div key={panel}>{colour(PANEL_NAMES[panel], shown.backgrounds?.[panel] ?? content.colors.primary, (v) =>
                  commit({ ...layout, backgrounds: { ...layout.backgrounds, [panel]: v ?? content.colors.primary } }))}</div>
              ))}
              <button type="button" className="le-tool justify-self-start" onClick={() =>
                commit({ ...layout, backgrounds: { back: shown.backgrounds?.front ?? content.colors.primary, front: shown.backgrounds?.front ?? content.colors.primary, right: shown.backgrounds?.front ?? content.colors.primary } })}>
                Use the front colour on all panels
              </button>
            </fieldset>
          )}

          <div className="grid gap-1 border-t border-line pt-3">
            <h3 className="text-xs font-semibold">Layers</h3>
            <ul className="grid max-h-64 gap-0.5 overflow-auto" role="listbox" aria-label="Layers">
              {[...shown.elements].reverse().map((e) => (
                <li key={e.id} className="le-layer" role="option" aria-selected={e.id === selected} onClick={() => setSelected(e.id)}>
                  <span className="w-4 text-center text-xs text-mid">{e.type === "image" ? "▣" : e.type === "shape" ? "▭" : e.type === "field" ? "¶" : "T"}</span>
                  <span className={`flex-1 truncate ${e.hidden ? "text-mid line-through" : ""} ${empty(e) ? "text-danger" : ""}`}>
                    {e.name || (e.field ? labelOf(e.field) : e.text?.slice(0, 30) || e.type)}
                  </span>
                  {editable && (<>
                    <button type="button" title={e.hidden ? "Show" : "Hide"} onClick={(event) => { event.stopPropagation(); patch(e.id, { hidden: !e.hidden }); }}>{e.hidden ? "◌" : "●"}</button>
                    <button type="button" title={e.locked ? "Unlock" : "Lock"} onClick={(event) => { event.stopPropagation(); patch(e.id, { locked: !e.locked }); }}>{e.locked ? "🔒" : "🔓"}</button>
                  </>)}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {library && <AssetLibrary onPick={pickImage} onClose={() => setLibrary(null)}
        extra={[{ name: "Oussoul mark", url: oussoulMark.src }]} />}
    </section>
  );
}
