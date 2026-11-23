import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminDeleteAction } from "@/components/studio/AdminDeleteAction";
import { AdminUsers } from "@/components/studio/AdminUsers";
import { ReviewPreview } from "@/components/studio/PackagingPreview";
import { Loading } from "@/components/studio/Loading";
import { ReviewActions } from "@/components/studio/ReviewActions";
import { PAGE_MAX, ShowMore, shownCount } from "@/components/studio/ShowMore";
import { StatusBadge } from "@/components/studio/StatusBadge";
import { ValidateDesignButton } from "@/components/studio/ValidateDesignButton";
import { apiGet } from "@/lib/studio/api";
import type { DesignStatus, ReviewDesign } from "@/lib/studio/types";

type AdminDesign = ReviewDesign & { createdBy: { name: string; email: string } };
type Query = Awaited<PageProps<"/studio/admin">["searchParams"]>;
type DesignPage = { designs: AdminDesign[]; total: number };

/** The lists that grow over time, each with its own "Show more" (`?approved=24`). */
const PAGED_GROUPS: { title: string; status: DesignStatus; param: string; empty: string }[] = [
  { title: "Changes requested", status: "CHANGES_REQUESTED", param: "changes", empty: "No designs." },
  { title: "Approved", status: "APPROVED", param: "approved", empty: "No designs." },
  { title: "Drafts", status: "DRAFT", param: "drafts", empty: "No designs." },
];
export const metadata: Metadata = { title: "Admin dashboard" };

export default function AdminPage({ searchParams }: PageProps<"/studio/admin">) {
  return (
    <div className="grid gap-6">
      <h1 className="text-4xl">Admin dashboard</h1>
      <nav aria-label="Admin sections" className="flex gap-5 text-sm font-medium">
        <a href="#users" className="underline">Users</a>
        <a href="#design-requests" className="underline">Design requests</a>
      </nav>
      <Suspense fallback={<Loading label="Loading users…" />}>
        <AdminUsers searchParams={searchParams} />
      </Suspense>
      <h2 id="design-requests" className="text-3xl">Design requests</h2>
      <Suspense fallback={<Loading label="Loading client designs…" />}>
        <Dashboard searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

/**
 * Submitted designs are the work queue, so they come in one request (up to the server's limit) and
 * split by their check result. The other lists load a page at a time.
 */
async function Dashboard({ searchParams }: { searchParams: Promise<Query> }) {
  const query = await searchParams;
  const [submitted, ...paged] = await Promise.all([
    apiGet<DesignPage>(`/admin/designs?status=SUBMITTED&take=${PAGE_MAX}`),
    ...PAGED_GROUPS.map((group) =>
      apiGet<DesignPage>(`/admin/designs?status=${group.status}&take=${shownCount(query, group.param)}`),
    ),
  ]);
  const passed = (design: AdminDesign) => design.versions[0]?.validationResults[0]?.passed;

  return (
    <>
      <DesignGroup title="Ready for review" id="ready" designs={submitted.designs.filter(passed)}
        empty="Submitted designs appear here after passing validation." />
      <DesignGroup title="Awaiting validation" id="awaiting" designs={submitted.designs.filter((d) => !passed(d))} empty="No designs." />
      {submitted.total > submitted.designs.length && (
        <p className="text-sm text-mid">Showing the latest {submitted.designs.length} of {submitted.total} submitted designs.</p>
      )}
      {PAGED_GROUPS.map((group, i) => (
        <DesignGroup key={group.status} title={group.title} id={group.param} designs={paged[i].designs}
          total={paged[i].total} empty={group.empty}>
          <ShowMore query={query} param={group.param} shown={paged[i].designs.length} total={paged[i].total} anchor={group.param} />
        </DesignGroup>
      ))}
    </>
  );
}

function DesignGroup({ title, id, designs, total = designs.length, empty, children }: {
  title: string;
  id: string;
  designs: AdminDesign[];
  total?: number;
  empty: string;
  children?: React.ReactNode;
}) {
  return (
    <section id={id} className="grid scroll-mt-24 gap-4">
      <h2 className="text-2xl">{title} <span className="text-sm text-mid">({total})</span></h2>
      {designs.length === 0 && <p className="text-sm text-mid">{empty}</p>}
      {designs.map((design) => <DesignCard key={design.id} design={design} />)}
      {children}
    </section>
  );
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
