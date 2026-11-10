import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { apiUrl } from "@/lib/site";

export const SESSION_COOKIE = "olived_studio_session";


/** Reads from the API in a Server Component, as the logged-in visitor. */
export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${apiUrl}/api/studio${path}`, {
    headers: { cookie: (await cookies()).toString() },
    cache: "no-store",
  });
  if (res.status === 401) redirect("/studio/login");
  if (res.status === 403 || res.status === 404) notFound();
  if (!res.ok) throw new Error(`API ${path} answered ${res.status}`);
  return res.json();
}
