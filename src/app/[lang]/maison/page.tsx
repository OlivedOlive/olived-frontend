import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import grovesHarvest from "@/assets/images/groves-harvest.jpg";
import millennialTrees from "@/assets/images/millennial-trees.jpg";
import { alternates, localizeHref } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { rich } from "@/i18n/rich";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getDictionary();
  return {
    title: { absolute: t.meta.maison.title },
    description: t.meta.maison.description,
    alternates: alternates(locale, "/maison"),
  };
}

// Numbers stay here; labels come from the dictionary in the same order.
const figures = ["2006", "4", "1,500", "40+"];

// "Owned groves" was changed to "plantations": olived.tn does not state ownership (see AUDIT.md).
const finalStats = ["1,500", "3,000", "180"];

export default async function MaisonPage() {
  const { locale, t } = await getDictionary();
  const m = t.maison;
  const href = (path: string) => localizeHref(locale, path);

  return (
    <>
      {/* § 1 — HERO */}
      <section className="mn-hero" id="hero">
        <div className="mn-hero-bg">
          <Image
            src={grovesHarvest}
            alt=""
            fill
            loading="eager"
            fetchPriority="high"
            sizes="100vw"
            className="object-cover"
            placeholder="blur"
          />
        </div>
        <div className="mn-hero-overlay" />
        <div className="container">
          <div className="mn-hero-content reveal">
            <span className="mn-eyebrow">{m.hero.eyebrow}</span>
            <h1 className="mn-hero-title">{rich(m.hero.title)}</h1>
            <a href="#maison-intro" className="mn-scroll-cta">
              <span>{m.hero.scroll}</span>
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
              <span className="mn-label">{m.intro.label}</span>
              <h2 className="mn-intro-title">{rich(m.intro.title)}</h2>
            </div>
            <div className="mn-intro-right">
              <p className="mn-intro-body">{m.intro.body}</p>
              <a href="#patrimoine" className="mn-text-link">
                {m.intro.more} <span className="mn-arrow" aria-hidden="true">→</span>
              </a>
            </div>
          </div>

          <div className="mn-figures reveal">
            {figures.flatMap((num, i) => [
              ...(i > 0 ? [<span key={`sep-${i}`} className="mn-fig-sep" aria-hidden="true" />] : []),
              <div className="mn-fig" key={num}>
                <span className="mn-fig-num">{num}</span>
                <span className="mn-fig-label">{m.figures[i]}</span>
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
                alt={m.heritage.imageAlt}
                sizes="(max-width: 900px) 100vw, 50vw"
                placeholder="blur"
              />
              <span className="mn-img-caption">{m.heritage.caption}</span>
            </div>

            <div className="mn-heritage-content reveal reveal-delay-2">
              <span className="mn-label">{m.heritage.label}</span>
              <h2 className="mn-section-title">{rich(m.heritage.title)}</h2>
              <p className="mn-poem">{rich(m.heritage.poem)}</p>
              <p className="mn-varieties">{m.heritage.varieties}</p>
              <ul className="mn-facts">
                {m.heritage.facts.map((fact) => (
                  <li key={fact}>{rich(fact)}</li>
                ))}
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
            <span className="mn-eyebrow-gold">{m.philosophy.eyebrow}</span>
            <h2 className="mn-philosophy-title">{rich(m.philosophy.title)}</h2>
            <p className="mn-philosophy-sub">{m.philosophy.sub}</p>
            <div className="mn-philosophy-actions">
              <Link href={href("/contact")} className="mn-btn-gold">
                {m.philosophy.primary}
              </Link>
              <Link href={href("/bulk-olive-oil")} className="mn-btn-ghost">
                {m.philosophy.secondary}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* § 6 — FINAL CTA */}
      <section className="mn-final" id="contact-cta">
        <div className="container">
          <div className="mn-final-stats reveal">
            {finalStats.flatMap((num, i) => [
              ...(i > 0 ? [<span key={`sep-${i}`} className="mn-fstat-sep" aria-hidden="true" />] : []),
              <div className="mn-fstat" key={num}>
                <span className="mn-fstat-num">{num}</span>
                <span className="mn-fstat-label">{m.final.stats[i]}</span>
              </div>,
            ])}
          </div>

          <div className="mn-final-rule" />

          <div className="mn-final-cta reveal">
            <h2 className="mn-final-title">{rich(m.final.title)}</h2>
            <p className="mn-final-sub">{m.final.sub}</p>
            <div className="mn-final-actions">
              <Link href={href("/contact")} className="mn-btn-gold">
                {t.common.requestQuote}
              </Link>
              <Link href={href("/contact#become-distributor")} className="mn-btn-ghost-light">
                {t.common.becomeDistributor}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
