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
  | { ok: false; error: string; fields: FieldErrors; network: boolean };

const FALLBACK = "We could not send your enquiry. Please try again, or email Contact@olived.tn.";

export async function submitEnquiry(payload: EnquiryPayload): Promise<SubmitResult> {
  let res: Response;
  try {
    res = await fetch(`${apiUrl}/api/enquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    return { ok: false, error: FALLBACK, fields: {}, network: true };
  }

  let data: { success?: boolean; mailed?: boolean; error?: string; fields?: FieldErrors } = {};
  try {
    data = await res.json();
  } catch {
    // Non-JSON response (proxy error page, etc.)
  }

  if (res.ok && data.success) return { ok: true, mailed: Boolean(data.mailed) };
  return { ok: false, error: data.error ?? FALLBACK, fields: data.fields ?? {}, network: !data.error };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ValidationMessages = Record<
  "fullName" | "company" | "email" | "country" | "interests" | "oilCategory" | "organicPreference" | "volume" | "format" | "targetSpec" | "message",
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
  return errors;
}
