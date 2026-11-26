import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AdminDesignCard, type AdminDesign } from "@/components/studio/AdminDesignCard";
import { Loading } from "@/components/studio/Loading";
import { apiGet } from "@/lib/studio/api";

export const metadata: Metadata = { title: "Design review" };

/** One design opened from the admin dashboard: the full review card. */
export default function AdminDesignPage({ params }: PageProps<"/studio/admin/designs/[id]">) {
  return (
    <div className="studio-wide grid gap-4">
      <Link href="/studio/admin" className="studio-back">← Admin dashboard</Link>
      <Suspense fallback={<Loading label="Loading the design…" lines={4} />}>
        <Detail params={params} />
      </Suspense>
    </div>
  );
}

async function Detail({ params }: { params: PageProps<"/studio/admin/designs/[id]">["params"] }) {
  const { id } = await params;
  const { design } = await apiGet<{ design: AdminDesign }>(`/admin/designs/${encodeURIComponent(id)}`);
  return (
    <>
      <div>
        <p className="ws-section-title">{design.organization.name} · {design.market.name}</p>
        <h1 className="text-4xl">{design.name}</h1>
      </div>
      <AdminDesignCard design={design} />
    </>
  );
}
