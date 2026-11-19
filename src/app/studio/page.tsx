import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import bottles from "@/assets/images/studio/bottles.jpg";
import { RedirectIfLoggedIn } from "@/components/studio/RedirectIfLoggedIn";

export default function HomePage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <Suspense>
        <RedirectIfLoggedIn />
      </Suspense>
      <div className="studio-header grid content-center gap-6 px-5 py-16 sm:px-12 lg:px-16">
        <p className="text-sm font-medium tracking-widest text-gold">OLIVED STUDIO</p>
        <h1 className="max-w-xl text-6xl leading-tight lg:text-7xl">Design your olive oil packaging.</h1>
        <p className="max-w-lg text-paper">
          Start with ORZETA, Oussoul, or your own brand. Build the label, retail box and shipping case for your destination market.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/studio/register" className="btn bg-paper text-ink">
            Create an account
          </Link>
          <Link href="/studio/login" className="btn border border-paper bg-transparent">
            Log in
          </Link>
        </div>
      </div>

      <div className="relative aspect-[4/5] lg:aspect-auto">
        <Image
          src={bottles}
          alt="Four olive oil bottles from 250 ml to 1 litre, with the ORZETA label"
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover object-bottom"
          placeholder="blur"
        />
      </div>
    </main>
  );
}
