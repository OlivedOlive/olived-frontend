import { apiUrl } from "./site";

export type EnquirySource = "home" | "contact" | "bulk";
export type Interest = "bulk" | "packaged" | "distributor";

export interface EnquiryPayload {
  source: EnquirySource;
  fullName: string;
  company: string;
  email: string;
  phone?: string;
  country: string;
  interests?: Interest[];
  volume?: string;
  oilCategory?: string;
  organicPreference?: string;
  format?: string;
  targetSpec?: string;
  message?: string;
  website?: string;
}

export type FieldErrors = Partial<Record<keyof EnquiryPayload | "form", string>>;

export type SubmitResult =
  | { ok: true; mailed: boolean }
  | { ok: false; fields: FieldErrors; rateLimited: boolean };

export async function submitEnquiry(payload: EnquiryPayload): Promise<SubmitResult> {
  let res: Response;
  try {
    res = await fetch(`${apiUrl}/api/enquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    return { ok: false, fields: {}, rateLimited: false };
  }

  let data: { success?: boolean; mailed?: boolean; fields?: FieldErrors } = {};
  try {
    data = await res.json();
  } catch {
    // Non-JSON response (proxy error page, etc.)
  }

  if (res.ok && data.success) return { ok: true, mailed: Boolean(data.mailed) };
  return { ok: false, fields: data.fields ?? {}, rateLimited: res.status === 429 };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Same limits as olived-backend/src/enquiry-schema.ts. */
const MAX_LENGTH = {
  fullName: 120,
  company: 160,
  email: 254,
  phone: 40,
  country: 120,
  volume: 80,
  targetSpec: 300,
  message: 5000,
} as const;

export type ValidationMessages = Record<
  | "fullName"
  | "company"
  | "email"
  | "country"
  | "interests"
  | "oilCategory"
  | "organicPreference"
  | "volume"
  | "format"
  | "targetSpec"
  | "message"
  | "tooLong",
  string
>;

/** Mirrors the backend rules so most mistakes are caught before a round trip. Messages come from the dictionary. */
export function validateEnquiry(p: EnquiryPayload, m: ValidationMessages): FieldErrors {
  const errors: FieldErrors = {};
  if (!p.fullName) errors.fullName = m.fullName;
  if (!p.company) errors.company = m.company;
  if (!p.email || !EMAIL_RE.test(p.email)) errors.email = m.email;
  if (!p.country) errors.country = m.country;

  if (p.source === "contact" && !p.interests?.length) errors.interests = m.interests;

  if (p.source === "bulk") {
    if (!p.oilCategory) errors.oilCategory = m.oilCategory;
    if (!p.organicPreference) errors.organicPreference = m.organicPreference;
    if (!p.volume) errors.volume = m.volume;
    if (!p.format) errors.format = m.format;
    if (!p.targetSpec) errors.targetSpec = m.targetSpec;
    if (!p.message) errors.message = m.message;
  }

  for (const [field, max] of Object.entries(MAX_LENGTH) as [keyof typeof MAX_LENGTH, number][]) {
    if ((p[field]?.length ?? 0) > max) errors[field] = m.tooLong;
  }
  return errors;
}
