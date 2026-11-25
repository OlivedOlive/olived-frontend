"use client";

/** The steps of a packaging project, from choosing the product to the final 3D check. */
export const PROJECT_STEPS = [
  { id: "product", title: "Product" },
  { id: "details", title: "Details" },
  { id: "front", title: "Front" },
  { id: "sides", title: "Left & right sides" },
  { id: "review", title: "3D check & submit" },
] as const;
export type ProjectStep = (typeof PROJECT_STEPS)[number]["id"];

/** The step bar at the top of the project. Steps that can be opened are buttons. */
export function Steps({ current, onSelect, available }: {
  current: ProjectStep;
  onSelect?: (step: ProjectStep) => void;
  /** Steps the client can open from here. */
  available: ProjectStep[];
}) {
  const index = PROJECT_STEPS.findIndex((step) => step.id === current);
  return (
    <nav aria-label="Project steps">
      <ol className="studio-steps">
        {PROJECT_STEPS.map((step, n) => {
          const state = n < index ? "done" : n === index ? "current" : "next";
          const open = available.includes(step.id) && step.id !== current && onSelect;
          const label = (
            <>
              <span className="studio-step-number" aria-hidden="true">{state === "done" ? "✓" : n + 1}</span>
              <span>{step.title}</span>
            </>
          );
          return (
            <li key={step.id} data-state={state} aria-current={state === "current" ? "step" : undefined}>
              {open ? <button type="button" onClick={() => onSelect(step.id)}>{label}</button> : <span>{label}</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
