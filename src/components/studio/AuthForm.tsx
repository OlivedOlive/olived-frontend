"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import groves from "@/assets/images/studio/groves.jpg";
import { StudioMark } from "@/components/studio/StudioMark";
import { postJson } from "@/lib/studio/post";

type Input = { name: string; label: string; type: string; autoComplete: string; placeholder: string; hint?: string };

const INPUTS: Record<"login" | "register", Input[]> = {
  login: [
    { name: "email", label: "Email", type: "email", autoComplete: "email", placeholder: "you@company.com" },
    { name: "password", label: "Password", type: "password", autoComplete: "current-password", placeholder: "Your password" },
  ],
  register: [
    { name: "name", label: "Your name", type: "text", autoComplete: "name", placeholder: "First and last name" },
    { name: "company", label: "Company", type: "text", autoComplete: "organization", placeholder: "Importer or distributor" },
    { name: "email", label: "Work email", type: "email", autoComplete: "email", placeholder: "you@company.com" },
    {
      name: "password", label: "Password", type: "password", autoComplete: "new-password", placeholder: "At least 10 characters",
      hint: "At least 10 characters. Avoid your name or email.",
    },
  ],
};

const COPY = {
  login: {
    title: "Welcome back",
    lead: "Log in to continue your packaging projects.",
    submit: "Log in",
    busy: "Logging in…",
    switchText: "New to OLIVED Studio?",
    switchLink: "Create an account",
    switchHref: "/studio/register",
  },
  register: {
    title: "Create your account",
    lead: "One account for your company. Design labels for every market you sell in.",
    submit: "Create account",
    busy: "Creating your account…",
    switchText: "Already have an account?",
    switchLink: "Log in",
    switchHref: "/studio/login",
  },
};

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const isLogin = mode === "login";
  const copy = COPY[mode];

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const result = await postJson(`/auth/${mode}`, Object.fromEntries(new FormData(event.currentTarget)));
    if (result.ok) {
      router.push(isLogin ? "/studio" : "/studio/designs");
      router.refresh();
      return;
    }
    setError(result.error);
    setFields(result.fields);
    setBusy(false);
  }

  return (
    <main className="studio-auth">
      <aside className="studio-auth-art">
        <Image src={groves} alt="Rows of olive trees on red earth under a blue sky" fill priority sizes="50vw"
          className="object-cover" placeholder="blur" />
        <div className="studio-auth-art-shade" />
        <Link href="/studio" className="studio-brand studio-auth-brand" aria-label="OLIVED Studio home">
          <StudioMark />
          <span className="studio-brand-name">OLIVED <span>Studio</span></span>
        </Link>
        <div className="studio-auth-caption">
          <p>From Tunisian groves to your shelf.</p>
          <span>Design packaging that meets your market&apos;s labelling rules, then send it to OLIVED for review.</span>
        </div>
      </aside>

      <div className="studio-auth-side">
        <Link href="/studio" className="studio-brand studio-auth-brand-mobile" aria-label="OLIVED Studio home">
          <StudioMark />
          <span className="studio-brand-name">OLIVED <span>Studio</span></span>
        </Link>

        <div className="studio-auth-card">
          <div className="grid gap-1.5">
            <h1>{copy.title}</h1>
            <p className="text-sm text-mid">{copy.lead}</p>
          </div>

          <form onSubmit={submit} className="grid gap-4">
            {INPUTS[mode].map(({ name, label, type, autoComplete, placeholder, hint }) => {
              const isPassword = type === "password";
              const invalid = Boolean(fields[name]);
              return (
                <label key={name} className="studio-auth-field">
                  <span className="flex items-center justify-between gap-2">
                    {label}
                    {isPassword && isLogin && <Link href="/studio/forgot" className="studio-auth-forgot">Forgot password?</Link>}
                  </span>
                  <span className="studio-auth-input" data-invalid={invalid}>
                    <input name={name} type={isPassword && showPassword ? "text" : type} autoComplete={autoComplete}
                      placeholder={placeholder} required aria-invalid={invalid} minLength={isPassword && !isLogin ? 10 : undefined}
                      onChange={isPassword ? (e) => setPassword(e.target.value) : undefined} />
                    {isPassword && (
                      <button type="button" className="studio-auth-eye" onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword}>
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    )}
                  </span>
                  {invalid ? <span className="studio-auth-error">{fields[name]}</span>
                    : hint && (
                      <span className="studio-auth-hint" data-ok={password.length >= 10}>
                        {password.length >= 10 ? "✓ Long enough" : hint}
                      </span>
                    )}
                </label>
              );
            })}
            {error && <p role="alert" className="studio-auth-alert">{error}</p>}
            <button type="submit" className="studio-cta studio-auth-submit" disabled={busy}>
              {busy ? <><span className="studio-spinner" aria-hidden="true" />{copy.busy}</> : <>{copy.submit} <span aria-hidden="true">→</span></>}
            </button>
          </form>

          <p className="studio-auth-switch">
            {copy.switchText} <Link href={copy.switchHref}>{copy.switchLink}</Link>
          </p>
        </div>

        {/* The website is a different root layout, so this is a full page load in the visitor's language. */}
        <Link href="/" className="studio-auth-back">← Back to the OLIVED website</Link>
      </div>
    </main>
  );
}
