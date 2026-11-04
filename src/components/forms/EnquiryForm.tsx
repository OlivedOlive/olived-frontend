"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { ArrowRight } from "@/components/icons";
import type { Dictionary } from "@/i18n/dictionaries/en";
import {
  submitEnquiry,
  validateEnquiry,
  type EnquiryPayload,
  type EnquirySource,
  type FieldErrors,
  type Interest,
} from "@/lib/enquiry";
import { useBulkPrefill } from "./BulkPrefill";

type FormText = Dictionary["form"];
type OptionValue = keyof FormText["options"];

// Option values are sent to the backend in English, so the sales email reads the same
// whatever language the buyer used; only the visible labels are translated.
const VOLUME_RANGES: OptionValue[] = ["Under 5 MT", "5 – 20 MT", "20 – 100 MT", "100 – 500 MT", "500 MT +"];
const OIL_CATEGORIES: OptionValue[] = ["Extra Virgin Olive Oil", "Not sure yet"];
const ORGANIC_PREFERENCES: OptionValue[] = ["Conventional", "Organic", "No preference"];
const FORMATS: OptionValue[] = ["Flexitank", "IBC 1000L", "Food-Grade Drums", "Not sure yet"];

const BUTTON: Record<EnquirySource, string> = {
  home: "btn btn-gold",
  contact: "btn btn-primary",
  bulk: "btn btn-gold",
};

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent"; mailed: boolean } | { kind: "error"; message: string };

/** One form, three variants — matching the three forms of the static site. */
export function EnquiryForm({ source, t }: { source: EnquirySource; t: FormText }) {
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

    const clientErrors = validateEnquiry(payload, t.errors);
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
      // The backend answers in English; show our own translated message for each flagged field.
      const translated: FieldErrors = {};
      for (const key of Object.keys(result.fields) as (keyof FieldErrors)[]) {
        translated[key] = key in t.errors ? t.errors[key as keyof FormText["errors"]] : result.fields[key];
      }
      setErrors(translated);
      const message = Object.keys(translated).length > 0 ? t.errors.server : result.network ? t.errors.network : result.error;
      setStatus({ kind: "error", message });
      focusFirstError(form, translated);
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
      <p id={id(`${name}-error`)} className={`mt-1.5 text-small ${onDark ? "text-[#f0a493]" : "form-error-text"}`}>
        {errors[name]}
      </p>
    ) : null;

  const options = (values: OptionValue[]) =>
    values.map((v) => (
      <option key={v} value={v}>
        {t.options[v]}
      </option>
    ));

  const copy = t.variants[source];
  const sending = status.kind === "sending";

  if (status.kind === "sent") {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        className={`scroll-mt-[120px] rounded-[18px] border p-10 text-center outline-none ${onDark ? "border-sand-pale/25" : "border-border"}`}
      >
        <p className="font-serif text-h4">{t.thanks}</p>
        <p className={`mt-3 text-small ${onDark ? "text-sand-pale/70" : "text-mid"}`}>{t.thanksText}</p>
        <button
          type="button"
          className={`mt-8 ${onDark ? "btn btn-outline-light" : "btn btn-outline"}`}
          onClick={() => setStatus({ kind: "idle" })}
        >
          {t.another}
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
        // Hidden in place: an off-screen offset would widen right-to-left pages.
        className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0 [clip-path:inset(50%)]"
      />

      <div className="form-grid">
        <Field label={t.fullName} htmlFor={id("fullName")} required>
          <input className="form-control" type="text" placeholder={t.fullNamePlaceholder} autoComplete="name" {...fieldProps("fullName")} />
          {errorText("fullName")}
        </Field>

        <Field label={t.company} htmlFor={id("company")} required>
          <input className="form-control" type="text" placeholder={t.companyPlaceholder} autoComplete="organization" {...fieldProps("company")} />
          {errorText("company")}
        </Field>

        <Field label={t.email} htmlFor={id("email")} required>
          <input
            className="form-control"
            type="email"
            dir="ltr"
            placeholder={t.emailPlaceholder}
            autoComplete="email"
            {...fieldProps("email")}
          />
          {errorText("email")}
        </Field>

        {source === "contact" && (
          <Field label={t.phone} htmlFor={id("phone")}>
            <input
              className="form-control"
              type="tel"
              dir="ltr"
              placeholder={t.phonePlaceholder}
              autoComplete="tel"
              {...fieldProps("phone")}
            />
            {errorText("phone")}
          </Field>
        )}

        <Field
          label={source === "bulk" ? t.destinationCountry : t.country}
          htmlFor={id("country")}
          required
          full={source === "contact"}
        >
          <input className="form-control" type="text" placeholder={t.countryPlaceholder} autoComplete="country-name" {...fieldProps("country")} />
          {errorText("country")}
        </Field>

        {source === "home" && (
          <fieldset className="form-group form-full" data-field="interests">
            {/* A legend sits outside the fieldset's flex gap, so it gets the 6px explicitly. */}
            <legend className="form-label mb-1.5">{t.sourcingNeed}</legend>
            <div className="form-checkbox-group">
              <label className="form-checkbox">
                <input type="radio" name="interest" value="bulk" />
                <span>{t.interests.bulk}</span>
              </label>
              <label className="form-checkbox">
                <input type="radio" name="interest" value="packaged" />
                <span>{t.interests.packaged}</span>
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
              {t.enquiryType} <span className="text-gold">*</span>
            </legend>
            <div className="form-checkbox-group">
              {(
                [
                  ["bulk", t.interests.bulk],
                  ["packaged", t.interests.packagedOrzeta],
                  ["distributor", t.interests.distributor],
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
            <Field label={t.oilCategory} htmlFor={id("oilCategory")} required>
              <select className="form-control" {...fieldProps("oilCategory")} {...controlled(prefill, "oilCategory")}>
                <option value="">{t.selectCategory}</option>
                {options(OIL_CATEGORIES)}
              </select>
              {errorText("oilCategory")}
            </Field>

            <Field label={t.organicPreference} htmlFor={id("organicPreference")} required>
              <select className="form-control" {...fieldProps("organicPreference")} {...controlled(prefill, "organicPreference")}>
                <option value="">{t.selectOption}</option>
                {options(ORGANIC_PREFERENCES)}
              </select>
              {errorText("organicPreference")}
            </Field>

            <Field label={t.volume} htmlFor={id("volume")} required>
              <input className="form-control" type="text" placeholder={t.volumePlaceholder} {...fieldProps("volume")} />
              {errorText("volume")}
            </Field>

            <Field label={t.preferredFormat} htmlFor={id("format")} required>
              <select className="form-control" {...fieldProps("format")} {...controlled(prefill, "format")}>
                <option value="">{t.selectFormat}</option>
                {options(FORMATS)}
              </select>
              {errorText("format")}
            </Field>

            <Field label={t.targetSpec} htmlFor={id("targetSpec")} required full>
              <input className="form-control" type="text" placeholder={t.targetSpecPlaceholder} {...fieldProps("targetSpec")} />
              {errorText("targetSpec")}
            </Field>
          </>
        )}

        {source !== "bulk" && (
          <Field label={source === "contact" ? t.volumePerYear : t.volume} htmlFor={id("volume")} full>
            <select className="form-control" defaultValue="" {...fieldProps("volume")}>
              <option value="">{t.selectRange}</option>
              {options(VOLUME_RANGES)}
            </select>
          </Field>
        )}

        <Field label={t.message} htmlFor={id("message")} required={source === "bulk"} full>
          <textarea
            className="form-control"
            placeholder={source === "bulk" ? t.messagePlaceholderBulk : t.messagePlaceholder}
            {...fieldProps("message")}
          />
          {errorText("message")}
        </Field>

        <div className="form-full">
          {status.kind === "error" && (
            <p role="alert" className={`mb-4 text-center text-small ${onDark ? "text-[#f0a493]" : "form-error-text"}`}>
              {status.message}
            </p>
          )}
          <button type="submit" className={`${BUTTON[source]} w-full justify-center disabled:opacity-60`} disabled={sending}>
            {sending ? t.sending : copy.submit}
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

function controlled(prefill: ReturnType<typeof useBulkPrefill>, key: "oilCategory" | "organicPreference" | "format") {
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
