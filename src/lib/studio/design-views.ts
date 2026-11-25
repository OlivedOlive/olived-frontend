/**
 * The status views of the admin design list. Kept out of the client component that draws the filters,
 * because the server page reads them too: a value imported from a "use client" file is only a client
 * reference on the server, not the array itself.
 */
export const DESIGN_VIEWS = [
  { id: "all", label: "All" },
  { id: "review", label: "Complete · to review" },
  { id: "checking", label: "Checking" },
  { id: "changes", label: "Changes requested" },
  { id: "approved", label: "Approved" },
  { id: "drafts", label: "Drafts · not complete" },
] as const;
export type DesignView = (typeof DESIGN_VIEWS)[number]["id"];
