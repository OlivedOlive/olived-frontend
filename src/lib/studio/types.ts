export type Role = "CLIENT_MEMBER" | "CLIENT_ADMIN" | "OLIVED_REVIEWER" | "OLIVED_ADMIN";
export type DesignStatus = "DRAFT" | "SUBMITTED" | "CHANGES_REQUESTED" | "APPROVED";

export type Me = {
  user: { id: string; email: string; name: string };
  organization: { id: string; name: string };
  role: Role;
};

export type Template = {
  id: string;
  kind: string;
  name: string;
  widthMm: string;
  heightMm: string;
  zones?: { format?: string; caseCount?: number | null; geometry?: string };
};

export type Variant = { id: string; name: string; sku: string; volumeMl: number; templates: Template[] };
export type Product = { id: string; slug: string; name: string; description: string | null; variants: Variant[] };
export type Market = {
  id: string;
  code: string;
  name: string;
  languages: string[];
  /** The market's label template text, from its published rules. */
  copy?: Record<string, string>;
  /** Not verified yet: wording to confirm before use. */
  draft?: boolean;
};

export type DesignContent = {
  fields: Record<string, string>;
  colors: { primary: string; secondary: string };
  artwork?: Artwork;
};

export type PackagePart = "unit" | "retail" | "case";
export type PanelFace = "front" | "back" | "left" | "right" | "top" | "bottom";
export type Panel = { text: string; x: number; y: number; size: number };
export type Artwork = {
  font: "serif" | "sans" | "mono";
  logo?: string;
  logoPlacement?: { x: number; y: number; size: number };
  labelFit?: { offset: number; height: number };
  panels: Partial<Record<PackagePart, Partial<Record<PanelFace, Panel>>>>;
  /** The client's own arrangement of the unit label (see layout.ts). Without it, the market template's. */
  layout?: { unit?: import("./layout").Layout };
};

export type Issue = { field: string; message: string; severity?: "warning" };
export type CheckResult = { label: string; status: "pass" | "error" | "warning" | "unverified"; message: string; field?: string };
export type RequiredField = { key: string; label: string };

type TemplateWithProduct = Template & { variant: Variant & { product: Product } };

export type DesignSummary = {
  id: string;
  name: string;
  status: DesignStatus;
  updatedAt: string;
  market: Market;
  template: TemplateWithProduct;
};

export type DesignDetail = DesignSummary & {
  market: Market & { ruleSets: { rules: { requiredFields: RequiredField[]; referenceOnly?: boolean; source?: string | null; copy?: Record<string, string>; draft?: boolean } }[] };
  versions: {
    id: string;
    number: number;
    content: DesignContent;
    validationResults: { passed: boolean; issues: Issue[] }[];
    approvals: { decision: "APPROVED" | "CHANGES_REQUESTED"; comment: string | null }[];
  }[];
};

export type ReviewDesign = DesignDetail & { organization: { name: string } };
