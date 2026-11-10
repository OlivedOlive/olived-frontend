"use client";

import { useRouter } from "next/navigation";
import { startTransition } from "react";

// Usually the API is not running or not reachable. The login is saved in the database,
// so once the API is back, "Try again" picks up where the visitor left off.
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
      <h1 className="text-4xl">The studio is not reachable</h1>
      <p className="text-mid">
        We could not reach the OLIVED Studio server. You are still logged in: once it is back, try again and you
        will continue where you left off.
      </p>
      <button type="button" className="btn justify-self-start" onClick={retry}>
        Try again
      </button>
    </main>
  );
}
