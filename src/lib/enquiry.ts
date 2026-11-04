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
  | { ok: false; error: string; fields: FieldErrors };

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
    return { ok: false, error: FALLBACK, fields: {} };
  }

  let data: { success?: boolean; mailed?: boolean; error?: string; fields?: FieldErrors } = {};
  try {
    data = await res.json();
  } catch {
    // Non-JSON response (proxy error page, etc.)
  }

  if (res.ok && data.success) return { ok: true, mailed: Boolean(data.mailed) };
  return { ok: false, error: data.error ?? FALLBACK, fields: data.fields ?? {} };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Mirrors the backend rules so most mistakes are caught before a round trip. */
export function validateEnquiry(p: EnquiryPayload): FieldErrors {
  const errors: FieldErrors = {};
  if (!p.fullName) errors.fullName = "Full name is required";
  if (!p.company) errors.company = "Company is required";
  if (!p.email || !EMAIL_RE.test(p.email)) errors.email = "A valid email is required";
  if (!p.country) errors.country = "Country is required";

  if (p.source === "contact" && !p.interests?.length) errors.interests = "Select at least one enquiry type";

  if (p.source === "bulk") {
    if (!p.oilCategory) errors.oilCategory = "Olive oil category is required";
    if (!p.organicPreference) errors.organicPreference = "Select conventional or organic";
    if (!p.volume) errors.volume = "Estimated volume is required";
    if (!p.format) errors.format = "Preferred format is required";
    if (!p.targetSpec) errors.targetSpec = "Target specification is required";
    if (!p.message) errors.message = "Message is required";
  }
  return errors;
}
