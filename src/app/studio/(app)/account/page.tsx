import type { Metadata } from "next";
import { Suspense } from "react";
import { ChangePasswordForm } from "@/components/studio/ChangePasswordForm";
import { Loading } from "@/components/studio/Loading";
import { apiGet } from "@/lib/studio/api";
import type { Me, Role } from "@/lib/studio/types";

export const metadata: Metadata = { title: "Your account" };

const ROLE_LABEL: Record<Role, string> = {
  CLIENT_MEMBER: "Member", CLIENT_ADMIN: "Client admin", OLIVED_REVIEWER: "OLIVED reviewer", OLIVED_ADMIN: "OLIVED admin",
};

export default function AccountPage() {
  return (
    <div className="mx-auto grid w-full max-w-3xl gap-5">
      <div>
        <p className="ws-section-title">OLIVED Studio</p>
        <h1 className="text-5xl">Your account</h1>
      </div>
      <Suspense fallback={<Loading label="Loading your account…" />}>
        <Account />
      </Suspense>
    </div>
  );
}

async function Account() {
  const me = await apiGet<Me>("/auth/me");
  return (
    <>
      <section className="admin-section">
        <h2 className="admin-section-title">Profile</h2>
        <dl className="admin-facts-list">
          <div><dt>Name</dt><dd>{me.user.name}</dd></div>
          <div><dt>Email</dt><dd>{me.user.email}</dd></div>
          <div><dt>Company</dt><dd>{me.organization.name}</dd></div>
          <div><dt>Role</dt><dd>{ROLE_LABEL[me.role]}</dd></div>
        </dl>
      </section>
      <section className="admin-section">
        <h2 className="admin-section-title">Change your password</h2>
        <p className="text-sm text-mid">Enter your current password, then the new one. Forgot it? Log out and use &ldquo;Forgot password?&rdquo; on the login page.</p>
        <ChangePasswordForm />
      </section>
    </>
  );
}
