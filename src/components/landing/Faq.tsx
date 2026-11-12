"use client";

import { useState } from "react";

/** Questions with one answer open at a time. */
export function Faq({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState(0);
  return (
    <ul className="ld-faq" data-rv-group>
      {items.map((item, i) => {
        const isOpen = i === open;
        return (
          <li key={item.q} data-rv data-open={isOpen ? "" : undefined}>
            <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? -1 : i)}>
              <span>{item.q}</span>
              <i aria-hidden="true" />
            </button>
            <div className="ld-faq-body">
              <div>
                <p>{item.a}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
