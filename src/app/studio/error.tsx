"use client";

import { useRouter } from "next/navigation";
import { startTransition } from "react";

export default function ErrorPage({ reset }: { reset: () => void }) {
  const router = useRouter();

  function retry() {
    startTransition(() => {
      router.refresh();
      reset();
    });
  }

  return (
    <main className="mx-auto grid min-h-screen max-w-md content-center gap-4 px-4">
      <h1 className="text-4xl">Studio could not load</h1>
      <p className="text-mid">
        Try loading this page again. If it still fails, reload the page to get the latest Studio files.
      </p>
      <button type="button" className="btn justify-self-start" onClick={retry}>
        Try again
      </button>
      <button type="button" className="btn btn-outline justify-self-start" onClick={() => window.location.reload()}>
        Reload page
      </button>
    </main>
  );
}
