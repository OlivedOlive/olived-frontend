"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import groves from "@/assets/images/studio/groves.jpg";
import { StudioMark } from "@/components/studio/StudioMark";
import { postJson } from "@/lib/studio/post";

const RESEND_SECONDS = 60;

/** Forgotten password: ask for a code by email, then set a new password with it. */
export function ForgotPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [stage, setStage] = useState<"email" | "code">(params.get("email") ? "code" : "email");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [wait, setWait] = useState(0);

  useEffect(() => {
    if (wait <= 0) return;
    const timer = setTimeout(() => setWait((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [wait]);

  async function sendCode(event?: FormEvent) {
    event?.preventDefault();
    setBusy(true);
    setError("");
    setFields({});
    const result = await postJson("/auth/forgot", { email });
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      setFields(result.fields);
      return;
    }
    setStage("code");
    setWait(RESEND_SECONDS);
  }

  async function reset(event: FormEvent) {
    event.preventDefault();
    if (password !== confirm) {
      setFields({ confirm: "The two passwords are not the same." });
      return;
    }
    setBusy(true);
    setError("");
    setFields({});
    const result = await postJson("/auth/reset", { email, code, password });
    if (result.ok) {
      router.push("/studio/designs");
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
        <Image src={groves} alt="Rows of olive trees on red earth under a blue sky" fill priority sizes="50vw" className="object-cover" placeholder="blur" />
        <div className="studio-auth-art-shade" />
        <Link href="/studio" className="studio-brand studio-auth-brand" aria-label="OLIVED Studio home">
          <StudioMark />
          <span className="studio-brand-name">OLIVED <span>Studio</span></span>
        </Link>
        <div className="studio-auth-caption">
          <p>Back to your designs in a minute.</p>
          <span>We send a 6-digit code to your email. It works for 15 minutes.</span>
        </div>
      </aside>

      <div className="studio-auth-side">
        <Link href="/studio" className="studio-brand studio-auth-brand-mobile" aria-label="OLIVED Studio home">
          <StudioMark />
          <span className="studio-brand-name">OLIVED <span>Studio</span></span>
        </Link>

        <div className="studio-auth-card">
          <ol className="studio-reset-steps" aria-label="Steps">
            <li data-done={stage === "code"} aria-current={stage === "email" ? "step" : undefined}><span>1</span> Your email</li>
            <li aria-current={stage === "code" ? "step" : undefined}><span>2</span> Code and new password</li>
          </ol>

          {stage === "email" ? (
            <>
              <div className="grid gap-1.5">
                <h1>Forgot your password?</h1>
                <p className="text-sm text-mid">Enter the email of your Studio account and we send you a code to set a new password.</p>
              </div>
              <form onSubmit={sendCode} className="grid gap-4">
                <label className="studio-auth-field">
                  <span>Email</span>
                  <span className="studio-auth-input" data-invalid={Boolean(fields.email)}>
                    <input type="email" autoComplete="email" required placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </span>
                  {fields.email && <span className="studio-auth-error">{fields.email}</span>}
                </label>
                {error && <p role="alert" className="studio-auth-alert">{error}</p>}
                <button type="submit" className="studio-cta studio-auth-submit" disabled={busy}>
                  {busy ? <><span className="studio-spinner" aria-hidden="true" />Sending the code…</> : <>Send me a code <span aria-hidden="true">→</span></>}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="grid gap-1.5">
                <h1>Set a new password</h1>
                <p className="text-sm text-mid">
                  If <strong>{email}</strong> has a Studio account, a 6-digit code is on its way. Check your spam folder too.
                </p>
              </div>
              <form onSubmit={reset} className="grid gap-4">
                <label className="studio-auth-field">
                  <span>Code from the email</span>
                  <span className="studio-auth-input" data-invalid={Boolean(fields.code)}>
                    <input className="studio-code-input" inputMode="numeric" autoComplete="one-time-code" pattern="\d{6}" maxLength={6} required
                      placeholder="000000" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} />
                  </span>
                  {fields.code && <span className="studio-auth-error">{fields.code}</span>}
                </label>
                <label className="studio-auth-field">
                  <span>New password</span>
                  <span className="studio-auth-input" data-invalid={Boolean(fields.password)}>
                    <input type={show ? "text" : "password"} autoComplete="new-password" required minLength={10} placeholder="At least 10 characters"
                      value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button type="button" className="studio-auth-eye" onClick={() => setShow((v) => !v)} aria-pressed={show}
                      aria-label={show ? "Hide password" : "Show password"}>{show ? "Hide" : "Show"}</button>
                  </span>
                  {fields.password ? <span className="studio-auth-error">{fields.password}</span>
                    : <span className="studio-auth-hint" data-ok={password.length >= 10}>{password.length >= 10 ? "✓ Long enough" : "At least 10 characters. Avoid your name or email."}</span>}
                </label>
                <label className="studio-auth-field">
                  <span>New password again</span>
                  <span className="studio-auth-input" data-invalid={Boolean(fields.confirm)}>
                    <input type={show ? "text" : "password"} autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
                  </span>
                  {fields.confirm ? <span className="studio-auth-error">{fields.confirm}</span>
                    : confirm && <span className="studio-auth-hint" data-ok={confirm === password}>{confirm === password ? "✓ The same" : "Not the same yet"}</span>}
                </label>
                {error && <p role="alert" className="studio-auth-alert">{error}</p>}
                <button type="submit" className="studio-cta studio-auth-submit" disabled={busy || code.length !== 6}>
                  {busy ? <><span className="studio-spinner" aria-hidden="true" />Saving…</> : <>Save and log in <span aria-hidden="true">→</span></>}
                </button>
              </form>
              <div className="studio-reset-links">
                <button type="button" disabled={wait > 0 || busy} onClick={() => void sendCode()}>
                  {wait > 0 ? `Send a new code in ${wait} s` : "Send a new code"}
                </button>
                <button type="button" onClick={() => { setStage("email"); setCode(""); setError(""); setFields({}); }}>Use another email</button>
              </div>
            </>
          )}

          <p className="studio-auth-switch">Remembered it? <Link href="/studio/login">Log in</Link></p>
        </div>
        <Link href="/" className="studio-auth-back">← Back to the OLIVED website</Link>
      </div>
    </main>
  );
}
