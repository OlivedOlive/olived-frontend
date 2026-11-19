import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminDeleteAction } from "@/components/studio/AdminDeleteAction";
import { AdminUsers } from "@/components/studio/AdminUsers";
import { ReviewPreview } from "@/components/studio/PackagingPreview";
import { Loading } from "@/components/studio/Loading";
import { ReviewActions } from "@/components/studio/ReviewActions";
import { StatusBadge } from "@/components/studio/StatusBadge";
import { ValidateDesignButton } from "@/components/studio/ValidateDesignButton";
import { apiGet } from "@/lib/studio/api";
import type { ReviewDesign } from "@/lib/studio/types";

type AdminDesign = ReviewDesign & { createdBy: { name: string; email: string } };
export const metadata: Metadata = { title: "Admin dashboard" };

export default function AdminPage() {
  return (
    <div className="grid gap-6">
      <h1 className="text-4xl">Admin dashboard</h1>
      <nav aria-label="Admin sections" className="flex gap-5 text-sm font-medium">
        <a href="#users" className="underline">Users</a>
        <a href="#design-requests" className="underline">Design requests</a>
      </nav>
      <Suspense fallback={<Loading label="Loading users…" />}>
        <AdminUsers />
      </Suspense>
      <h2 id="design-requests" className="text-3xl">Design requests</h2>
      <Suspense fallback={<Loading label="Loading client designs…" />}>
        <Dashboard />
      </Suspense>
    </div>
  );
}

async function Dashboard() {
  const { designs } = await apiGet<{ designs: AdminDesign[] }>("/admin/designs");
  const waiting = designs.filter((design) => design.status === "SUBMITTED");
  const groups = [
    { title: "Ready for review", designs: waiting.filter((design) => design.versions[0]?.validationResults[0]?.passed) },
    { title: "Awaiting validation", designs: waiting.filter((design) => !design.versions[0]?.validationResults[0]?.passed) },
    { title: "Changes requested", designs: designs.filter((design) => design.status === "CHANGES_REQUESTED") },
    { title: "Approved", designs: designs.filter((design) => design.status === "APPROVED") },
    { title: "Drafts", designs: designs.filter((design) => design.status === "DRAFT") },
  ];

  return groups.map((group) => (
    <section key={group.title} className="grid gap-4">
      <h2 className="text-2xl">{group.title} <span className="text-sm text-mid">({group.designs.length})</span></h2>
      {group.designs.length === 0 && <p className="text-sm text-mid">
        {group.title === "Ready for review" ? "Submitted designs appear here after passing validation." : "No designs."}
      </p>}
      {group.designs.map((design) => <DesignCard key={design.id} design={design} />)}
    </section>
  ));
}

function DesignCard({ design }: { design: AdminDesign }) {
  const version = design.versions[0];
  const content = version?.content;
  const validation = version?.validationResults[0];
  const comment = version?.approvals[0]?.comment;

  return (
    <article id={"design-" + design.id} className="card grid gap-6 md:grid-cols-2">
      <div className="grid content-start gap-3">
        <div>
          <h3 className="text-xl">{design.name}</h3>
          <p className="text-sm text-mid">{design.organization.name} · {design.template.name} · {design.market.name}</p>
        </div>
        <StatusBadge status={design.status} />
        <p className="text-sm text-mid">Created by {design.createdBy.name} · {design.createdBy.email}</p>
        {(content?.fields.saleLocation || content?.fields.salesChannel) && <p className="text-sm text-mid">Sales destination: {[design.market.name, content.fields.saleLocation, content.fields.salesChannel].filter(Boolean).join(" · ")}</p>}
        {version && (
          <p className="text-sm">
            Version {version.number} · {validation ? (validation.passed ? "Checklist complete" : "Checklist incomplete") : "No market-check result"}
          </p>
        )}
        {!!validation?.issues.length && (
          <ul className="list-disc pl-5 text-sm text-danger">
            {validation.issues.map((issue) => <li key={issue.field}>{issue.message}</li>)}
          </ul>
        )}
        {comment && <p className="whitespace-pre-wrap break-words text-sm">Message to client: {comment}</p>}
        {design.status === "SUBMITTED" && version && validation?.passed && (
          <ReviewActions key={version.id} designId={design.id} versionId={version.id} admin />
        )}
        {design.status === "SUBMITTED" && version && !validation && (
          <ValidateDesignButton key={version.id} designId={design.id} versionId={version.id} />
        )}
        <AdminDeleteAction id={design.id} type="design" name={design.name} />
      </div>
      {version && (
        <ReviewPreview content={version.content} template={design.template} marketCode={design.market.code} />
      )}
    </article>
  );
}
