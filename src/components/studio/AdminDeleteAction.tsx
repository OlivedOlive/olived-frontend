"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { postJson } from "@/lib/studio/post";

export function AdminDeleteAction({ id, type, name, redirectTo }: {
  id: string;
  type: "user" | "design";
  name: string;
  /** Where to go once it is deleted, when the current page shows only this item. */
  redirectTo?: string;
}) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    setBusy(true);
    setError("");
    const result = await postJson("/admin/" + type + "s/" + encodeURIComponent(id) + "/delete");
    if (!result.ok) {
      setError(result.error);
      setBusy(false);
      return;
    }
    if (redirectTo) router.push(redirectTo);
    else router.refresh();
  }

  if (!confirm) return <button type="button" className="justify-self-start text-sm font-medium text-danger underline"
    onClick={() => setConfirm(true)}>Delete {type}</button>;

  return (
    <div className="grid gap-2 rounded-lg border border-danger/30 bg-white p-3">
      <p className="text-sm">
        Permanently delete <strong>{name}</strong>? {type === "design" ? "This removes the design, versions and review results." : "The user will lose access immediately."}
      </p>
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn bg-danger" disabled={busy} onClick={remove}>{busy ? "Deleting…" : "Confirm deletion"}</button>
        <button type="button" className="btn btn-outline" disabled={busy} onClick={() => { setConfirm(false); setError(""); }}>Cancel</button>
      </div>
    </div>
  );
}
