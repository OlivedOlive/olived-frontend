import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/studio/AuthForm";
import { RedirectIfLoggedIn } from "@/components/studio/RedirectIfLoggedIn";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <>
      <Suspense>
        <RedirectIfLoggedIn />
      </Suspense>
      <AuthForm mode="login" />
    </>
  );
}
