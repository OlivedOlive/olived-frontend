import Image from "next/image";
import Link from "next/link";
import bulkHarvest from "@/assets/images/bulk-olives-harvest.jpg";
import fdaLogo from "@/assets/images/certs/fda-logo.svg";
import iocLogo from "@/assets/images/certs/ioc-logo.png";
import onhLogo from "@/assets/images/certs/onh-logo.png";
import sgsLogo from "@/assets/images/certs/sgs-logo.svg";
import grovesHarvest from "@/assets/images/groves-harvest.jpg";
import heritage from "@/assets/images/heritage.jpg";
import orzetaPackshot from "@/assets/images/orzeta-packshot.jpg";
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
import { HeroVideo } from "@/components/widgets/HeroVideo";
import { site } from "@/lib/site";

export const metadata = {
  alternates: { canonical: "/" },
  openGraph: {
    title: "Tunisian Extra Virgin Olive Oil Supplier | OLIVED",
    description: "Family-owned Tunisian olive oil producer since 1916, exporting since 2006. Bulk and packaged EVOO.",
    url: "/",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.name,
  url: `${site.url}/`,
  description:
    "Family-owned Tunisian producer and exporter of extra virgin olive oil since 1916, exporting internationally since 2006 — bulk and packaged. FDA-registered facility, IOC-certified laboratory.",
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
    availableLanguage: ["en", "fr"],
  },
};

const stats = [
  { target: 1500, label: "Hectares of Groves" },
  { target: 3000, label: "MT — Annual Production" },
  { target: 900, label: "T — Stainless-Steel Storage" },
  { target: 180, label: "MT/Day — Extraction Capacity" },
  { target: 1916, label: "Family Heritage", plain: true },
  { target: 2006, label: "International Export", plain: true },
];

const exportFeatures = [
  { icon: ShieldCheckIcon, text: "Bulk and packaged solutions" },
  { icon: ContainerIcon, text: "Flexitank, IBC and drums" },
  { icon: ClipboardCheckIcon, text: "Export documentation" },
  { icon: BadgeCheckIcon, text: "SGS analysis before shipment" },
  { icon: PhoneIcon, text: "Tailored quotation" },
];

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c") }}
      />

      {/* ===== HERO ===== */}
      <section className="home-hero scroll-mt-[100px]" id="home">
        <div className="hero-media">
          <HeroVideo />
        </div>
        <div className="hero-overlay" />
        <div className="container">
          <div className="hero-content reveal">
            <span className="hero-eyebrow">Tunisian Producer · Full Traceability · Export-Ready</span>
            <h1 className="hero-title">
              Tunisian Olive Oil.
              <br />
              From Our Groves
              <br />
              <em>to the World.</em>
            </h1>
            <p className="hero-subtitle">
              Bulk and packaged olive oil, supported by controlled production, verified quality and export-ready
              documentation.
            </p>
            <div className="hero-actions">
              <a href="#export-enquiry" className="btn btn-gold">
                Get a Tailored Export Offer
              </a>
              <a href="#sourcing" className="btn btn-outline-light">
                Explore Our Capabilities
              </a>
            </div>
            <p className="hero-micro-proof">
              Response within 24 business hours · Confidential enquiry · Export documentation provided
            </p>
          </div>
        </div>
        <div className="hero-scroll" aria-hidden="true">
          <div className="hero-scroll-line" />
          <span>Scroll</span>
        </div>
      </section>

      {/* ===== SOURCING SELECTOR ===== */}
      <section className="section-sm scroll-mt-[100px]" id="sourcing">
        <div className="container">
          <div className="section-header centered reveal">
            <span className="eyebrow-dark">Start Your Enquiry</span>
            <h2>What are you sourcing?</h2>
          </div>
          <div className="card-grid card-grid-2">
            <Link href="/bulk-olive-oil" className="card sourcing-card reveal">
              <span className="eyebrow">Bulk Export</span>
              <h4>Bulk Olive Oil</h4>
              <p>EVOO, virgin, refined and pomace olive oil in export-ready bulk formats.</p>
              <span className="text-link">
                Explore Bulk <ArrowSmall />
              </span>
            </Link>
            <Link href="/packaged-products" className="card sourcing-card reveal reveal-delay-1">
              <span className="eyebrow">Retail Ready</span>
              <h4>Packaged Collection</h4>
              <p>ORZETA — a premium packaged collection with Mediterranean character, ready for retail shelves.</p>
              <span className="text-link">
                Discover ORZETA <ArrowSmall />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== TRUST BAR ===== */}
      <section className="section-cream trust-bar">
        <div className="container">
          <span className="eyebrow-dark trust-bar-title">Quality Verified for International Trade</span>
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
          <p className="trust-bar-text">
            FDA-registered facility · IOC-certified laboratory · ONH export verification · SGS analysis before shipment
          </p>
          <Link href="/quality" className="text-link trust-bar-link">
            View Quality Credentials
          </Link>
        </div>
      </section>

      {/* ===== ABOUT ===== */}
      <section className="section about-olived">
        <div className="container">
          <div className="about-layout">
            <div className="about-text reveal">
              <span className="about-eyebrow">Family Heritage Since 1916</span>
              <h2 className="about-title">A Tunisian Olive Oil Heritage, Built for International Markets</h2>
              <p className="about-body">
                Rooted in Sfax since 1916, our family heritage combines generations of agricultural knowledge with
                modern extraction, storage and export capabilities.
              </p>
              <p className="about-body">
                Our single-source philosophy gives us control from grove to shipment — supporting traceability,
                consistent quality and dependable supply for international partners.
              </p>
              <div className="about-divider" />
              <Link href="/maison" className="about-link">
                Discover Our Maison
                <ArrowRight />
              </Link>
            </div>
            <div className="about-image reveal reveal-delay-2">
              <Image
                src={heritage}
                alt="OLIVED — olive groves in Sfax, Tunisia"
                sizes="(max-width: 1024px) 100vw, 50vw"
                placeholder="blur"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="section-sm stats-clean-section scroll-mt-[100px]" id="stats-section">
        <div className="container">
          <div className="section-header centered reveal">
            <span className="eyebrow-dark">Scale, Control &amp; Reliability</span>
            <h2>Built to Supply International Markets</h2>
          </div>
          <div className="stats-hero-grid">
            <div className="stat-hero reveal">
              <span className="eyebrow-dark">Global Standing</span>
              <div className="stat-hero-number">
                <span className="count-up" data-target="2" data-suffix="nd">
                  2nd
                </span>
              </div>
              <div className="stat-hero-label">Tunisia: World&apos;s 2nd Olive Oil Exporter</div>
              <div className="stat-hero-sub">IOC — 2024/25 season</div>
            </div>
            <div className="stats-clean-grid stats-clean-grid-6">
              {stats.map((s, i) => (
                <div key={s.label} className={`stat-clean reveal reveal-delay-${(i % 4) + 1}`}>
                  <div className="stat-clean-number">
                    <span className="count-up" data-target={s.target} data-plain={s.plain ? "true" : undefined}>
                      {s.plain ? s.target : s.target.toLocaleString("en-US")}
                    </span>
                  </div>
                  <div className="stat-clean-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== FULLBLEED IMAGE ===== */}
      <div className="fullbleed-section">
        <Image src={grovesHarvest} alt="OLIVED olive groves at harvest" sizes="100vw" placeholder="blur" />
        <div className="fullbleed-overlay">
          <div className="container">
            <div className="fullbleed-text reveal">
              <span className="eyebrow">Single-Source Control</span>
              <h2>From Our Tunisian Groves to Global Markets — Controlled at Every Step.</h2>
              <Link href="/maison" className="text-link text-link-light mt-7">
                See Our Production <ArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ===== SOLUTIONS ===== */}
      <section className="section section-cream scroll-mt-[100px]" id="solutions">
        <div className="container">
          <div className="section-header centered reveal">
            <span className="eyebrow-dark">Our Offer</span>
            <h2>Two Ways to Work with OLIVED</h2>
            <p className="lead">Bulk or packaged — a solution for every market.</p>
          </div>
        </div>
        <div className="container">
          <div className="solution-feature-grid mt-15">
            <Link href="/bulk-olive-oil" className="solution-card solution-card-feature">
              <div className="solution-card-bg">
                <Image src={bulkHarvest} alt="" fill sizes="(max-width: 900px) 100vw, 60vw" className="object-cover" />
              </div>
              <div className="solution-card-content">
                <span className="solution-card-tag">Bulk Export</span>
                <h3>Bulk Olive Oil</h3>
                <p>
                  EVOO, virgin, refined and pomace olive oil available in export-ready bulk formats, subject to
                  specification and availability.
                </p>
                <div className="solution-region-tags">
                  <span>Flexitank</span>
                  <span>IBC</span>
                  <span>Drums</span>
                </div>
                <span className="solution-card-link">
                  Explore Bulk Solutions <ArrowSmall />
                </span>
              </div>
            </Link>
            <div className="solution-stack">
              <Link href="/packaged-products" className="solution-card solution-card-stack">
                <div className="solution-card-bg bg-charcoal">
                  <Image src={orzetaPackshot} alt="" fill sizes="(max-width: 900px) 100vw, 40vw" className="object-cover" />
                </div>
                <div className="solution-card-content">
                  <span className="solution-card-tag">Packaged Collection</span>
                  <h3>ORZETA</h3>
                  <p>
                    A premium packaged collection combining Tunisian origin, contemporary presentation and Mediterranean
                    character.
                  </p>
                  <span className="solution-card-link">
                    Discover ORZETA <ArrowSmall />
                  </span>
                </div>
              </Link>
            </div>
          </div>
          <p className="distributor-note reveal">
            Interested in representing ORZETA in your market?{" "}
            <Link href="/contact#become-distributor" className="text-link">
              Become a Distributor
            </Link>
          </p>
        </div>
      </section>

      {/* ===== EXPORT CAPABILITIES ===== */}
      <section className="section section-cream">
        <div className="container">
          <div className="export-layout">
            <div className="reveal">
              <span className="eyebrow-dark">Export Capabilities</span>
              <h2>Export-Ready for Your Destination</h2>
              <p className="lead mt-4">
                Tell us the product, estimated volume and destination. Our team will prepare the appropriate commercial
                and export response.
              </p>
              <div className="mt-8">
                <a href="#export-enquiry" className="btn btn-primary">
                  Discuss Your Destination
                </a>
              </div>
            </div>
            <div className="feature-list reveal reveal-delay-2">
              {exportFeatures.map(({ icon: Icon, text }) => (
                <div className="feature-item" key={text}>
                  <div className="feature-icon">
                    <Icon />
                  </div>
                  <div className="feature-text">
                    <p>{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* TODO: add specific export markets / countries once an official, confirmed list is available. */}

      {/* ===== FINAL CTA + EXPORT ENQUIRY FORM ===== */}
      <div className="cta-band scroll-mt-[100px]" id="export-enquiry">
        <div className="container">
          <div className="cta-form-layout">
            <div className="reveal">
              <h2>Tell Us What You Need</h2>
              <p>
                Share your product, estimated volume and destination. Our export team will respond within 24 business
                hours.
              </p>
            </div>
            <div className="reveal reveal-delay-2">
              <EnquiryForm source="home" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
