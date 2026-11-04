"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { ArrowRight } from "@/components/icons";
import {
  submitEnquiry,
  validateEnquiry,
  type EnquiryPayload,
  type EnquirySource,
  type FieldErrors,
  type Interest,
} from "@/lib/enquiry";
import { useBulkPrefill } from "./BulkPrefill";

const VOLUME_RANGES = ["Under 5 MT", "5 – 20 MT", "20 – 100 MT", "100 – 500 MT", "500 MT +"];

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent"; mailed: boolean } | { kind: "error"; message: string };

const COPY: Record<EnquirySource, { submit: string; note: string; button: string }> = {
  home: {
    submit: "Receive My Export Proposal",
    note: "Confidential enquiry · No commitment · Response within 24 business hours",
    button: "btn btn-gold",
  },
  contact: {
    submit: "Send Request",
    note: "We respond within 24 hours · All enquiries treated with strict confidentiality",
    button: "btn btn-primary",
  },
  bulk: {
    submit: "Submit Bulk Enquiry",
    note: "Confidential enquiry · Response within 24 business hours",
    button: "btn btn-gold",
  },
};

/** One form, three variants — matching the three forms of the static site. */
export function EnquiryForm({ source }: { source: EnquirySource }) {
  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;
  const onDark = source !== "contact";
  const prefill = useBulkPrefill();

  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  // Contact page: radio on home, checkboxes on contact.
  const [interests, setInterests] = useState<Interest[]>([]);
  const successRef = useRef<HTMLDivElement>(null);

  // The success panel is shorter than the form: bring it into view and announce it.
  useEffect(() => {
    if (status.kind !== "sent" || !successRef.current) return;
    successRef.current.scrollIntoView({ block: "center", behavior: "smooth" });
    successRef.current.focus({ preventScroll: true });
  }, [status.kind]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const str = (k: string) => String(data.get(k) ?? "").trim();

    const payload: EnquiryPayload = {
      source,
      fullName: str("fullName"),
      company: str("company"),
      email: str("email"),
      country: str("country"),
      volume: str("volume"),
      message: str("message"),
      website: str("website"),
    };
    if (source === "home") {
      const choice = str("interest") as Interest | "";
      payload.interests = choice ? [choice] : [];
    }
    if (source === "contact") {
      payload.phone = str("phone");
      payload.interests = interests;
    }
    if (source === "bulk") {
      payload.oilCategory = str("oilCategory");
      payload.organicPreference = str("organicPreference");
      payload.format = str("format");
      payload.targetSpec = str("targetSpec");
    }

    const clientErrors = validateEnquiry(payload);
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      setStatus({ kind: "idle" });
      focusFirstError(form, clientErrors);
      return;
    }

    setErrors({});
    setStatus({ kind: "sending" });
    const result = await submitEnquiry(payload);

    if (result.ok) {
      form.reset();
      setInterests([]);
      prefill?.set({ oilCategory: "", organicPreference: "", format: "" });
      setStatus({ kind: "sent", mailed: result.mailed });
    } else {
      setErrors(result.fields);
      setStatus({ kind: "error", message: result.error });
      focusFirstError(form, result.fields);
    }
  }

  function focusFirstError(form: HTMLFormElement, errs: FieldErrors) {
    const first = Object.keys(errs)[0];
    if (!first) return;
    const el = form.querySelector<HTMLElement>(`[name="${first}"], [data-field="${first}"] input`);
    el?.focus();
  }

  const fieldProps = (name: keyof EnquiryPayload) => ({
    id: id(name),
    name,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? id(`${name}-error`) : undefined,
  });

  const errorText = (name: keyof EnquiryPayload) =>
    errors[name] ? (
      <p id={id(`${name}-error`)} className={`mt-1.5 text-small ${onDark ? "text-[#f0a493]" : "text-[#a8432f]"}`}>
        {errors[name]}
      </p>
    ) : null;

  const copy = COPY[source];
  const sending = status.kind === "sending";

  if (status.kind === "sent") {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        className={`scroll-mt-[120px] border p-10 text-center outline-none ${onDark ? "border-sand-pale/25" : "border-border"}`}
      >
        <p className="font-serif text-h4">Thank you — your enquiry has been received.</p>
        <p className={`mt-3 text-small ${onDark ? "text-sand-pale/70" : "text-mid"}`}>
          Our export team will respond within 24 business hours.
        </p>
        <button
          type="button"
          className={`mt-8 ${onDark ? "btn btn-outline-light" : "btn btn-outline"}`}
          onClick={() => setStatus({ kind: "idle" })}
        >
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate aria-busy={sending}>
      {/* Anti-spam honeypot: invisible to people, filled in by bots. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-px w-px opacity-0"
      />

      <div className="form-grid">
        <Field label="Full Name" htmlFor={id("fullName")} required>
          <input className="form-control" type="text" placeholder="John Smith" autoComplete="name" {...fieldProps("fullName")} />
          {errorText("fullName")}
        </Field>

        <Field label="Company" htmlFor={id("company")} required>
          <input className="form-control" type="text" placeholder="Your company" autoComplete="organization" {...fieldProps("company")} />
          {errorText("company")}
        </Field>

        <Field label="Business Email" htmlFor={id("email")} required>
          <input className="form-control" type="email" placeholder="you@company.com" autoComplete="email" {...fieldProps("email")} />
          {errorText("email")}
        </Field>

        {source === "contact" && (
          <Field label="Phone" htmlFor={id("phone")}>
            <input className="form-control" type="tel" placeholder="+1 000 000 0000" autoComplete="tel" {...fieldProps("phone")} />
            {errorText("phone")}
          </Field>
        )}

        <Field
          label={source === "bulk" ? "Destination Country" : "Country / Destination"}
          htmlFor={id("country")}
          required
          full={source === "contact"}
        >
          <input className="form-control" type="text" placeholder="e.g. Germany, UAE, USA…" autoComplete="country-name" {...fieldProps("country")} />
          {errorText("country")}
        </Field>

        {source === "home" && (
          <fieldset className="form-group form-full" data-field="interests">
            {/* A legend sits outside the fieldset's flex gap, so it gets the 6px explicitly. */}
            <legend className="form-label mb-1.5">Sourcing Need</legend>
            <div className="form-checkbox-group">
              <label className="form-checkbox">
                <input type="radio" name="interest" value="bulk" />
                <span>Bulk Olive Oil</span>
              </label>
              <label className="form-checkbox">
                <input type="radio" name="interest" value="packaged" />
                <span>Packaged Collection</span>
              </label>
            </div>
          </fieldset>
        )}

        {source === "contact" && (
          <fieldset
            className="form-group form-full"
            data-field="interests"
            aria-describedby={errors.interests ? id("interests-error") : undefined}
          >
            <legend className="form-label mb-1.5">
              Enquiry Type <span className="text-gold">*</span>
            </legend>
            <div className="form-checkbox-group">
              {(
                [
                  ["bulk", "Bulk Olive Oil"],
                  ["packaged", "Packaged / ORZETA"],
                  ["distributor", "Become a Distributor"],
                ] as const
              ).map(([value, label]) => (
                <label key={value} className="form-checkbox">
                  <input
                    type="checkbox"
                    value={value}
                    checked={interests.includes(value)}
                    onChange={(e) =>
                      setInterests((cur) => (e.target.checked ? [...cur, value] : cur.filter((v) => v !== value)))
                    }
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
            {errorText("interests")}
          </fieldset>
        )}

        {source === "bulk" && (
          <>
            <Field label="Olive Oil Category" htmlFor={id("oilCategory")} required>
              <select
                className="form-control"
                {...fieldProps("oilCategory")}
                {...controlled(prefill, "oilCategory")}
              >
                <option value="">Select a category</option>
                <option>Extra Virgin Olive Oil</option>
                <option>Not sure yet</option>
              </select>
              {errorText("oilCategory")}
            </Field>

            <Field label="Conventional or Organic" htmlFor={id("organicPreference")} required>
              <select
                className="form-control"
                {...fieldProps("organicPreference")}
                {...controlled(prefill, "organicPreference")}
              >
                <option value="">Select an option</option>
                <option>Conventional</option>
                <option>Organic</option>
                <option>No preference</option>
              </select>
              {errorText("organicPreference")}
            </Field>

            <Field label="Estimated Volume" htmlFor={id("volume")} required>
              <input className="form-control" type="text" placeholder="Approximate quantity" {...fieldProps("volume")} />
              {errorText("volume")}
            </Field>

            <Field label="Preferred Format" htmlFor={id("format")} required>
              <select className="form-control" {...fieldProps("format")} {...controlled(prefill, "format")}>
                <option value="">Select a format</option>
                <option>Flexitank</option>
                <option>IBC 1000L</option>
                <option>Food-Grade Drums</option>
                <option>Not sure yet</option>
              </select>
              {errorText("format")}
            </Field>

            <Field label="Target Specification or Application" htmlFor={id("targetSpec")} required full>
              <input
                className="form-control"
                type="text"
                placeholder="e.g. intended use or specification target"
                {...fieldProps("targetSpec")}
              />
              {errorText("targetSpec")}
            </Field>
          </>
        )}

        {source !== "bulk" && (
          <Field label={source === "contact" ? "Estimated Volume / Year" : "Estimated Volume"} htmlFor={id("volume")} full>
            <select className="form-control" defaultValue="" {...fieldProps("volume")}>
              <option value="">Select a range</option>
              {VOLUME_RANGES.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </Field>
        )}

        <Field label="Message" htmlFor={id("message")} required={source === "bulk"} full>
          <textarea
            className="form-control"
            placeholder={
              source === "bulk"
                ? "Tell us more about your project…"
                : "Tell us about your project, grade preferences or packaging requirements…"
            }
            {...fieldProps("message")}
          />
          {errorText("message")}
        </Field>

        <div className="form-full">
          {status.kind === "error" && (
            <p role="alert" className={`mb-4 text-center text-small ${onDark ? "text-[#f0a493]" : "text-[#a8432f]"}`}>
              {status.message}
            </p>
          )}
          <button type="submit" className={`${copy.button} w-full justify-center disabled:opacity-60`} disabled={sending}>
            {sending ? "Sending…" : copy.submit}
            {!sending && <ArrowRight />}
          </button>
          <p className={`mt-3.5 text-center text-micro tracking-[0.04em] ${onDark ? "text-sand-pale/60" : "text-muted"}`}>
            {copy.note}
          </p>
        </div>
      </div>
    </form>
  );
}

function controlled(
  prefill: ReturnType<typeof useBulkPrefill>,
  key: "oilCategory" | "organicPreference" | "format",
) {
  if (!prefill) return { defaultValue: "" };
  return {
    value: prefill.values[key],
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => prefill.set({ [key]: e.target.value }),
  };
}

function Field({
  label,
  htmlFor,
  required,
  full,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  full?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={full ? "form-group form-full" : "form-group"}>
      <label className="form-label" htmlFor={htmlFor}>
        {label} {required && <span className="text-gold">*</span>}
      </label>
      {children}
    </div>
  );
}
