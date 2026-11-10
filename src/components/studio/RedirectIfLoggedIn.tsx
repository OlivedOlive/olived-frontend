import { redirect } from "next/navigation";
import { getMe } from "@/lib/studio/api";

/**
 * Sends someone who is already logged in straight to their designs, so "Get Started" and the
 * login page never ask them to log in again. Checked with the API, so an expired login is not
 * mistaken for a valid one. Render it inside <Suspense>.
 */
export async function RedirectIfLoggedIn() {
  if (await getMe()) redirect("/studio/designs");
  return null;
}
