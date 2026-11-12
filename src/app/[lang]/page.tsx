import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import bulkHarvest from "@/assets/images/bulk-olives-harvest.jpg";
import evoo from "@/assets/images/evoo-conventional.jpg";
import flexitank from "@/assets/images/format-flexitank.jpg";
import heritage from "@/assets/images/heritage.jpg";
import laboratory from "@/assets/images/laboratory.jpg";
import mill1 from "@/assets/images/mill-1.jpg";
import privateLabel from "@/assets/images/private-label.png";
import millennialTrees from "@/assets/images/millennial-trees.jpg";
import qualityHero from "@/assets/images/quality-hero.jpg";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { Faq } from "@/components/landing/Faq";
import { LandingEffects } from "@/components/landing/LandingEffects";
import { icons, Lines, SplitButton, Tag } from "@/components/landing/parts";
import { Process } from "@/components/landing/Process";
import { RangeAccordion } from "@/components/landing/RangeAccordion";
import { orzetaBottles, OrzetaBottles } from "@/components/OrzetaBottles";
import { alternates, localizeHref } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
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

// Numbers and links stay here; their labels come from the dictionary in the same order.
const offerLinks = ["/bulk-olive-oil", "/packaged-products", "/contact"];
const offerIcons = [icons.plus, icons.leaf, icons.doc];
const edgeIcons = [icons.leaf, icons.scale, icons.check, icons.globe];
const figures = [{ target: 1500 }, { target: 3000 }, { target: 900 }, { target: 40, suffix: "+" }];
const processThumbs = [mill1, bulkHarvest, evoo, laboratory, flexitank];
const rangeImages = [orzetaBottles.sun, orzetaBottles.grove, orzetaBottles.organic];

const formatNumber = (n: number) => n.toLocaleString("en-US");

/**
 * The home page: a hero, eight numbered sections and the quote form. The scroll behaviour
 * (smooth scrolling, reveals, parallax) is added by LandingEffects; styles are in landing.css.
 */
export default async function HomePage() {
  const { locale, t } = await getDictionary();
  const l = t.home.landing;
  const href = (path: string) => localizeHref(locale, path);

  const offerCard = (index: number) => {
    const card = l.offer.cards[index];
    return (
      <Link href={href(offerLinks[index])} className="ld-tile ld-card" data-rv>
        <i className="ld-icon">{offerIcons[index]}</i>
        <h3>{card.title}</h3>
        <p>{card.text}</p>
      </Link>
    );
  };

  return (
    <div className="ld">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd(t.meta.siteDescription)).replace(/</g, "\\u003c") }}
      />
      <LandingEffects />

      {/* ===== HERO ===== */}
      <section className="ld-hero ld-photo" id="home">
        <Image src="/hero-poster.webp" alt="" fill priority sizes="100vw" data-parallax />
        <div className="ld-hero-top" data-rv-group>
          <Lines as="h1" lines={l.hero.title} />
          <Link href={href("/maison")} className="ld-link" data-rv>
            {l.hero.link} <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="ld-hero-card" data-rv>
          <div className="ld-hero-thumb">
            <Image src={orzetaBottles.grove} alt={l.hero.bottleAlt} sizes="90px" />
          </div>
          <div>
            <h2>{l.hero.card.title}</h2>
            <p>{l.hero.card.text}</p>
            <SplitButton href="#export-enquiry" light>
              {l.hero.card.button}
            </SplitButton>
          </div>
        </div>
        <p className="ld-wordmark" aria-hidden="true">
          {l.wordmark}
        </p>
      </section>

      {/* ===== 01 THE HOUSE ===== */}
      <section className="ld-section ld-house">
        <div className="ld-center" data-rv-group>
          <Tag n={1}>{l.house.tag}</Tag>
        </div>
        <div className="ld-island" data-rv-group>
          <div className="ld-stat ld-stat-left" data-rv>
            <strong>
              <span className="count-up" data-target={1500}>
                {formatNumber(1500)}
              </span>{" "}
              {l.house.left.unit}
            </strong>
            <p>{l.house.left.text}</p>
          </div>
          <div className="ld-island-art" data-rv>
            <OrzetaBottles />
          </div>
          <div className="ld-stat ld-stat-right" data-rv>
            <strong>
              <span className="count-up" data-target={3000}>
                {formatNumber(3000)}
              </span>{" "}
              {l.house.right.unit}
            </strong>
            <p>{l.house.right.text}</p>
          </div>
        </div>
        <p className="ld-bigtext" data-scrolltext>
          {l.house.text.split(" ").map((word, i) => (
            <span key={i}>{word} </span>
          ))}
        </p>
      </section>

      {/* ===== 02 OUR OFFER ===== */}
      <section className="ld-section" id="sourcing">
        <div className="ld-head" data-rv-group>
          <div>
            <Tag n={2}>{l.offer.tag}</Tag>
            <Lines lines={l.offer.title} soft />
          </div>
          <div className="ld-head-side" data-rv>
            <SplitButton href="#export-enquiry">{l.offer.button}</SplitButton>
          </div>
        </div>
        {/* Row 1: gap, bulk card, bulk photo, gap. Row 2: ORZETA card, bottles, private label photo, private label card.
            The two photos load eagerly: they are the largest images on screen when the page is opened or
            reloaded at this section (for example from the header's link to #sourcing). */}
        <div className="ld-bento" data-rv-group>
          <div className="ld-tile-empty" />
          {offerCard(0)}
          <div className="ld-tile ld-photo" data-rv>
            <Image src={flexitank} alt={l.offer.photoAlts[0]} fill loading="eager" sizes="(max-width: 900px) 100vw, 25vw" data-parallax />
          </div>
          <div className="ld-tile-empty" />
          {offerCard(1)}
          <div className="ld-tile ld-bottles" data-rv>
            <OrzetaBottles alts={{ sun: l.offer.photoAlts[1], grove: "", organic: "" }} />
          </div>
          <div className="ld-tile ld-photo" data-rv>
            <Image src={privateLabel} alt={l.offer.photoAlts[2]} fill loading="eager" sizes="(max-width: 900px) 100vw, 25vw" />
          </div>
          {offerCard(2)}
        </div>
      </section>

      {/* ===== 03 THE PROCESS ===== */}
      <Process
        steps={l.process.steps}
        thumbs={processThumbs}
        background={<Image src={qualityHero} alt="" fill sizes="100vw" />}
        tag={
          <Tag n={3} light>
            {l.process.tag}
          </Tag>
        }
      />

      {/* ===== 04 THE ORZETA RANGE ===== */}
      <section className="ld-section">
        <RangeAccordion
          rows={l.range.rows}
          images={rangeImages}
          tabs={l.range.tabs}
          formats={l.range.formats}
          useLabel={l.range.useLabel}
          formatsLabel={l.range.formatsLabel}
          heading={
            <div>
              <Tag n={4}>{l.range.tag}</Tag>
              <Lines lines={l.range.title} soft />
            </div>
          }
          button={<SplitButton href={href("/packaged-products")}>{l.range.button}</SplitButton>}
        />
      </section>

      {/* ===== 05 OUR ADVANTAGE ===== */}
      <section className="ld-edge ld-photo">
        <Image src={millennialTrees} alt="" fill sizes="100vw" data-parallax />
        <div className="ld-edge-top" data-rv-group>
          <Tag n={5} light>
            {l.edge.tag}
          </Tag>
          <Lines lines={l.edge.title} />
        </div>
        <div className="ld-edge-cards" data-rv-group>
          {l.edge.cards.map((card, i) => (
            <div className="ld-glass" key={card.title} data-rv>
              <i className="ld-icon ld-icon-lime">{edgeIcons[i]}</i>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== 06 THE FIGURES ===== */}
      <section className="ld-section">
        <div data-rv-group>
          <Tag n={6}>{l.figures.tag}</Tag>
        </div>
        <div className="ld-figures" data-rv-group>
          {figures.map((f, i) => (
            <div key={l.figures.labels[i]} data-rv>
              <strong className="count-up" data-target={f.target} data-suffix={f.suffix}>
                {formatNumber(f.target)}
                {f.suffix}
              </strong>
              <span>{l.figures.labels[i]}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ===== 07 HELP ===== */}
      <section className="ld-section ld-help">
        <div className="ld-center" data-rv-group>
          <Tag n={7}>{l.help.tag}</Tag>
          <Lines lines={l.help.title} soft />
        </div>
        <Faq items={t.bulk.faq.items} />
      </section>

      {/* ===== 08 GET STARTED + QUOTE FORM ===== */}
      <section className="ld-start ld-photo scroll-mt-[100px]" id="export-enquiry">
        <Image src={heritage} alt="" fill sizes="100vw" data-parallax />
        <div className="ld-start-panel" data-rv-group>
          <Tag n={8} light>
            {l.start.tag}
          </Tag>
          <Lines lines={[l.start.title]} />
          <p className="ld-start-text" data-rv>
            {l.start.text}
          </p>
          <div data-rv>
            <EnquiryForm source="home" t={t.form} />
          </div>
        </div>
      </section>
    </div>
  );
}
