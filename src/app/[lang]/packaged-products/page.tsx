import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowSmall } from "@/components/icons";
import { orzetaBottles, OrzetaBottles } from "@/components/OrzetaBottles";
import { alternates, localizeHref } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getDictionary();
  return {
    title: { absolute: t.meta.packaged.title },
    description: t.meta.packaged.description,
    alternates: alternates(locale, "/packaged-products"),
  };
}

// Layout details per format card (same order as the dictionary's formats.cards).
const formatCardLayout: { variant?: string; id?: string }[] = [{}, { variant: "orzeta-format-card-olive" }, { id: "tin" }];

export default async function PackagedProductsPage() {
  const { locale, t } = await getDictionary();
  const p = t.packaged;
  const href = (path: string) => localizeHref(locale, path);

  return (
    <>
      <section className="orzeta-hero-section">
        <div className="container-wide">
          <div className="orzeta-hero-shell">
            <div className="orzeta-branch" aria-hidden="true">
              <svg viewBox="0 0 180 190" role="presentation">
                <path d="M91 0c-2 20-2 38 1 57 4 22 4 45-1 71-4 19-4 39 0 62" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                <path d="M91 42c-19-7-36-8-52-3 12 10 28 12 49 9" fill="#6B7D3A" />
                <path d="M95 62c15 4 31 5 48 1-10-10-25-13-45-10" fill="#718145" />
                <path d="M78 76c-13 9-22 22-28 40 18-3 28-16 31-37" fill="#62723A" />
                <path d="M101 88c14 2 28-1 41-11-14-6-27-4-40 7" fill="#7A8A4A" />
                <path d="M73 120c-12 11-18 26-18 46 14-8 21-22 22-42" fill="#566730" />
                <path d="M107 121c11 2 22-1 33-10-12-5-22-3-32 5" fill="#819151" />
                <path d="M110 146c9 4 19 5 31 3-7-8-16-10-29-8" fill="#6C7E40" />
              </svg>
            </div>

            <div className="orzeta-side-rail" aria-hidden="true">
              {p.rail.map((r) => (
                <span key={r}>{r}</span>
              ))}
            </div>

            <div className="orzeta-hero-grid">
              <div className="orzeta-hero-copy reveal">
                <span className="orzeta-kicker">{p.hero.kicker}</span>
                <p className="orzeta-mini-label">{p.hero.mini}</p>
                <h1 className="orzeta-title">
                  <span className="orzeta-title-soft">{p.hero.titleSoft}</span>
                  <span className="orzeta-title-strong">{p.hero.titleStrong}</span>
                </h1>
                <p className="orzeta-copy">{p.hero.copy}</p>
                <div className="orzeta-hero-actions">
                  <a href="#retail" className="btn btn-gold">
                    {p.hero.primary}
                  </a>
                  <Link href={href("/contact")} className="btn btn-outline">
                    {p.hero.secondary}
                  </Link>
                </div>
                <div className="orzeta-hero-meta">
                  {p.hero.meta.map((m) => (
                    <div className="orzeta-hero-meta-item" key={m.label}>
                      <span>{m.label}</span>
                      <strong>{m.value}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="orzeta-hero-visual reveal reveal-delay-2">
                <div className="orzeta-stage">
                  <div className="orzeta-stage-tags">
                    {p.hero.tags.map((tag) => (
                      <span className="orzeta-stage-tag" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="orzeta-stage-card orzeta-stage-card-top">
                    <span className="orzeta-stage-card-label">{p.hero.blendLabel}</span>
                    <p>{p.hero.blend}</p>
                  </div>
                  <OrzetaBottles
                    eager
                    alts={{
                      sun: p.collection.sun.imageAlt,
                      grove: p.collection.grove.imageAlt,
                      organic: p.collection.organic.imageAlt,
                    }}
                  />
                  <div className="orzeta-stage-card orzeta-stage-card-bottom">
                    <span className="orzeta-stage-card-label">{p.hero.shelfLabel}</span>
                    <p>{p.hero.shelf}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="orzeta-hero-footer reveal reveal-delay-3">
              {p.hero.footer.map((f) => (
                <div className="orzeta-hero-footer-item" key={f.label}>
                  <span>{f.label}</span>
                  <p>{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section scroll-mt-[100px]" id="retail">
        <div className="container">
          <div className="section-header centered reveal">
            <span className="eyebrow-dark">{p.collection.eyebrow}</span>
            <h2>{p.collection.title}</h2>
            <p className="lead">{p.collection.lead}</p>
          </div>

          <div className="orzeta-collection-grid">
            <article className="orzeta-product-card reveal">
              <div className="orzeta-bottle-stage orzeta-bottle-stage-sun">
                <Image src={orzetaBottles.sun} alt={p.collection.sun.imageAlt} sizes="130px" />
              </div>
              <div className="orzeta-product-card-body">
                <span className="orzeta-card-kicker">{p.collection.sun.kicker}</span>
                <h3>{p.collection.sun.title}</h3>
                <p>{p.collection.sun.text}</p>
                <Chips items={p.collection.sun.chips} />
              </div>
              <div className="orzeta-product-card-footer">
                <span className="orzeta-product-note">{p.collection.sun.note}</span>
                <Link href={href("/contact")} className="text-link">
                  {p.collection.sun.link} <ArrowSmall />
                </Link>
              </div>
            </article>

            <article className="orzeta-product-card reveal reveal-delay-1">
              <div className="orzeta-bottle-stage orzeta-bottle-stage-grove">
                <Image src={orzetaBottles.grove} alt={p.collection.grove.imageAlt} sizes="130px" />
              </div>
              <div className="orzeta-product-card-body">
                <span className="orzeta-card-kicker">{p.collection.grove.kicker}</span>
                <h3>{p.collection.grove.title}</h3>
                <p>{p.collection.grove.text}</p>
                <Chips items={p.collection.grove.chips} />
              </div>
              <div className="orzeta-product-card-footer">
                <span className="orzeta-product-note">{p.collection.grove.note}</span>
                <Link href={href("/contact")} className="text-link">
                  {p.collection.grove.link} <ArrowSmall />
                </Link>
              </div>
            </article>

            {/* NOTE: "Organic" needs certificate details before publication. */}
            <article className="orzeta-product-card reveal reveal-delay-2">
              <div className="orzeta-bottle-stage orzeta-bottle-stage-organic">
                <Image src={orzetaBottles.organic} alt={p.collection.organic.imageAlt} sizes="130px" />
              </div>
              <div className="orzeta-product-card-body">
                <span className="orzeta-card-kicker">{p.collection.organic.kicker}</span>
                <h3>{p.collection.organic.title}</h3>
                <p>{p.collection.organic.text}</p>
                <Chips items={p.collection.organic.chips} />
              </div>
              <div className="orzeta-product-card-footer">
                <span className="orzeta-product-note">{p.collection.organic.note}</span>
                <Link href={href("/contact")} className="text-link">
                  {p.collection.organic.link} <ArrowSmall />
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="section section-cream" id="premium">
        <div className="container">
          <div className="orzeta-editorial-panel">
            <div className="orzeta-editorial-copy reveal">
              <span className="eyebrow">{p.editorial.eyebrow}</span>
              <h2>{p.editorial.title}</h2>
              <p className="orzeta-editorial-text">{p.editorial.text}</p>
              <div className="orzeta-note-grid">
                {p.editorial.notes.map((n) => (
                  <div className="orzeta-note-card" key={n.title}>
                    <h4>{n.title}</h4>
                    <p>{n.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="orzeta-editorial-visual reveal reveal-delay-2">
              <div className="orzeta-editorial-stage">
                <Image src={orzetaBottles.sun} alt={p.collection.sun.imageAlt} sizes="200px" />
                <div className="orzeta-editorial-caption">
                  <span>{p.editorial.captionLabel}</span>
                  <p>{p.editorial.caption}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="foodservice">
        <div className="container">
          <div className="section-header centered reveal">
            <span className="eyebrow-dark">{p.formats.eyebrow}</span>
            <h2>{p.formats.title}</h2>
            <p className="lead">{p.formats.lead}</p>
          </div>

          <div className="orzeta-format-grid">
            {p.formats.cards.map((c, i) => (
              <article
                key={c.title}
                id={formatCardLayout[i]?.id}
                className={["orzeta-format-card", formatCardLayout[i]?.variant, "reveal", i > 0 && `reveal-delay-${i}`]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span className="orzeta-format-kicker">{c.kicker}</span>
                <h3>{c.title}</h3>
                <p>{c.text}</p>
                <ul className="orzeta-format-list">
                  {c.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className="cta-band">
        <div className="container">
          <div className="cta-band-inner">
            <div className="reveal">
              <h2>{p.cta.title}</h2>
              <p>{p.cta.text}</p>
            </div>
            <div className="cta-band-actions reveal reveal-delay-2">
              <Link href={href("/contact")} className="btn btn-outline-light">
                {p.cta.primary}
              </Link>
              <Link href={href("/contact")} className="btn btn-gold">
                {p.cta.secondary}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Chips({ items }: { items: string[] }) {
  return (
    <div className="orzeta-chip-row">
      {items.map((c) => (
        <span className="orzeta-chip" key={c}>
          {c}
        </span>
      ))}
    </div>
  );
}
