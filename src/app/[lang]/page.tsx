import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import bulkHarvest from "@/assets/images/bulk-olives-harvest.jpg";
import fdaLogo from "@/assets/images/certs/fda-logo.svg";
import iocLogo from "@/assets/images/certs/ioc-logo.png";
import onhLogo from "@/assets/images/certs/onh-logo.png";
import sgsLogo from "@/assets/images/certs/sgs-logo.svg";
import grovesHarvest from "@/assets/images/groves-harvest.jpg";
import heritage from "@/assets/images/heritage.jpg";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import {
  ArrowRight,
  ArrowSmall,
  BadgeCheckIcon,
  ClipboardCheckIcon,
  ContainerIcon,
  PhoneIcon,
  ShieldCheckIcon,
} from "@/components/icons";
import { OrzetaBottles } from "@/components/OrzetaBottles";
import { HeroVideo } from "@/components/widgets/HeroVideo";
import { alternates, localizeHref } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { rich } from "@/i18n/rich";
import { openGraphDefaults, site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getDictionary();
  return {
    alternates: alternates(locale, "/"),
    openGraph: {
      ...openGraphDefaults(t.meta.ogImageAlt),
      title: t.meta.home.ogTitle,
      description: t.meta.home.ogDescription,
      url: localizeHref(locale, "/"),
    },
  };
}

const organizationJsonLd = (description: string) => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.name,
  url: `${site.url}/`,
  description,
  foundingDate: "1916",
  address: {
    "@type": "PostalAddress",
    streetAddress: site.address.street,
    addressLocality: site.address.city,
    addressCountry: site.address.countryCode,
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+216-92-300-800",
    email: site.email,
    contactType: "sales",
    availableLanguage: ["en", "fr", "ar"],
  },
});

// Numbers stay here; their labels come from the dictionary in the same order.
const stats = [
  { target: 1500 },
  { target: 3000 },
  { target: 900 },
  { target: 180 },
  { target: 1916, plain: true, photo: heritage },
  { target: 2006, plain: true, photo: grovesHarvest },
];

const exportIcons = [ShieldCheckIcon, ContainerIcon, ClipboardCheckIcon, BadgeCheckIcon, PhoneIcon];

export default async function HomePage() {
  const { locale, t } = await getDictionary();
  const h = t.home;
  const href = (path: string) => localizeHref(locale, path);
  const number = (n: number, plain?: boolean) => (plain ? String(n) : n.toLocaleString("en-US"));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd(t.meta.siteDescription)).replace(/</g, "\\u003c") }}
      />

      {/* ===== HERO ===== */}
      <section className="home-hero scroll-mt-[100px]" id="home">
        <div className="hero-media">
          <HeroVideo />
        </div>
        <div className="hero-overlay" />
        <div className="container">
          <div className="hero-content reveal">
            <span className="hero-eyebrow">{h.hero.eyebrow}</span>
            <h1 className="hero-title">{rich(h.hero.title)}</h1>
            <p className="hero-subtitle">{h.hero.subtitle}</p>
            <div className="hero-actions">
              <a href="#export-enquiry" className="btn btn-gold">
                {h.hero.primary}
              </a>
              <a href="#sourcing" className="btn btn-outline-light">
                {h.hero.secondary}
              </a>
            </div>
            <p className="hero-micro-proof">{h.hero.proof}</p>
          </div>
        </div>
        <div className="hero-facts">
          <div className="container">
            <dl className="hero-facts-grid">
              {h.hero.facts.map((f) => (
                <div key={f.label} className="hero-fact">
                  <dt>{f.label}</dt>
                  <dd>{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ===== PROVENANCE MARQUEE ===== */}
      <div className="provenance-marquee" aria-label={h.marqueeLabel}>
        <ul className="marquee-track">
          {[0, 1].map((copy) =>
            h.provenance.map((item) => (
              <li key={`${copy}-${item}`} aria-hidden={copy === 1 ? true : undefined}>
                {item}
              </li>
            )),
          )}
        </ul>
      </div>

      {/* ===== SOURCING SELECTOR ===== */}
      <section className="section-sm scroll-mt-[100px]" id="sourcing">
        <div className="container">
          <div className="section-header centered reveal">
            <span className="eyebrow-dark">{h.sourcing.eyebrow}</span>
            <h2>{h.sourcing.title}</h2>
          </div>
          <div className="card-grid card-grid-2">
            {(
              [
                ["/bulk-olive-oil", h.sourcing.bulk, ""],
                ["/packaged-products", h.sourcing.packaged, " reveal-delay-1"],
              ] as const
            ).map(([path, card, delay]) => (
              <Link key={path} href={href(path)} className={`card sourcing-card reveal${delay}`}>
                <span className="card-arrow" aria-hidden="true">
                  <ArrowRight size={20} />
                </span>
                <span className="eyebrow">{card.eyebrow}</span>
                <h4>{card.title}</h4>
                <p>{card.text}</p>
                <span className="text-link">
                  {card.link} <ArrowSmall />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TRUST BAR ===== */}
      <section className="section-cream trust-bar">
        <div className="container">
          <span className="eyebrow-dark trust-bar-title">{h.trust.title}</span>
          <div className="cert-strip trust-bar-strip">
            <div className="cert-badge-plate">
              <Image src={iocLogo} alt="International Olive Council" />
            </div>
            <div className="cert-badge-plate">
              <Image src={onhLogo} alt="Office National de l'Huile (ONH)" />
            </div>
            <div className="cert-badge-plate">
              <Image src={fdaLogo} alt="U.S. Food & Drug Administration (FDA)" />
            </div>
            <div className="cert-badge-plate">
              <Image src={sgsLogo} alt="SGS" />
            </div>
            <div className="cert-badge-plate is-wordmark">Oléa Conseil</div>
          </div>
          <p className="trust-bar-text">{h.trust.text}</p>
          <Link href={href("/quality")} className="text-link trust-bar-link">
            {h.trust.link}
          </Link>
        </div>
      </section>

      {/* ===== ABOUT ===== */}
      <section className="section about-olived">
        <div className="container">
          <div className="about-layout">
            <div className="about-text reveal">
              <span className="about-eyebrow">{h.about.eyebrow}</span>
              <h2 className="about-title">{h.about.title}</h2>
              <p className="about-body">{h.about.p1}</p>
              <p className="about-body">{h.about.p2}</p>
              <div className="about-divider" />
              <Link href={href("/maison")} className="about-link">
                {h.about.link}
                <ArrowRight />
              </Link>
            </div>
            <div className="about-image reveal reveal-delay-2">
              <Image src={heritage} alt={h.about.imageAlt} sizes="(max-width: 1024px) 100vw, 50vw" placeholder="blur" />
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="section-sm stats-clean-section scroll-mt-[100px]" id="stats-section">
        <div className="container">
          <div className="section-header centered reveal">
            <span className="eyebrow-dark">{h.stats.eyebrow}</span>
            <h2>{h.stats.title}</h2>
          </div>
          <div className="stats-bento">
            <div className="bento-tile bento-hero reveal">
              <span className="eyebrow">{h.stats.heroEyebrow}</span>
              <div className="bento-hero-number">
                <span className="count-up" data-target="2" data-suffix={h.stats.heroSuffix}>
                  2{h.stats.heroSuffix}
                </span>
              </div>
              <div>
                <div className="bento-hero-label">{h.stats.heroLabel}</div>
                <div className="bento-hero-sub">{h.stats.heroSub}</div>
              </div>
            </div>
            {stats.map((s, i) => (
              <div
                key={s.target}
                className={`bento-tile reveal reveal-delay-${(i % 4) + 1}${s.plain ? " bento-wide bento-photo" : ""}`}
              >
                {s.photo && <Image src={s.photo} alt="" fill sizes="(max-width: 480px) 50vw, (max-width: 1024px) 100vw, 50vw" />}
                <div className="bento-number">
                  <span className="count-up" data-target={s.target} data-plain={s.plain ? "true" : undefined}>
                    {number(s.target, s.plain)}
                  </span>
                </div>
                <div className="bento-label">{h.stats.labels[i]}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FULLBLEED IMAGE ===== */}
      <div className="fullbleed-section">
        <Image src={grovesHarvest} alt={h.fullbleed.imageAlt} sizes="100vw" placeholder="blur" />
        <div className="fullbleed-overlay">
          <div className="container">
            <div className="fullbleed-text reveal">
              <span className="eyebrow">{h.fullbleed.eyebrow}</span>
              <h2>{h.fullbleed.title}</h2>
              <Link href={href("/maison")} className="text-link text-link-light mt-7">
                {h.fullbleed.link} <ArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ===== GROVE TO SHIPMENT ===== */}
      <section className="journey-section section">
        <div className="container">
          <div className="section-header journey-header reveal">
            <span className="eyebrow">{h.journey.eyebrow}</span>
            <h2>{rich(h.journey.title)}</h2>
          </div>
          <ol className="journey-steps">
            {h.journey.steps.map((j, i) => (
              <li key={j.step} className={`journey-step reveal reveal-delay-${Math.min(i + 1, 4)}`}>
                <span className="journey-num">{String(i + 1).padStart(2, "0")}</span>
                <span className="journey-fact">{j.fact}</span>
                <h3>{j.step}</h3>
                <p>{j.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ===== SOLUTIONS ===== */}
      <section className="section section-cream scroll-mt-[100px]" id="solutions">
        <div className="container">
          <div className="section-header centered reveal">
            <span className="eyebrow-dark">{h.solutions.eyebrow}</span>
            <h2>{h.solutions.title}</h2>
            <p className="lead">{h.solutions.lead}</p>
          </div>
        </div>
        <div className="container">
          <div className="solution-feature-grid mt-15">
            <Link href={href("/bulk-olive-oil")} className="solution-card solution-card-feature">
              <div className="solution-card-bg">
                <Image src={bulkHarvest} alt="" fill sizes="(max-width: 900px) 100vw, 60vw" className="object-cover" />
              </div>
              <div className="solution-card-content">
                <span className="solution-card-tag">{h.solutions.bulk.tag}</span>
                <h3>{h.solutions.bulk.title}</h3>
                <p>{h.solutions.bulk.text}</p>
                <div className="solution-region-tags">
                  {h.solutions.bulk.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <span className="solution-card-link">
                  {h.solutions.bulk.link} <ArrowSmall />
                </span>
              </div>
            </Link>
            <div className="solution-stack">
              <Link href={href("/packaged-products")} className="solution-card solution-card-stack">
                <div className="solution-card-bg solution-card-bottles">
                  <OrzetaBottles />
                </div>
                <div className="solution-card-content">
                  <span className="solution-card-tag">{h.solutions.packaged.tag}</span>
                  <h3>{h.solutions.packaged.title}</h3>
                  <p>{h.solutions.packaged.text}</p>
                  <span className="solution-card-link">
                    {h.solutions.packaged.link} <ArrowSmall />
                  </span>
                </div>
              </Link>
            </div>
          </div>
          <p className="distributor-note reveal">
            {h.solutions.distributorQuestion}{" "}
            <Link href={href("/contact#become-distributor")} className="text-link">
              {t.common.becomeDistributor}
            </Link>
          </p>
        </div>
      </section>

      {/* ===== EXPORT CAPABILITIES ===== */}
      <section className="section section-cream export-section">
        <div className="container">
          <div className="export-layout">
            <div className="reveal">
              <span className="eyebrow-dark">{h.export.eyebrow}</span>
              <h2>{h.export.title}</h2>
              <p className="lead mt-4">{h.export.lead}</p>
              <div className="mt-8">
                <a href="#export-enquiry" className="btn btn-primary">
                  {h.export.cta}
                </a>
              </div>
            </div>
            <div className="feature-list reveal reveal-delay-2">
              {h.export.features.map((text, i) => {
                const Icon = exportIcons[i];
                return (
                  <div className="feature-item" key={text}>
                    <div className="feature-icon">
                      <Icon />
                    </div>
                    <div className="feature-text">
                      <p>{text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
      {/* Export regions and the "40+ countries" figure come from the 2026 catalogue (see home.export.lead). */}

      {/* ===== FINAL CTA + EXPORT ENQUIRY FORM ===== */}
      <div className="cta-band scroll-mt-[100px]" id="export-enquiry">
        <div className="container">
          <div className="cta-form-layout">
            <div className="reveal">
              <h2>{h.cta.title}</h2>
              <p>{h.cta.text}</p>
            </div>
            <div className="reveal reveal-delay-2">
              <EnquiryForm source="home" t={t.form} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
