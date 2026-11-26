import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import type { AdminDesign as AdminDesignFull } from "@/components/studio/AdminDesignCard";
import { LabelThumb } from "@/components/studio/LabelThumb";
import { AdminUsers } from "@/components/studio/AdminUsers";
import { DesignFilters } from "@/components/studio/DesignFilters";
import { Loading } from "@/components/studio/Loading";
import { PAGE_MAX, ShowMore, shownCount } from "@/components/studio/ShowMore";
import { StatusBadge } from "@/components/studio/StatusBadge";
import { apiGet } from "@/lib/studio/api";
import { DESIGN_VIEWS, type DesignView } from "@/lib/studio/design-views";
import type { DesignStatus, Role } from "@/lib/studio/types";

type AdminDesign = AdminDesignFull;
type Query = Awaited<PageProps<"/studio/admin">["searchParams"]>;
type DesignPage = { designs: AdminDesign[]; total: number };
type StatusCounts = Record<DesignStatus, number>;
type Overview = {
  designs: {
    total: number; thisMonth: number; byStatus: StatusCounts; byMarket: { market: string; count: number }[];
    checks: { passed: number; failed: number }; decisionsThisMonth: { APPROVED: number; CHANGES_REQUESTED: number };
  };
  users: { total: number; thisWeek: number; staff: number };
  organizations: { total: number; thisMonth: number };
  system: {
    databaseMs: number; node: string; uptimeSeconds: number; environment: string;
    catalog: { products: number; templates: number };
    markets: { code: string; name: string; active: boolean; designs: number; ruleVersion: number | null; publishedAt: string | null; draft: boolean; templateVersion: number | null }[];
    jobs: { PENDING: number; RUNNING: number; DONE: number; FAILED: number };
    failedJobs: { id: string; type: string; attempts: number; lastError: string | null; updatedAt: string }[];
    assets: { count: number; bytes: number };
  };
  activity: { id: string; action: string; entityType: string; createdAt: string; user: { name: string; email: string } | null; organization: { name: string } | null }[];
};
type Organization = {
  id: string; name: string; country: string | null; createdAt: string;
  _count: { memberships: number; designs: number; brandAssets: number };
  memberships: { role: Role; user: { name: string; email: string } }[];
  designs: { id: string; name: string; status: DesignStatus; updatedAt: string; market: { name: string } }[];
  designStatus: StatusCounts;
};

const TABS = ["designs", "users", "system", "organizations"] as const;
type Tab = (typeof TABS)[number];
const STATUS_LABEL: Record<DesignStatus, string> = { DRAFT: "Drafts", SUBMITTED: "Submitted", CHANGES_REQUESTED: "Changes requested", APPROVED: "Approved" };

/** The lists that grow over time, each with its own "Show more" (`?approved=24`). */
const PAGED_GROUPS: { title: string; status: DesignStatus; param: string; empty: string }[] = [
  { title: "Changes requested", status: "CHANGES_REQUESTED", param: "changes", empty: "No designs." },
  { title: "Approved", status: "APPROVED", param: "approved", empty: "No designs." },
  { title: "Drafts", status: "DRAFT", param: "drafts", empty: "No designs." },
];
export const metadata: Metadata = { title: "Admin dashboard" };

const number = (value: number) => value.toLocaleString("en-GB");
const date = (value: string) => new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
const dateTime = (value: string) => new Date(value).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
function bytes(value: number) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 ** 2) return `${(value / 1024).toFixed(1)} kB`;
  return `${(value / 1024 ** 2).toFixed(1)} MB`;
}
function duration(seconds: number) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return days ? `${days} d ${hours} h` : hours ? `${hours} h ${minutes} min` : `${minutes} min`;
}

export default function AdminPage({ searchParams }: PageProps<"/studio/admin">) {
  return (
    <div className="studio-wide grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="ws-section-title">OLIVED Studio</p>
          <h1 className="text-5xl">Admin dashboard</h1>
        </div>
      </div>
      <Suspense fallback={<Loading label="Loading the dashboard…" lines={4} />}>
        <Dashboard searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Dashboard({ searchParams }: { searchParams: Promise<Query> }) {
  const query = await searchParams;
  const tab: Tab = TABS.includes(query.tab as Tab) ? (query.tab as Tab) : "designs";
  const overview = await apiGet<Overview>("/admin/overview");
  const { designs, users, organizations, system } = overview;
  const problems = system.jobs.FAILED + system.markets.filter((m) => m.active && m.ruleVersion === null).length;
  const href = (next: Tab) => (next === "designs" ? "?" : `?tab=${next}`);

  const cards: { id: Tab; label: string; icon: string; value: string; note: string }[] = [
    { id: "designs", label: "Designs", icon: "◧", value: number(designs.byStatus.SUBMITTED), note: `to review · ${number(designs.total)} in all` },
    { id: "users", label: "Users", icon: "◉", value: number(users.total), note: `+${number(users.thisWeek)} this week · ${number(users.staff)} staff` },
    { id: "system", label: "System", icon: "⚙", value: problems ? `${problems}` : "OK", note: problems ? `issue${problems > 1 ? "s" : ""} to look at` : `database ${system.databaseMs} ms` },
    { id: "organizations", label: "Organisations", icon: "▦", value: number(organizations.total), note: `+${number(organizations.thisMonth)} this month` },
  ];

  return (
    <>
      <nav className="admin-tabs" aria-label="Admin sections">
        {cards.map((card) => (
          <Link key={card.id} href={href(card.id)} scroll={false} className="admin-tab" aria-current={tab === card.id ? "page" : undefined}
            data-alert={card.id === "system" && problems > 0 ? "true" : undefined}>
            <span className="admin-tab-label"><span aria-hidden="true">{card.icon}</span>{card.label}</span>
            <span className="admin-tab-value">{card.value}</span>
            <span className="admin-tab-note">{card.note}</span>
          </Link>
        ))}
      </nav>

      <section className="admin-panel card" aria-label={cards.find((c) => c.id === tab)?.label}>
        {tab === "designs" && <DesignsTab overview={overview} query={query} />}
        {tab === "users" && <UsersTab overview={overview} searchParams={searchParams} />}
        {tab === "system" && <SystemTab overview={overview} />}
        {tab === "organizations" && <OrganizationsTab overview={overview} query={query} />}
      </section>
    </>
  );
}

// --- Small building blocks ---------------------------------------------------------------------

function Box({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`admin-box ${className}`}>
      <h2 className="admin-box-title">{title}</h2>
      {children}
    </div>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="admin-stat">
      <span className="admin-stat-label">{label}</span>
      <span className="admin-stat-value">{value}</span>
      {note && <span className="admin-stat-note">{note}</span>}
    </div>
  );
}

/** One measure as horizontal bars: label, bar, value. The bar length carries the number. */
function Bars({ rows, label }: { rows: { label: string; value: number; href?: string }[]; label: string }) {
  const max = Math.max(1, ...rows.map((row) => row.value));
  if (rows.length === 0) return <p className="text-sm text-mid">Nothing yet.</p>;
  return (
    <figure className="admin-bars" aria-label={label}>
      <table className="sr-only">
        <caption>{label}</caption>
        <tbody>{rows.map((row) => <tr key={row.label}><th>{row.label}</th><td>{row.value}</td></tr>)}</tbody>
      </table>
      {rows.map((row) => {
        const content = (
          <>
            <span className="admin-bar-label">{row.label}</span>
            <span className="admin-bar-track">
              <span className="admin-bar-fill" style={{ width: `${(row.value / max) * 100}%` }} />
            </span>
            <span className="admin-bar-value">{number(row.value)}</span>
          </>
        );
        return row.href
          ? <Link key={row.label} href={row.href} scroll={false} className="admin-bar" title={`${row.label}: ${row.value}`} aria-hidden="true">{content}</Link>
          : <div key={row.label} className="admin-bar" title={`${row.label}: ${row.value}`} aria-hidden="true">{content}</div>;
      })}
    </figure>
  );
}

// --- Designs ------------------------------------------------------------------------------------

async function DesignsTab({ overview, query }: { overview: Overview; query: Query }) {
  const { designs } = overview;
  // Filters from the address: status view, text, market and sort order.
  const view: DesignView = DESIGN_VIEWS.some((v) => v.id === query.show) ? (query.show as DesignView) : "all";
  const filter = new URLSearchParams();
  for (const key of ["q", "market", "sort"] as const) {
    const value = query[key];
    if (typeof value === "string" && value.trim()) filter.set(key, value.trim().slice(0, 160));
  }
  const suffix = filter.size ? `&${filter}` : "";
  const [submitted, everything, ...paged] = await Promise.all([
    apiGet<DesignPage>(`/admin/designs?status=SUBMITTED&take=${PAGE_MAX}${suffix}`),
    view === "all"
      ? apiGet<DesignPage>(`/admin/designs?take=${shownCount(query, "list", 24)}${suffix}`)
      : Promise.resolve({ designs: [], total: 0 }),
    ...PAGED_GROUPS.map((group) =>
      apiGet<DesignPage>(`/admin/designs?status=${group.status}&take=${view === group.param ? shownCount(query, group.param, 24) : 1}${suffix}`),
    ),
  ]);
  const passed = (design: AdminDesign) => design.versions[0]?.validationResults[0]?.passed;
  const ready = submitted.designs.filter(passed);
  const awaiting = submitted.designs.filter((d) => !passed(d));
  const totals = Object.fromEntries(PAGED_GROUPS.map((group, i) => [group.param, paged[i]!.total])) as Record<string, number>;
  const counts: Record<DesignView, number> = {
    all: submitted.total + PAGED_GROUPS.reduce((sum, group) => sum + totals[group.param]!, 0),
    review: ready.length,
    checking: awaiting.length + Math.max(0, submitted.total - submitted.designs.length),
    changes: totals.changes!,
    approved: totals.approved!,
    drafts: totals.drafts!,
  };
  const filtered = view !== "all" || filter.size > 0;
  // The open view: one grid of tiles, with its own "Show more".
  const group = PAGED_GROUPS.find((g) => g.param === view);
  const open = view === "all" ? { designs: everything.designs, total: everything.total, param: "list" }
    : view === "review" ? { designs: ready, total: ready.length, param: "" }
    : view === "checking" ? { designs: awaiting, total: counts.checking, param: "" }
    : { designs: paged[PAGED_GROUPS.indexOf(group!)]!.designs, total: paged[PAGED_GROUPS.indexOf(group!)]!.total, param: group!.param };
  const heading = DESIGN_VIEWS.find((v) => v.id === view)!.label;
  const hint: Record<DesignView, string> = {
    all: "Every design, newest change first. Click a design to open it.",
    review: "Submitted and the checklist is complete: waiting for your decision.",
    checking: "Submitted, but the checklist has not run or is not complete yet.",
    changes: "Sent back to the client with your message.",
    approved: "Approved for printing.",
    drafts: "The client has not submitted these yet.",
  };
  const checks = designs.checks.passed + designs.checks.failed;
  const decided = designs.decisionsThisMonth.APPROVED + designs.decisionsThisMonth.CHANGES_REQUESTED;

  return (
    <div className="grid gap-6">
      <div className="admin-boxes">
        <Box title="Review queue">
          {ready.length === 0 && awaiting.length === 0 ? (
            <p className="text-sm text-mid">Nothing waiting. Submitted designs appear here.</p>
          ) : (
            <ul className="admin-list">
              {[...ready, ...awaiting].slice(0, 8).map((design) => (
                <li key={design.id}>
                  <a href={`/studio/admin/designs/${design.id}`}>
                    <span className="truncate font-medium">{design.name}</span>
                    <span className="truncate text-xs text-mid">{design.organization.name} · {design.market.name}</span>
                  </a>
                  <span className={`admin-pill ${passed(design) ? "admin-pill-good" : ""}`}>{passed(design) ? "Ready" : "Checking"}</span>
                </li>
              ))}
            </ul>
          )}
          {ready.length + awaiting.length > 8 && <p className="text-xs text-mid">and {ready.length + awaiting.length - 8} more below.</p>}
        </Box>
        <Box title="Pipeline">
          <Bars label="Designs by status" rows={(Object.keys(STATUS_LABEL) as DesignStatus[]).map((status) => ({
            label: STATUS_LABEL[status], value: designs.byStatus[status],
            href: `?show=${status === "SUBMITTED" ? "review" : PAGED_GROUPS.find((g) => g.status === status)?.param}#design-list`,
          }))} />
          <div className="admin-stats">
            <Stat label="New this month" value={number(designs.thisMonth)} />
            <Stat label="Checks passed" value={checks ? `${Math.round((designs.checks.passed / checks) * 100)}%` : "–"} note={`${number(checks)} runs`} />
            <Stat label="Approved this month" value={decided ? `${designs.decisionsThisMonth.APPROVED}/${decided}` : "–"} note="of decisions" />
          </div>
        </Box>
        <Box title="By market" className="admin-box-narrow">
          <Bars label="Designs by market" rows={designs.byMarket.slice(0, 8).map((m) => ({ label: m.market, value: m.count }))} />
        </Box>
      </div>

      <div id="design-list" className="grid scroll-mt-24 gap-4">
        <DesignFilters view={view} counts={counts} markets={overview.system.markets.map(({ code, name }) => ({ code, name }))} />
        <div className="admin-list-head">
          <h2>{view === "all" ? "All designs" : heading} <span>{open.total}</span></h2>
          <p>{hint[view]}</p>
        </div>
        {open.designs.length === 0 ? (
          <div className="admin-empty">
            <span className="admin-empty-icon" aria-hidden="true">◧</span>
            <strong>{filtered ? "No designs match these filters" : "No designs yet"}</strong>
            <span>{filtered ? "Try another status, market or search." : "Designs appear here as soon as clients start them."}</span>
            {filtered && <Link href="?#design-list" scroll={false} className="btn btn-outline min-h-10">Show all designs</Link>}
          </div>
        ) : (
          <ul className="admin-tiles">
            {open.designs.map((design) => <DesignTile key={design.id} design={design} />)}
          </ul>
        )}
        {open.param ? (
          <ShowMore query={query} param={open.param} shown={open.designs.length} total={open.total} anchor="design-list" />
        ) : open.total > open.designs.length && (
          <p className="text-sm text-mid">Showing the latest {open.designs.length} of {open.total} submitted designs.</p>
        )}
      </div>
    </div>
  );
}

const TILE_STATUS: Record<DesignStatus, { label: string; tone: string }> = {
  DRAFT: { label: "Draft", tone: "draft" },
  SUBMITTED: { label: "Submitted", tone: "review" },
  CHANGES_REQUESTED: { label: "Changes requested", tone: "changes" },
  APPROVED: { label: "Approved", tone: "approved" },
};

/** A design as a small tile: label picture, name, company, market and check. The detail opens on click. */
function DesignTile({ design }: { design: AdminDesign }) {
  const version = design.versions[0];
  const validation = version?.validationResults[0];
  const status = TILE_STATUS[design.status];
  const check = design.status !== "SUBMITTED" ? null
    : !validation ? { label: "Checking", tone: "" } : validation.passed ? { label: "✓ Checklist complete", tone: "good" } : { label: `${validation.issues.length} to fix`, tone: "bad" };
  return (
    <li>
      <Link href={`/studio/admin/designs/${design.id}`} className="admin-tile" data-tone={status.tone}>
        <span className="admin-tile-art">
          {version ? <LabelThumb content={version.content} template={design.template} /> : <span className="text-xs text-mid">No artwork</span>}
          <span className="studio-project-status" data-tone={status.tone}>{status.label}</span>
        </span>
        <span className="admin-tile-body">
          <span className="admin-tile-name" title={design.name}>{design.name}</span>
          <span className="admin-tile-org">{design.organization.name}</span>
          <span className="admin-tile-tags">
            <span className="studio-project-market">{design.market.code} · {design.market.name}</span>
            {check && <span className={`admin-pill ${check.tone === "good" ? "admin-pill-good" : check.tone === "bad" ? "admin-pill-bad" : ""}`}>{check.label}</span>}
          </span>
          <span className="admin-tile-foot">
            <span>v{version?.number ?? 0} · {new Date(design.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
            <span className="admin-tile-open">Open →</span>
          </span>
        </span>
      </Link>
    </li>
  );
}

// --- Users --------------------------------------------------------------------------------------

function UsersTab({ overview, searchParams }: { overview: Overview; searchParams: Promise<Query> }) {
  const { users } = overview;
  return (
    <div className="admin-boxes">
      <Box title="All users" className="admin-box-wide">
        <Suspense fallback={<Loading label="Loading users…" />}>
          <AdminUsers searchParams={searchParams} />
        </Suspense>
      </Box>
      <Box title="At a glance" className="admin-box-narrow">
        <div className="admin-stats admin-stats-stacked">
          <Stat label="Users" value={number(users.total)} />
          <Stat label="New this week" value={`+${number(users.thisWeek)}`} />
          <Stat label="Staff" value={number(users.staff)} note="admins and reviewers" />
          <Stat label="Clients" value={number(Math.max(0, users.total - users.staff))} />
        </div>
      </Box>
    </div>
  );
}

// --- System -------------------------------------------------------------------------------------

function SystemTab({ overview }: { overview: Overview }) {
  const { system, activity } = overview;
  const missingRules = system.markets.filter((m) => m.active && m.ruleVersion === null);
  return (
    <div className="grid gap-6">
      <div className="admin-boxes">
        <Box title="Markets and label rules">
          {missingRules.length > 0 && (
            <p className="admin-alert" role="status">⚠ {missingRules.map((m) => m.name).join(", ")}: no published rules. Run <code>npm run db:seed</code>.</p>
          )}
          <table className="admin-table">
            <thead><tr><th>Market</th><th>Rules</th><th>Designs</th></tr></thead>
            <tbody>
              {system.markets.map((market) => (
                <tr key={market.code} className={market.active ? "" : "text-mid"}>
                  <td><span className="font-medium">{market.name}</span> <span className="text-xs text-mid">{market.code}</span></td>
                  <td>
                    {market.ruleVersion === null ? <span className="admin-pill admin-pill-bad">None</span> : <>v{market.ruleVersion}</>}
                    {market.draft && <span className="admin-pill ml-1">Draft</span>}
                    {!market.active && <span className="admin-pill ml-1">Off</span>}
                  </td>
                  <td>{number(market.designs)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
        <Box title="Background jobs and server">
          <div className="admin-stats">
            <Stat label="Waiting" value={number(system.jobs.PENDING + system.jobs.RUNNING)} />
            <Stat label="Done" value={number(system.jobs.DONE)} />
            <Stat label="Failed" value={number(system.jobs.FAILED)} />
          </div>
          {system.failedJobs.length > 0 ? (
            <ul className="admin-list">
              {system.failedJobs.map((job) => (
                <li key={job.id}>
                  <span className="grid min-w-0">
                    <span className="font-medium">{job.type} <span className="text-xs text-mid">· {job.attempts} tries · {dateTime(job.updatedAt)}</span></span>
                    {job.lastError && <span className="truncate text-xs text-danger" title={job.lastError}>{job.lastError}</span>}
                  </span>
                  <span className="admin-pill admin-pill-bad">Failed</span>
                </li>
              ))}
            </ul>
          ) : <p className="admin-ok">✓ No failed jobs.</p>}
          <dl className="admin-facts">
            <dt>Database</dt><dd>{system.databaseMs} ms</dd>
            <dt>Running for</dt><dd>{duration(system.uptimeSeconds)}</dd>
            <dt>Node.js</dt><dd>{system.node}</dd>
            <dt>Mode</dt><dd>{system.environment}</dd>
          </dl>
        </Box>
        <Box title="Catalog and storage" className="admin-box-narrow">
          <div className="admin-stats admin-stats-stacked">
            <Stat label="Products" value={number(system.catalog.products)} />
            <Stat label="Packaging templates" value={number(system.catalog.templates)} />
            <Stat label="Uploaded logos" value={number(system.assets.count)} note={bytes(system.assets.bytes)} />
          </div>
        </Box>
      </div>
      <section className="grid gap-3">
        <h2 className="admin-group-title">Recent activity</h2>
        {activity.length === 0 ? <p className="text-sm text-mid">No recorded activity yet.</p> : (
          <ol className="admin-timeline">
            {activity.map((entry) => (
              <li key={entry.id}>
                <time dateTime={entry.createdAt}>{dateTime(entry.createdAt)}</time>
                <span><strong>{entry.action.replaceAll(".", " ")}</strong>{entry.user ? ` by ${entry.user.name}` : ""}{entry.organization ? ` · ${entry.organization.name}` : ""}</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

// --- Organisations -------------------------------------------------------------------------------

async function OrganizationsTab({ overview, query }: { overview: Overview; query: Query }) {
  const search = typeof query.q === "string" ? query.q.trim().slice(0, 160) : "";
  const take = shownCount(query, "orgs", 12);
  const { organizations, total } = await apiGet<{ organizations: Organization[]; total: number }>(
    `/admin/organizations?take=${take}${search ? `&q=${encodeURIComponent(search)}` : ""}`,
  );
  return (
    <div className="admin-boxes">
      <Box title={search ? `Organisations matching “${search}”` : "All organisations"} className="admin-box-wide">
        <form className="flex flex-wrap gap-2" role="search">
          <input type="hidden" name="tab" value="organizations" />
          <input className="input min-h-10 max-w-sm" type="search" name="q" defaultValue={search} placeholder="Search by company name" aria-label="Search organisations" />
          <button type="submit" className="btn min-h-10">Search</button>
          {search && <Link href="?tab=organizations" className="btn btn-outline min-h-10">Clear</Link>}
        </form>
        {organizations.length === 0 && <p className="text-sm text-mid">No organisations found.</p>}
        <ul className="grid gap-2" id="orgs">
          {organizations.map((org) => (
            <li key={org.id}>
              <details className="admin-org">
                <summary>
                  <span className="grid min-w-0">
                    <span className="truncate font-semibold">{org.name}</span>
                    <span className="text-xs text-mid">Since {date(org.createdAt)}{org.country ? ` · ${org.country}` : ""}</span>
                  </span>
                  <span className="admin-org-counts">
                    <span title="Members">◉ {org._count.memberships}</span>
                    <span title="Designs">◧ {org._count.designs}</span>
                    <span title="Uploaded logos">▣ {org._count.brandAssets}</span>
                    {org.designStatus.SUBMITTED > 0 && <span className="admin-pill admin-pill-good">{org.designStatus.SUBMITTED} to review</span>}
                  </span>
                </summary>
                <div className="grid gap-4 pt-3 md:grid-cols-2">
                  <div className="grid content-start gap-1.5">
                    <h3 className="ws-section-title">Members</h3>
                    {org.memberships.map((m) => (
                      <p key={m.user.email} className="text-sm">{m.user.name} <span className="text-mid">· {m.user.email} · {m.role.replaceAll("_", " ").toLowerCase()}</span></p>
                    ))}
                    {org._count.memberships > org.memberships.length && <p className="text-xs text-mid">and {org._count.memberships - org.memberships.length} more</p>}
                  </div>
                  <div className="grid content-start gap-1.5">
                    <h3 className="ws-section-title">Latest designs</h3>
                    {org.designs.length === 0 ? <p className="text-sm text-mid">No designs yet.</p> : org.designs.map((d) => (
                      <p key={d.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                        <span>{d.name} <span className="text-mid">· {d.market.name}</span></span>
                        <StatusBadge status={d.status} />
                      </p>
                    ))}
                  </div>
                </div>
              </details>
            </li>
          ))}
        </ul>
        <ShowMore query={query} param="orgs" shown={organizations.length} total={total} anchor="orgs" />
      </Box>
      <Box title="At a glance" className="admin-box-narrow">
        <div className="admin-stats admin-stats-stacked">
          <Stat label="Organisations" value={number(overview.organizations.total)} />
          <Stat label="New this month" value={`+${number(overview.organizations.thisMonth)}`} />
          <Stat label="Designs per organisation" value={overview.organizations.total ? (overview.designs.total / overview.organizations.total).toFixed(1) : "–"} />
        </div>
      </Box>
    </div>
  );
}
