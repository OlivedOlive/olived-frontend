"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { postJson } from "@/lib/studio/post";

export function ValidateDesignButton({ designId, versionId }: { designId: string; versionId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function validate() {
    setBusy(true);
    setError("");
    const result = await postJson(`/admin/designs/${encodeURIComponent(designId)}/validate`, { versionId });
    if (!result.ok) setError(result.error);
    router.refresh();
    setBusy(false);
  }

  return (
    <div className="grid gap-2">
      <p className="text-sm text-mid">Run the checklist to reveal the review actions or return missing fields to the client.</p>
      <button type="button" className="btn justify-self-start" onClick={validate} disabled={busy}>
        {busy ? "Validating…" : "Run validation"}
      </button>
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
    </div>
  );
}
