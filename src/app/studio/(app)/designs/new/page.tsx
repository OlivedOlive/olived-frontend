import type { Metadata } from "next";
import { Suspense } from "react";
import { Loading } from "@/components/studio/Loading";
import { NewDesignForm } from "@/components/studio/NewDesignForm";
import { apiGet } from "@/lib/studio/api";
import type { Market, Product } from "@/lib/studio/types";

export const metadata: Metadata = { title: "New design" };

export default function NewDesignPage() {
  return (
    <div className="grid gap-6">
      <h1 className="text-4xl">New design</h1>
      <Suspense fallback={<Loading label="Loading the catalog…" />}>
        <CatalogForm />
      </Suspense>
    </div>
  );
}

async function CatalogForm() {
  const [{ products }, { markets }] = await Promise.all([
    apiGet<{ products: Product[] }>("/catalog/products"),
    apiGet<{ markets: Market[] }>("/catalog/markets"),
  ]);

  if (products.length === 0 || markets.length === 0) {
    return <p className="text-mid">The catalog is not ready yet. Please check back soon.</p>;
  }
  return <NewDesignForm products={products} markets={markets} />;
}
