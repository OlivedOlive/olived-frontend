import type { Metadata } from "next";
import { Suspense } from "react";
import { LabelPreview } from "@/components/studio/LabelPreview";
import { Loading } from "@/components/studio/Loading";
import { ReviewActions } from "@/components/studio/ReviewActions";
import { apiGet } from "@/lib/studio/api";
import type { ReviewDesign } from "@/lib/studio/types";

export const metadata: Metadata = { title: "Review" };

export default function ReviewPage() {
  return (
    <div className="grid gap-6">
      <h1 className="text-4xl">Waiting for review</h1>
      <Suspense fallback={<Loading label="Loading designs to review…" />}>
        <ReviewQueue />
      </Suspense>
    </div>
  );
}

async function ReviewQueue() {
  const { designs } = await apiGet<{ designs: ReviewDesign[] }>("/review/designs");

  if (designs.length === 0) return <p className="text-mid">Nothing is waiting for review.</p>;

  return designs.map((design) => {
    const content = design.versions[0]?.content;
    return (
      <article key={design.id} className="card grid gap-6 md:grid-cols-2">
        <div className="grid content-start gap-4">
          <div>
            <h2 className="text-2xl">{design.name}</h2>
            <p className="text-sm text-mid">
              {design.organization.name}, {design.template.name}, {design.market.name}
            </p>
          </div>
          <ReviewActions designId={design.id} />
        </div>
        {content && (
          <LabelPreview
            content={content}
            requiredFields={design.market.ruleSets[0]?.rules.requiredFields ?? []}
            widthMm={Number(design.template.widthMm)}
            heightMm={Number(design.template.heightMm)}
          />
        )}
      </article>
    );
  });
}
