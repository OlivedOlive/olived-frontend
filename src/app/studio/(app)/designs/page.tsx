import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Loading } from "@/components/studio/Loading";
import { StatusBadge } from "@/components/studio/StatusBadge";
import { apiGet } from "@/lib/studio/api";
import type { DesignSummary } from "@/lib/studio/types";

export const metadata: Metadata = { title: "Designs" };

export default function DesignsPage() {
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-4xl">Your designs</h1>
        <Link href="/studio/designs/new" className="btn">
          New design
        </Link>
      </div>

      <Suspense fallback={<Loading label="Loading your designs…" />}>
        <DesignList />
      </Suspense>
    </div>
  );
}

async function DesignList() {
  const { designs } = await apiGet<{ designs: DesignSummary[] }>("/designs");

  if (designs.length === 0) {
    return <p className="text-mid">You have no designs yet. Start with a product and a market.</p>;
  }

  return (
    <ul className="grid gap-3">
      {designs.map((design) => (
        <li key={design.id}>
          <Link href={`/studio/designs/${design.id}`} className="card flex flex-wrap items-center justify-between gap-3">
            <span>
              <span className="block font-medium">{design.name}</span>
              <span className="text-sm text-mid">
                {design.template.variant.product.name}, {design.template.name}, {design.market.name}
              </span>
            </span>
            <StatusBadge status={design.status} />
          </Link>
        </li>
      ))}
    </ul>
  );
}
