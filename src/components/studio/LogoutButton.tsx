"use client";

import { useRouter } from "next/navigation";
import { postJson } from "@/lib/studio/post";

export function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await postJson("/auth/logout");
    router.push("/studio");
    router.refresh();
  }

  return (
    <button type="button" onClick={logout} className="studio-logout" title="Log out">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 16l-4-4 4-4M6 12h10" /></svg>
      <span>Log out</span>
    </button>
  );
}
