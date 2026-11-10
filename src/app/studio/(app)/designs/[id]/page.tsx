import type { Metadata } from "next";
import { Suspense } from "react";
import { DesignEditor } from "@/components/studio/DesignEditor";
import { Loading } from "@/components/studio/Loading";
import { StatusBadge } from "@/components/studio/StatusBadge";
import { apiGet } from "@/lib/studio/api";
import type { DesignDetail } from "@/lib/studio/types";

export const metadata: Metadata = { title: "Design" };

// Everything here depends on the design id, so the whole page streams in behind one boundary.
export default function DesignPage({ params }: PageProps<"/studio/designs/[id]">) {
  return (
    <Suspense fallback={<Loading label="Loading the design…" lines={4} />}>
      <Design params={params} />
    </Suspense>
  );
}

async function Design({ params }: { params: PageProps<"/studio/designs/[id]">["params"] }) {
  const { id } = await params;
  const { design } = await apiGet<{ design: DesignDetail }>(`/designs/${encodeURIComponent(id)}`);

  return (
    <div className="grid gap-6">
      <div>
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-4xl">{design.name}</h1>
          <StatusBadge status={design.status} />
        </div>
        <p className="mt-1 text-sm text-mid">
          {design.template.variant.product.name}, {design.template.variant.name}, {design.template.name},{" "}
          {design.market.name}
        </p>
      </div>
      <DesignEditor design={design} />
    </div>
  );
}
