"use client";

import { useId, useState, type KeyboardEvent, type ReactNode } from "react";

export interface GradeTab {
  id: string;
  label: string;
  content: ReactNode;
}

/** Accessible tabs (WAI-ARIA tab pattern) styled with the original .grade-tab / .grade-panel classes. */
export function GradeTabs({ tabs }: { tabs: GradeTab[] }) {
  const [active, setActive] = useState(0);
  const uid = useId();

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = (active + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
    setActive(next);
    document.getElementById(`${uid}-tab-${next}`)?.focus();
  };

  return (
    <>
      <div className="grade-tabs" role="tablist" aria-label="Olive oil grade">
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            id={`${uid}-tab-${i}`}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-controls={`${uid}-panel-${i}`}
            tabIndex={i === active ? 0 : -1}
            className={i === active ? "grade-tab active" : "grade-tab"}
            onClick={() => setActive(i)}
            onKeyDown={onKeyDown}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, i) => (
        <div
          key={tab.id}
          id={`${uid}-panel-${i}`}
          role="tabpanel"
          aria-labelledby={`${uid}-tab-${i}`}
          hidden={i !== active}
          className={i === active ? "grade-panel active" : "grade-panel"}
        >
          {tab.content}
        </div>
      ))}
    </>
  );
}
