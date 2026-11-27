"use client";

import { useState, type FormEvent } from "react";
import { postJson } from "@/lib/studio/post";

/** Changes the signed-in user's password; the current one confirms it is them. Other logins end. */
export function ChangePasswordForm() {
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ tone: "good" | "bad"; text: string } | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setMessage(null);
    if (password !== confirm) {
      setFields({ confirm: "The two passwords are not the same." });
      return;
    }
    setBusy(true);
    setFields({});
    const result = await postJson("/auth/password", { current, password });
    setBusy(false);
    if (!result.ok) {
      setFields(result.fields);
      setMessage({ tone: "bad", text: result.error });
      return;
    }
    setCurrent("");
    setPassword("");
    setConfirm("");
    setMessage({ tone: "good", text: "✓ Password changed. Other devices where you were logged in are logged out." });
  }

  const input = (name: string, label: string, value: string, set: (v: string) => void, autoComplete: string, hint?: React.ReactNode) => (
    <label className="studio-auth-field">
      <span>{label}</span>
      <span className="studio-auth-input" data-invalid={Boolean(fields[name])}>
        <input type={show ? "text" : "password"} autoComplete={autoComplete} required value={value} onChange={(e) => set(e.target.value)} />
      </span>
      {fields[name] ? <span className="studio-auth-error">{fields[name]}</span> : hint}
    </label>
  );

  return (
    <form onSubmit={submit} className="grid gap-4">
      {input("current", "Current password", current, setCurrent, "current-password")}
      {input("password", "New password", password, setPassword, "new-password",
        <span className="studio-auth-hint" data-ok={password.length >= 10}>{password.length >= 10 ? "✓ Long enough" : "At least 10 characters. Avoid your name or email."}</span>)}
      {input("confirm", "New password again", confirm, setConfirm, "new-password",
        confirm ? <span className="studio-auth-hint" data-ok={confirm === password}>{confirm === password ? "✓ The same" : "Not the same yet"}</span> : null)}
      <label className="flex items-center gap-2 text-sm text-mid">
        <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} /> Show passwords
      </label>
      {message && <p role="status" className={message.tone === "good" ? "studio-auth-ok" : "studio-auth-alert"}>{message.text}</p>}
      <button type="submit" className="studio-cta justify-self-start" disabled={busy}>
        {busy ? <><span className="studio-spinner" aria-hidden="true" />Saving…</> : "Change password"}
      </button>
    </form>
  );
}
