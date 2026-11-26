import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import bottles from "@/assets/images/studio/bottles.jpg";
import { RedirectIfLoggedIn } from "@/components/studio/RedirectIfLoggedIn";
import { StudioMark } from "@/components/studio/StudioMark";

const STEPS = [
  { title: "Product", text: "ORZETA, Oussoul or your own brand, and the bottle size." },
  { title: "Details", text: "The market and where you will sell. The label starts with its required wording." },
  { title: "Front", text: "Logo, product name and net quantity, the side that faces the shopper." },
  { title: "Sides", text: "Product information, importer, barcode and nutrition table." },
  { title: "3D check", text: "Turn the bottle, fix what the checklist finds, and submit." },
];

const FEATURES = [
  {
    icon: "M4 6h16M4 12h16M4 18h10",
    title: "Market wording built in",
    text: "Templates for Europe, the UK, North America, the Gulf, Russia and Asia, in the languages each market asks for.",
  },
  {
    icon: "M5 12.5l4.2 4.2L19 7",
    title: "Live compliance checks",
    text: "Every required statement, text size, panel and barcode is checked as you type, with one click to fix each point.",
  },
  {
    icon: "M12 3l8 4.5v9L12 21l-8-4.5v-9z",
    title: "A pro label editor",
    text: "Move, resize and restyle every block, add your logos and real EAN or UPC barcodes, and see it on the bottle in 3D.",
  },
];

export default function HomePage() {
  return (
    <div className="studio-landing">
      <Suspense>
        <RedirectIfLoggedIn />
      </Suspense>

      <header className="studio-landing-bar">
        <Link href="/studio" className="studio-brand" aria-label="OLIVED Studio">
          <StudioMark />
          <span className="studio-brand-name">OLIVED <span>Studio</span></span>
        </Link>
        <nav className="flex items-center gap-2" aria-label="Account">
          <Link href="/studio/login" className="studio-landing-link">Log in</Link>
          <Link href="/studio/register" className="studio-topbar-new">Create an account</Link>
        </nav>
      </header>

      <main>
        <section className="studio-hero">
          <div className="studio-hero-text">
            <p className="studio-eyebrow"><span aria-hidden="true" />Packaging designer for importers</p>
            <h1>Design your olive oil packaging, <em>ready for your market.</em></h1>
            <p className="studio-hero-lead">
              Start with ORZETA, Oussoul or your own brand. Build the label, retail box and shipping case for your destination
              market, and send it to OLIVED for review before printing.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/studio/register" className="studio-cta">Create an account <span aria-hidden="true">→</span></Link>
              <Link href="/studio/login" className="studio-cta-outline">Log in</Link>
            </div>
            <ul className="studio-hero-points">
              <li>Market templates for 13 countries</li>
              <li>Live label checks</li>
              <li>3D bottle preview</li>
            </ul>
          </div>

          <div className="studio-hero-visual">
            <div className="studio-hero-photo">
              <Image src={bottles} alt="Four olive oil bottles from 250 ml to 1 litre, with the ORZETA label" fill priority
                sizes="(min-width: 1024px) 46vw, 100vw" className="object-cover object-bottom" placeholder="blur" />
            </div>
            <div className="studio-float studio-float-a"><span className="studio-float-dot" />Checklist complete · Germany</div>
            <div className="studio-float studio-float-b"><span aria-hidden="true">▥</span> EAN-13 barcode drawn</div>
            <div className="studio-float studio-float-c"><span aria-hidden="true">↻</span> 3D preview</div>
          </div>
        </section>

        <section className="studio-landing-section" aria-labelledby="steps-title">
          <p className="studio-section-kicker">How it works</p>
          <h2 id="steps-title">Five steps from bottle to approved label</h2>
          <ol className="studio-steps-grid">
            {STEPS.map((item, index) => (
              <li key={item.title}>
                <span className="studio-step-badge">{index + 1}</span>
                <strong>{item.title}</strong>
                <span>{item.text}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="studio-landing-section" aria-labelledby="features-title">
          <p className="studio-section-kicker">Why OLIVED Studio</p>
          <h2 id="features-title">Everything a compliant label needs</h2>
          <div className="studio-features">
            {FEATURES.map((feature) => (
              <article key={feature.title} className="studio-feature">
                <span className="studio-feature-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24"><path d={feature.icon} /></svg>
                </span>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="studio-landing-cta">
          <div>
            <h2>Your next label starts here.</h2>
            <p>Create an account for your company in a minute. OLIVED reviews every design before it is printed.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/studio/register" className="studio-cta studio-cta-light">Create an account <span aria-hidden="true">→</span></Link>
            <Link href="/studio/login" className="studio-cta-outline studio-cta-outline-light">Log in</Link>
          </div>
        </section>
      </main>

      <footer className="studio-landing-foot">
        <span>© OLIVED · Sfax, Tunisia</span>
        {/* The website is a different root layout, so this is a full page load in the visitor's language. */}
        <Link href="/">Back to the OLIVED website</Link>
      </footer>
    </div>
  );
}
