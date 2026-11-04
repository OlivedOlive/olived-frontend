import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import orzetaPackshot from "@/assets/images/orzeta-packshot.jpg";
import { ArrowSmall } from "@/components/icons";

export const metadata: Metadata = {
  title: { absolute: "ORZETA Packaged Olive Oil - Premium Retail Collection | OLIVED Tunisia" },
  description:
    "Discover ORZETA by OLIVED - a premium Tunisian olive oil collection for gourmet retail, gifting and refined hospitality. Elegant packaging, Mediterranean character, export-ready execution.",
  alternates: { canonical: "/packaged-products" },
};

const heroMeta = [
  { label: "Formats", value: "250ml to 750ml" },
  { label: "Profile", value: "Soft fruit, almond, olive leaf" },
  { label: "Use", value: "Retail, gifting, hospitality" },
];

const heroFooter = [
  { label: "Material feel", text: "Soft matte labels, restrained palette, precise typography." },
  { label: "Collection logic", text: "Glass bottles, gifting formats and merchandising continuity." },
  { label: "Execution", text: "Palletised delivery, compliant labelling and clean export documentation." },
];

const notes = [
  { title: "Editorial whitespace", text: "Large breathing room around the product keeps the presentation calm, expensive and deliberate." },
  { title: "Soft olive accents", text: "Olive green is used with restraint, as structure and emphasis rather than decoration." },
  { title: "Luxury retail clarity", text: "Headlines stay legible, product formats stay scannable, and every CTA feels measured." },
  { title: "Reusable modules", text: "Hero, collection cards, editorial split and format tiles can be reused across future product families." },
];

const formatCards = [
  {
    kicker: "Retail",
    title: "Gourmet Shelf",
    text: "Dark glass, soft matte labels and clean front panels designed for premium grocery, delicatessen and concept-store placement.",
    items: ["250ml, 500ml and 750ml glass", "Gift-ready carton language", "Balanced premium price architecture"],
  },
  {
    kicker: "Food Service",
    title: "Modern Hospitality",
    text: "Formats adapted for restaurants, boutique hotels and table service where olive oil becomes part of the dining ritual.",
    items: ["500ml service bottle and 1L refill", "Elegant back-of-house continuity", "Hospitality-ready secondary packaging"],
    variant: "orzeta-format-card-olive",
  },
  {
    kicker: "Tin Packaging",
    title: "Heritage Tin",
    text: "A Mediterranean format with stronger visual memory. Ideal for family-size use, gifting or markets where olive oil tin remains a trusted signifier.",
    items: ["3L and 5L tin potential", "Large-surface storytelling panels", "Premium yet practical presence"],
    id: "tin",
  },
];

export default function PackagedProductsPage() {
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
              <span>single origin</span>
              <span>cold extracted</span>
              <span>retail ready</span>
            </div>

            <div className="orzeta-hero-grid">
              <div className="orzeta-hero-copy reveal">
                <span className="orzeta-kicker">Packaged collection</span>
                <p className="orzeta-mini-label">ORZETA / Nos Produits</p>
                <h1 className="orzeta-title">
                  <span className="orzeta-title-soft">Quiet Mediterranean</span>
                  <span className="orzeta-title-strong">luxury, bottled.</span>
                </h1>
                <p className="orzeta-copy">
                  ORZETA translates OLIVED&apos;s Tunisian olive oil into a retail object: composed, tactile and
                  contemporary. The collection is designed for gourmet shelves, gifting and modern Mediterranean
                  hospitality without losing the depth of origin.
                </p>
                <div className="orzeta-hero-actions">
                  <a href="#retail" className="btn btn-gold">
                    Discover Collection
                  </a>
                  <Link href="/contact" className="btn btn-outline">
                    Request Line Sheet
                  </Link>
                </div>
                <div className="orzeta-hero-meta">
                  {heroMeta.map((m) => (
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
                    <span className="orzeta-stage-tag">Tunisia</span>
                    <span className="orzeta-stage-tag">Extra Virgin</span>
                  </div>
                  <div className="orzeta-stage-card orzeta-stage-card-top">
                    <span className="orzeta-stage-card-label">Blend</span>
                    <p>Chemlali and Chetoui, balanced for a softer premium palate.</p>
                  </div>
                  <Image
                    src={orzetaPackshot}
                    alt="ORZETA packaged olive oil bottle"
                    className="orzeta-packshot"
                    sizes="(max-width: 900px) 70vw, 375px"
                    preload
                  />
                  <div className="orzeta-stage-card orzeta-stage-card-bottom">
                    <span className="orzeta-stage-card-label">Shelf presence</span>
                    <p>Minimal packaging language, tactile neutrals and export-ready finishing.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="orzeta-hero-footer reveal reveal-delay-3">
              {heroFooter.map((f) => (
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
            <span className="eyebrow-dark">Nos Produits</span>
            <h2>Three retail-ready expressions of ORZETA</h2>
            <p className="lead">
              One premium visual language, adapted for gourmet retail, gifting and modern Mediterranean counters.
            </p>
          </div>

          <div className="orzeta-collection-grid">
            <article className="orzeta-product-card orzeta-product-card-featured reveal">
              <div>
                <span className="orzeta-card-kicker">Signature line</span>
                <h3>ORZETA Signature</h3>
                <p>
                  The core expression of the house. A balanced, soft-fruited extra virgin olive oil for elegant daily
                  use and premium grocery shelves.
                </p>
                <Chips items={["250ml", "500ml", "750ml"]} />
              </div>
              <div className="orzeta-product-card-footer">
                <span className="orzeta-product-note">Everyday premium</span>
                <Link href="/contact" className="text-link">
                  Get Specifications <ArrowSmall />
                </Link>
              </div>
              <Image src={orzetaPackshot} alt="ORZETA Signature bottle" className="orzeta-card-packshot" sizes="300px" />
            </article>

            <article className="orzeta-product-card orzeta-product-card-dark reveal reveal-delay-1">
              <div>
                <span className="orzeta-card-kicker">Premium gifting</span>
                <h3>ORZETA Reserve</h3>
                <p>
                  A more ceremonial presentation built for curation, luxury hampers and shelves where understatement
                  matters more than excess.
                </p>
                <Chips items={["500ml", "Gift box", "Limited lots"]} />
              </div>
              <div className="orzeta-product-card-footer">
                <span className="orzeta-product-note">Curated placement</span>
                <Link href="/contact" className="text-link text-link-light">
                  Request Samples <ArrowSmall />
                </Link>
              </div>
            </article>

            {/* NOTE (see AUDIT.md): "Organic" needs certificate details before publication. */}
            <article className="orzeta-product-card reveal reveal-delay-2">
              <div>
                <span className="orzeta-card-kicker">Organic selection</span>
                <h3>ORZETA Organic</h3>
                <p>
                  An organic-ready expression for buyers seeking certification, restrained aesthetics and contemporary
                  Mediterranean positioning.
                </p>
                <Chips items={["Organic", "Retail glass", "Export ready"]} />
              </div>
              <div className="orzeta-product-card-footer">
                <span className="orzeta-product-note">Clean label positioning</span>
                <Link href="/contact" className="text-link">
                  Ask Availability <ArrowSmall />
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
              <span className="eyebrow">Premium Range</span>
              <h2>A reusable design language for modern olive oil storytelling</h2>
              <p className="orzeta-editorial-text">
                The ORZETA page system is built like an editorial brand space: generous margins, quiet typography,
                neutral materials, and one hero product image allowed to breathe. It is designed to scale from hero to
                sub-pages without losing tone.
              </p>
              <div className="orzeta-note-grid">
                {notes.map((n) => (
                  <div className="orzeta-note-card" key={n.title}>
                    <h4>{n.title}</h4>
                    <p>{n.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="orzeta-editorial-visual reveal reveal-delay-2">
              <div className="orzeta-editorial-stage">
                <Image src={orzetaPackshot} alt="ORZETA premium packshot" sizes="(max-width: 900px) 80vw, 375px" />
                <div className="orzeta-editorial-caption">
                  <span>Design Direction</span>
                  <p>Minimal, tactile, Mediterranean, export-ready.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="foodservice">
        <div className="container">
          <div className="section-header centered reveal">
            <span className="eyebrow-dark">Formats And Merchandising</span>
            <h2>From gourmet shelves to hospitality service</h2>
            <p className="lead">
              The same visual discipline can extend across retail, food service and heritage tin presentations without
              fragmenting the brand.
            </p>
          </div>

          <div className="orzeta-format-grid">
            {formatCards.map((c, i) => (
              <article
                key={c.title}
                id={c.id}
                className={["orzeta-format-card", c.variant, "reveal", i > 0 && `reveal-delay-${i}`].filter(Boolean).join(" ")}
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
              <h2>Build the packaged line your market expects</h2>
              <p>
                Share your target channel, preferred formats and branding intent. We will shape the right ORZETA
                presentation with you.
              </p>
            </div>
            <div className="cta-band-actions reveal reveal-delay-2">
              <Link href="/contact" className="btn btn-outline-light">
                Request Line Sheet
              </Link>
              <Link href="/contact" className="btn btn-gold">
                Start A Project
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
