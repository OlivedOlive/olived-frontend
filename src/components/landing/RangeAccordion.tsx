"use client";

import Image, { type StaticImageData } from "next/image";
import { useState, type ReactNode } from "react";
import { icons } from "./parts";

type Row = { name: string; role: string; use: string; text: string; detail: string };

/**
 * The ORZETA range: packaging tabs on top, one row per signature below. One row is open at a
 * time; the tabs change the formats shown in the open row.
 */
export function RangeAccordion({
  rows,
  images,
  tabs,
  formats,
  useLabel,
  formatsLabel,
  heading,
  button,
}: {
  rows: Row[];
  images: StaticImageData[];
  tabs: string[];
  formats: string[];
  useLabel: string;
  formatsLabel: string;
  heading: ReactNode;
  button: ReactNode;
}) {
  const [open, setOpen] = useState(0);
  const [tab, setTab] = useState(0);
  const stages = ["ld-stage-sun", "ld-stage-grove", "ld-stage-organic"];

  return (
    <>
      <div className="ld-head" data-rv-group>
        {heading}
        <div className="ld-head-side" data-rv>
          <div className="ld-tabs" role="tablist">
            {tabs.map((label, i) => (
              <button key={label} type="button" role="tab" aria-selected={i === tab} onClick={() => setTab(i)}>
                {label}
              </button>
            ))}
          </div>
          {button}
        </div>
      </div>

      <ul className="ld-rows" data-rv-group>
        {rows.map((row, i) => {
          const isOpen = i === open;
          return (
            <li key={row.name} data-rv data-open={isOpen ? "" : undefined}>
              <button type="button" className="ld-row" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? -1 : i)}>
                <span className="ld-row-name">{row.name}</span>
                <span>{row.role}</span>
                <span>{row.use}</span>
                <i aria-hidden="true">→</i>
              </button>
              <div className="ld-row-body">
                <div>
                  <div className="ld-row-inner">
                    <div className={`ld-row-photo ${stages[i]}`}>
                      <Image src={images[i]} alt="" sizes="160px" />
                    </div>
                    <div className="ld-row-copy">
                      <p>{row.text}</p>
                      <dl>
                        <div>
                          <dt>
                            <i>{icons.leaf}</i>
                            {useLabel}
                          </dt>
                          <dd>{row.detail}</dd>
                        </div>
                        <div>
                          <dt>
                            <i>{icons.check}</i>
                            {formatsLabel} · {tabs[tab]}
                          </dt>
                          <dd>{formats[tab]}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
