import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import grovesHarvest from "@/assets/images/groves-harvest.jpg";
import millennialTrees from "@/assets/images/millennial-trees.jpg";

export const metadata: Metadata = {
  title: { absolute: "Notre Maison — Heritage & Vision | OLIVED Tunisian Olive Oil" },
  description:
    "Discover the OLIVED Maison — a Tunisian house built on thousand-year-old heritage, single-source philosophy and international excellence.",
  alternates: { canonical: "/maison" },
};

const figures = [
  { num: "2006", label: "Founded" },
  { num: "4", label: "Generations" },
  { num: "1,500", label: "Hectares" },
  { num: "20+", label: "Markets" },
];

// "Owned groves" was changed to "plantations": olived.tn does not state ownership (see AUDIT.md).
const finalStats = [
  { num: "1,500", label: "ha of Plantations" },
  { num: "3,000", label: "MT Annual Production" },
  { num: "180", label: "MT/Day Extraction" },
];

export default function MaisonPage() {
  return (
    <>
      {/* § 1 — HERO */}
      <section className="mn-hero" id="hero">
        <div className="mn-hero-bg">
          <Image src={grovesHarvest} alt="" fill preload sizes="100vw" className="object-cover" placeholder="blur" />
        </div>
        <div className="mn-hero-overlay" />
        <div className="container">
          <div className="mn-hero-content reveal">
            <span className="mn-eyebrow">Notre Maison</span>
            <h1 className="mn-hero-title">
              A Tunisian House.
              <br />
              <em>For the World&apos;s Finest Tables.</em>
            </h1>
            <a href="#maison-intro" className="mn-scroll-cta">
              <span>Discover the Maison</span>
              <svg width="14" height="22" viewBox="0 0 14 22" fill="none" aria-hidden="true">
                <path d="M7 3v16M1 13l6 6 6-6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* § 2 — MAISON INTRO + § 3 KEY FIGURES */}
      <section className="mn-intro scroll-mt-[100px]" id="maison-intro">
        <div className="container">
          <div className="mn-intro-grid reveal">
            <div className="mn-intro-left">
              <span className="mn-label">Groupe OLIVED</span>
              <h2 className="mn-intro-title">
                A House Built
                <br />
                <em>Over Generations</em>
              </h2>
            </div>
            <div className="mn-intro-right">
              <p className="mn-intro-body">
                Founded in 2006 in the Sfax region, OLIVED has built a fully integrated, single-source model over four
                generations — from our own groves to extraction, controlled storage and global distribution.
              </p>
              <a href="#patrimoine" className="mn-text-link">
                Read More <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>

          <div className="mn-figures reveal">
            {figures.flatMap((f, i) => [
              ...(i > 0 ? [<span key={`sep-${i}`} className="mn-fig-sep" aria-hidden="true" />] : []),
              <div className="mn-fig" key={f.label}>
                <span className="mn-fig-num">{f.num}</span>
                <span className="mn-fig-label">{f.label}</span>
              </div>,
            ])}
          </div>
        </div>
      </section>

      {/* § 4 — HERITAGE / LAND */}
      <section className="mn-heritage scroll-mt-[100px]" id="patrimoine">
        <div className="container">
          <div className="mn-heritage-grid">
            <div className="mn-heritage-img reveal">
              <Image
                src={millennialTrees}
                alt="Millennial olive trees — Sfax Region, Tunisia"
                sizes="(max-width: 900px) 100vw, 50vw"
                placeholder="blur"
              />
              <span className="mn-img-caption">Sfax Region · Tunisia · Since Antiquity</span>
            </div>

            <div className="mn-heritage-content reveal reveal-delay-2">
              <span className="mn-label">Patrimoine Tunisien</span>
              <h2 className="mn-section-title">
                A Land of
                <br />
                <em>Civilisation</em>
              </h2>
              <p className="mn-poem">
                For over millennia,
                <br />
                the olive tree has shaped this land.
                <br />
                <br />
                Not as agriculture —
                <br />
                but as culture.
              </p>
              <p className="mn-varieties">Chemlali · Chetoui · Oueslati · Zarazi · Picholine Tunisienne</p>
              <ul className="mn-facts">
                <li>Tunisia is among the world&apos;s leading olive oil exporters.</li>
                <li>
                  Over <strong>80 million olive trees</strong> across the country.
                </li>
                <li>
                  Nearly <strong>30%</strong> of cultivable land dedicated to olive groves.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* § 5 — SINGLE-SOURCE PHILOSOPHY
          TODO: replace the background with a macro olive-oil pour or tasting scene. */}
      <section className="mn-philosophy" id="terroir">
        <div className="mn-philosophy-bg">
          <Image src={millennialTrees} alt="" fill sizes="100vw" className="object-cover" />
        </div>
        <div className="mn-philosophy-overlay" />
        <div className="container">
          <div className="mn-philosophy-content reveal">
            <span className="mn-eyebrow-gold">Single-Source Philosophy</span>
            <h2 className="mn-philosophy-title">
              When Origin Is Known,
              <br />
              <em>Everything Else Follows.</em>
            </h2>
            <p className="mn-philosophy-sub">Every litre is traceable from grove to harvest, extraction and analysis.</p>
            <div className="mn-philosophy-actions">
              <Link href="/contact" className="mn-btn-gold">
                Request a Presentation
              </Link>
              <Link href="/bulk-olive-oil" className="mn-btn-ghost">
                Discover Our Grades
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* § 6 — FINAL CTA */}
      <section className="mn-final" id="contact-cta">
        <div className="container">
          <div className="mn-final-stats reveal">
            {finalStats.flatMap((s, i) => [
              ...(i > 0 ? [<span key={`sep-${i}`} className="mn-fstat-sep" aria-hidden="true" />] : []),
              <div className="mn-fstat" key={s.label}>
                <span className="mn-fstat-num">{s.num}</span>
                <span className="mn-fstat-label">{s.label}</span>
              </div>,
            ])}
          </div>

          <div className="mn-final-rule" />

          <div className="mn-final-cta reveal">
            <h2 className="mn-final-title">
              Work With
              <br />
              <em>OLIVED</em>
            </h2>
            <p className="mn-final-sub">For bulk buyers, distributors and brand partners.</p>
            <div className="mn-final-actions">
              <Link href="/contact" className="mn-btn-gold">
                Request a Quote
              </Link>
              <Link href="/contact#become-distributor" className="mn-btn-ghost-light">
                Become a Distributor
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
