import type { Metadata } from "next";
import Image from "next/image";
import certEuOrganic from "@/assets/images/cert-eu-organic.jpg";
import certUsdaOrganic from "@/assets/images/cert-usda-organic.jpg";
import evooConventional from "@/assets/images/evoo-conventional.jpg";
import evooOrganic from "@/assets/images/evoo-organic.png";
import formatDrums from "@/assets/images/format-drums.png";
import formatFlexitank from "@/assets/images/format-flexitank.jpg";
import formatIbc from "@/assets/images/format-ibc.png";
import { BulkPrefillProvider, PrefillLink } from "@/components/forms/BulkPrefill";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { GradeTabs } from "@/components/widgets/GradeTabs";
import { alternates } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getDictionary();
  return {
    title: { absolute: t.meta.bulk.title },
    description: t.meta.bulk.description,
    alternates: alternates(locale, "/bulk-olive-oil"),
  };
}

// `value` is the English option the bulk form sends to the backend; text comes from the dictionary.
const formats = [
  { value: "Flexitank", image: formatFlexitank },
  { value: "IBC 1000L", image: formatIbc },
  { value: "Food-Grade Drums", image: formatDrums },
];

export default async function BulkOliveOilPage() {
  const { t } = await getDictionary();
  const b = t.bulk;

  // NOTE: the organic claims and EU/USDA logos below need a certificate number,
  // certifying body and validity date before publication. Kept as on the current site pending that proof.
  const gradeTabs = [
    {
      id: "conventional",
      label: b.conventional.tab,
      content: (
        <>
          <div>
            <h3>{b.conventional.title}</h3>
            <p className="mt-3.5 leading-[1.8] text-mid">{b.conventional.text}</p>
            <div className="mt-7">
              <span className="oil-apps-label">{b.conventional.appsLabel}</span>
              <p className="oil-apps-value">{b.conventional.apps}</p>
            </div>
            <div className="mt-7">
              <PrefillLink
                className="btn btn-primary"
                prefill={{ oilCategory: "Extra Virgin Olive Oil", organicPreference: "Conventional" }}
              >
                {b.requestOil}
              </PrefillLink>
            </div>
            <p className="oil-footnote">{b.conventional.footnote}</p>
          </div>
          <div className="oil-panel-media">
            <Image src={evooConventional} alt={b.conventional.imageAlt} sizes="(max-width: 768px) 100vw, 50vw" loading="eager" />
          </div>
        </>
      ),
    },
    {
      id: "organic",
      label: b.organic.tab,
      content: (
        <>
          <div>
            <h3>{b.organic.title}</h3>
            <p className="mt-3.5 leading-[1.8] text-mid">{b.organic.text}</p>
            <div className="mt-7">
              <span className="oil-apps-label">{b.organic.certsLabel}</span>
              <div className="oil-certs">
                <Image className="oil-cert" src={certEuOrganic} alt="EU Organic" title="EU Organic" />
                <Image className="oil-cert oil-cert-round" src={certUsdaOrganic} alt="USDA Organic" title="USDA Organic" />
              </div>
            </div>
            <div className="mt-7">
              <PrefillLink
                className="btn btn-primary"
                prefill={{ oilCategory: "Extra Virgin Olive Oil", organicPreference: "Organic" }}
              >
                {b.requestOil}
              </PrefillLink>
            </div>
            <p className="oil-footnote">{b.organic.footnote}</p>
          </div>
          <div className="oil-panel-media">
            <Image src={evooOrganic} alt={b.organic.imageAlt} sizes="(max-width: 768px) 100vw, 50vw" />
          </div>
        </>
      ),
    },
  ];

  return (
    <BulkPrefillProvider>
      <section className="section pt-[clamp(130px,16vh,190px)]" id="find-oil">
        <div className="container">
          <div className="section-header centered reveal">
            <span className="eyebrow-dark">{b.hero.eyebrow}</span>
            <h1>{b.hero.title}</h1>
            <p className="lead">{b.hero.lead}</p>
          </div>
          <GradeTabs tabs={gradeTabs} label={b.tabsLabel} />
        </div>
      </section>

      <section className="section section-cream" id="formats">
        <div className="container">
          <div className="section-header centered reveal">
            <span className="eyebrow-dark">{b.formats.eyebrow}</span>
            <h2>{b.formats.title}</h2>
          </div>
          <div className="card-grid card-grid-3 mt-12">
            {formats.map((f, i) => {
              const text = b.formats.items[i];
              return (
                <div key={f.value} className={i === 0 ? "format-card reveal" : `format-card reveal reveal-delay-${i}`}>
                  <div className="format-card-media">
                    <Image src={f.image} alt={text.alt} sizes="(max-width: 768px) 100vw, 33vw" />
                  </div>
                  <div className="format-card-body">
                    <h4>{text.name}</h4>
                    <p>{text.text}</p>
                    <PrefillLink className="btn btn-outline" prefill={{ format: f.value }}>
                      {b.formats.ask}
                    </PrefillLink>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="section-header centered reveal">
            <span className="eyebrow-dark">{b.process.eyebrow}</span>
            <h2>{b.process.title}</h2>
          </div>
          <div className="pl-process pl-process-4 reveal">
            {b.process.steps.map((s) => (
              <div className="pl-step" key={s.title}>
                <h4>{s.title}</h4>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-sm section-cream">
        <div className="container">
          <div className="section-header centered reveal">
            <span className="eyebrow-dark">{b.faq.eyebrow}</span>
            <h2>{b.faq.title}</h2>
          </div>
          <div className="faq-list reveal">
            {b.faq.items.map((f, i) => (
              <details className="faq-item" key={f.q} open={i === 0}>
                <summary className="faq-question">{f.q}</summary>
                <p className="faq-answer">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <div className="cta-band scroll-mt-[100px]" id="bulk-request-form">
        <div className="container">
          <div className="cta-form-layout">
            <div className="reveal">
              <h2>{b.cta.title}</h2>
              <p>{b.cta.text}</p>
            </div>
            <div className="reveal reveal-delay-2">
              <EnquiryForm source="bulk" t={t.form} />
            </div>
          </div>
        </div>
      </div>
    </BulkPrefillProvider>
  );
}
