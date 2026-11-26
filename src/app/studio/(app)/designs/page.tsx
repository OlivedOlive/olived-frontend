import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { LabelThumb } from "@/components/studio/LabelThumb";
import { Loading } from "@/components/studio/Loading";
import { apiGet } from "@/lib/studio/api";
import type { DesignContent, DesignStatus, DesignSummary } from "@/lib/studio/types";

export const metadata: Metadata = { title: "Designs" };

/** A project as the list sends it: with its latest content, to draw the label picture. */
type Project = DesignSummary & { versions?: { number: number; content: DesignContent; createdAt: string }[] };

const STATUS: Record<DesignStatus, { label: string; tone: string; action: string }> = {
  DRAFT: { label: "Draft", tone: "draft", action: "Continue designing" },
  SUBMITTED: { label: "In review", tone: "review", action: "View" },
  CHANGES_REQUESTED: { label: "Changes needed", tone: "changes", action: "Make the changes" },
  APPROVED: { label: "Approved", tone: "approved", action: "View" },
};

const updated = (value: string) => {
  const days = Math.floor((Date.now() - new Date(value).getTime()) / 86400000);
  if (days <= 0) return "Updated today";
  if (days === 1) return "Updated yesterday";
  if (days < 7) return `Updated ${days} days ago`;
  return `Updated ${new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;
};

export default function DesignsPage() {
  return (
    <div className="grid gap-6">
      <Suspense fallback={<Loading label="Loading your designs…" />}>
        <DesignList />
      </Suspense>
    </div>
  );
}

async function DesignList() {
  // "Updated 3 days ago" depends on today's date, so this list is rendered when the page is opened.
  await connection();
  const { designs } = await apiGet<{ designs: Project[] }>("/designs");
  const count = (status: DesignStatus) => designs.filter((d) => d.status === status).length;

  return (
    <>
      <div className="studio-launch studio-projects-hero">
        <div className="grid gap-3">
          <h1 className="max-w-xl text-5xl sm:text-6xl">Your packaging projects</h1>
          {designs.length > 0 && (
            <p className="studio-projects-summary">
              <span>{designs.length} project{designs.length > 1 ? "s" : ""}</span>
              {count("CHANGES_REQUESTED") > 0 && <span data-tone="changes">{count("CHANGES_REQUESTED")} need changes</span>}
              {count("SUBMITTED") > 0 && <span data-tone="review">{count("SUBMITTED")} in review</span>}
              {count("APPROVED") > 0 && <span data-tone="approved">{count("APPROVED")} approved</span>}
            </p>
          )}
        </div>
        <Link href="/studio/designs/new" className="btn bg-paper text-ink">＋ New design</Link>
      </div>

      {designs.length === 0 ? (
        <Link href="/studio/designs/new" className="studio-project-new studio-project-empty">
          <span className="studio-project-plus" aria-hidden="true">＋</span>
          <span className="text-lg font-semibold">Start your first design</span>
          <span className="text-sm text-mid">Choose a product and a market; the label starts with that market&apos;s required wording.</span>
        </Link>
      ) : (
        <ul className="studio-projects">
          <li>
            <Link href="/studio/designs/new" className="studio-project-new">
              <span className="studio-project-plus" aria-hidden="true">＋</span>
              <span className="font-semibold">New design</span>
              <span className="text-xs text-mid">Product, details, front, sides, 3D check</span>
            </Link>
          </li>
          {designs.map((design) => {
            const status = STATUS[design.status];
            const content = design.versions?.[0]?.content;
            return (
              <li key={design.id}>
                <Link href={`/studio/designs/${design.id}`} className="studio-project" data-tone={status.tone}>
                  <span className="studio-project-art">
                    {content ? <LabelThumb content={content} template={design.template} /> : <span className="text-sm text-mid">No artwork yet</span>}
                    <span className="studio-project-status" data-tone={status.tone}>{status.label}</span>
                  </span>
                  <span className="studio-project-body">
                    <span className="studio-project-name">{design.name}</span>
                    <span className="text-sm text-mid">{design.template.variant.product.name} · {design.template.variant.name}</span>
                    <span className="studio-project-meta">
                      <span className="studio-project-market">{design.market.code} · {design.market.name}</span>
                      <span className="text-xs text-mid">{updated(design.updatedAt)}</span>
                    </span>
                    <span className="studio-project-action">{status.action} →</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
