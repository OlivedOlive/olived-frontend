"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { postJson } from "@/lib/studio/post";

export function ReviewActions({
  designId,
  versionId,
  admin = false,
}: {
  designId: string;
  versionId: string;
  admin?: boolean;
}) {
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);

  async function decide(decision: "APPROVED" | "CHANGES_REQUESTED") {
    const message = comment.trim();
    if (decision === "CHANGES_REQUESTED" && admin && !message) {
      setError("Write a message explaining the changes the client needs to make.");
      return;
    }
    setError("");
    setBusy(true);
    const section = admin ? "admin" : "review";
    const result = await postJson(`/${section}/designs/${encodeURIComponent(designId)}/decision`, {
      decision,
      versionId,
      comment: message || undefined,
    });
    if (!result.ok) {
      setError(result.error);
      setBusy(false);
      return;
    }
    router.refresh();
  }

  return (
    <div className="grid gap-3">
      <label className="field">
        Comment for the client
        <textarea className="input py-2" rows={2} maxLength={2000} disabled={busy} value={comment} onChange={(e) => setComment(e.target.value)} />
      </label>
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <button type="button" className="btn" disabled={busy} onClick={() => confirm ? decide("APPROVED") : setConfirm(true)}>
          {confirm ? "Confirm approval" : "Approve"}
        </button>
        <button type="button" className="btn btn-outline" disabled={busy} onClick={() => confirm ? setConfirm(false) : decide("CHANGES_REQUESTED")}>
          {confirm ? "Cancel" : "Request changes"}
        </button>
      </div>
    </div>
  );
}
