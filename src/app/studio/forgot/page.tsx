import type { Metadata } from "next";
import { Suspense } from "react";
import { ForgotPasswordForm } from "@/components/studio/ForgotPasswordForm";

export const metadata: Metadata = { title: "Forgot your password" };

// The email in the code email's link (?email=) fills the form, so the page reads the address bar.
export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotPasswordForm />
    </Suspense>
  );
}
