import { AdminDeleteAction } from "@/components/studio/AdminDeleteAction";
import { DesignMessages } from "@/components/studio/DesignMessages";
import { ReviewPreview } from "@/components/studio/PackagingPreview";
import { ReviewActions } from "@/components/studio/ReviewActions";
import { ValidateDesignButton } from "@/components/studio/ValidateDesignButton";
import type { DesignStatus, ReviewDesign } from "@/lib/studio/types";

export type AdminDesign = ReviewDesign & { createdBy: { name: string; email: string } };

const STATUS: Record<DesignStatus, { label: string; tone: string; text: string }> = {
  DRAFT: { label: "Draft", tone: "draft", text: "The client is still working on this design and has not submitted it." },
  SUBMITTED: { label: "Submitted", tone: "review", text: "The client sent this design for review." },
  CHANGES_REQUESTED: { label: "Changes requested", tone: "changes", text: "Sent back to the client with your message." },
  APPROVED: { label: "Approved", tone: "approved", text: "Approved for printing." },
};

/** One labelled box of facts. */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="admin-section">
      <h2 className="admin-section-title">{title}</h2>
      {children}
    </section>
  );
}

/** Label and value rows; empty values are left out. */
function Facts({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <dl className="admin-facts-list">
      {rows.filter(([, value]) => value !== undefined && value !== null && value !== "").map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Everything about one design for the admin: status, client, product, sale, check, decision and the preview. */
export function AdminDesignCard({ design }: { design: AdminDesign }) {
  const version = design.versions[0];
  const fields = version?.content.fields ?? {};
  const validation = version?.validationResults[0];
  const approval = version?.approvals[0];
  const status = STATUS[design.status];
  const canDecide = design.status === "SUBMITTED" && version && validation?.passed;
  const needsCheck = design.status === "SUBMITTED" && version && !validation;
  const updated = new Date(design.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <article id={"design-" + design.id} className="admin-detail">
      <div className="admin-detail-info">
        <div className="admin-status-card" data-tone={status.tone}>
          <span className="admin-status-dot" aria-hidden="true" />
          <div className="grid gap-0.5">
            <strong>{status.label}</strong>
            <span>{status.text}</span>
            <span className="admin-status-meta">Version {version?.number ?? 0} · last change {updated}</span>
          </div>
        </div>

        {canDecide && (
          <Section title="Your decision">
            <ReviewActions key={version.id} designId={design.id} versionId={version.id} admin />
          </Section>
        )}
        <Section title="Market check">
          {!validation ? (
            <>
              <p className="admin-check" data-tone="none">This version has not been checked against the market rules yet.</p>
              {needsCheck && <ValidateDesignButton key={version.id} designId={design.id} versionId={version.id} />}
            </>
          ) : validation.issues.length === 0 ? (
            <p className="admin-check" data-tone="good">✓ Every required check passes for {design.market.name}.</p>
          ) : (
            <>
              <p className="admin-check" data-tone={validation.passed ? "warn" : "bad"}>
                {validation.passed ? "Checklist complete, with points to confirm:" : `${validation.issues.length} point${validation.issues.length > 1 ? "s" : ""} to fix:`}
              </p>
              <ul className="admin-issues">
                {validation.issues.map((issue, index) => (
                  <li key={`${issue.field}-${index}`} data-tone={issue.severity === "warning" ? "warn" : "bad"}>
                    <span aria-hidden="true">{issue.severity === "warning" ? "!" : "✕"}</span>
                    {issue.message}
                  </li>
                ))}
              </ul>
            </>
          )}
        </Section>

        {approval?.comment && (
          <Section title={approval.decision === "APPROVED" ? "Message sent with the approval" : "Changes asked of the client"}>
            <blockquote className="admin-quote">{approval.comment}</blockquote>
          </Section>
        )}

        <DesignMessages path={`/admin/designs/${design.id}`} side="staff" />

        <div className="admin-sections">
          <Section title="Client">
            <Facts rows={[
              ["Company", design.organization.name],
              ["Created by", design.createdBy.name],
              ["Email", <a key="email" href={`mailto:${design.createdBy.email}`} className="underline-offset-2 hover:underline">{design.createdBy.email}</a>],
            ]} />
          </Section>
          <Section title="Product">
            <Facts rows={[
              ["Product", design.template.variant.product.name],
              ["Bottle", design.template.variant.name],
              ["Packaging", design.template.name],
              ["Label size", Number(design.template.widthMm) ? `${Number(design.template.widthMm)} × ${Number(design.template.heightMm)} mm` : ""],
            ]} />
          </Section>
          <Section title="Sale">
            <Facts rows={[
              ["Market", `${design.market.name} (${design.market.code})`],
              ["Languages", design.market.languages.join(" / ")],
              ["Sold at", fields.saleLocation],
              ["Channel", fields.salesChannel],
            ]} />
          </Section>
        </div>

        <details className="admin-danger">
          <summary>Delete this design</summary>
          <p className="text-sm text-mid">This removes the design, every version and its review results. It cannot be undone.</p>
          <AdminDeleteAction id={design.id} type="design" name={design.name} redirectTo="/studio/admin" />
        </details>
      </div>

      {version && (
        <div className="admin-detail-preview">
          <ReviewPreview content={version.content} template={design.template} marketCode={design.market.code} />
        </div>
      )}
    </article>
  );
}
