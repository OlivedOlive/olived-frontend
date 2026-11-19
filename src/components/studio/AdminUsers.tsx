import { AdminDeleteAction } from "@/components/studio/AdminDeleteAction";
import { StatusBadge } from "@/components/studio/StatusBadge";
import { apiGet } from "@/lib/studio/api";
import type { DesignStatus, Role } from "@/lib/studio/types";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  memberships: { role: Role; organization: { name: string } }[];
  designsCreated: { id: string; name: string; status: DesignStatus; market: { name: string } }[];
  _count: { designsCreated: number; versions: number; approvals: number };
};

export async function AdminUsers() {
  const { users } = await apiGet<{ users: AdminUser[] }>("/admin/users");
  return (
    <section id="users" className="grid gap-3">
      <h2 className="text-3xl">Users <span className="text-sm text-mid">({users.length})</span></h2>
      {users.map((user) => <UserCard key={user.id} user={user} />)}
    </section>
  );
}

function UserCard({ user }: { user: AdminUser }) {
  const staff = user.memberships.some(({ role }) => role === "OLIVED_ADMIN" || role === "OLIVED_REVIEWER");
  const linked = Object.values(user._count).some(Boolean);
  return (
    <details className="card">
      <summary className="cursor-pointer text-sm">
        <strong>{user.name}</strong> · {user.email} · {user.designsCreated.length} designs
      </summary>
      <div className="mt-4 grid gap-3">
        {user.memberships.map(({ organization, role }, index) => (
          <p className="text-sm text-mid" key={index}>{organization.name} · {role.replaceAll("_", " ").toLowerCase()}</p>
        ))}
        {user.designsCreated.length === 0 ? <p className="text-sm text-mid">This user has no design requests.</p> : (
          <ul className="grid gap-2">
            {user.designsCreated.map((design) => (
              <li key={design.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-sand p-3 text-sm">
                <a href={"#design-" + design.id} className="underline">{design.name} · {design.market.name}</a>
                <StatusBadge status={design.status} />
              </li>
            ))}
          </ul>
        )}
        {staff ? <p className="text-sm text-mid">Protected staff account.</p>
          : linked ? <p className="text-sm text-mid">Remove linked designs before deleting this user.</p>
          : <AdminDeleteAction id={user.id} type="user" name={user.name} />}
      </div>
    </details>
  );
}
