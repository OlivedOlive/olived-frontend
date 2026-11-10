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
    <button type="button" onClick={logout} className="cursor-pointer text-sm text-mid underline">
      Log out
    </button>
  );
}
