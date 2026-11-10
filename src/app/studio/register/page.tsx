import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/studio/AuthForm";
import { RedirectIfLoggedIn } from "@/components/studio/RedirectIfLoggedIn";

export const metadata: Metadata = { title: "Create an account" };

export default function RegisterPage() {
  return (
    <>
      <Suspense>
        <RedirectIfLoggedIn />
      </Suspense>
      <AuthForm mode="register" />
    </>
  );
}
