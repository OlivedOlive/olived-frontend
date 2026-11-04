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

export const metadata: Metadata = {
  title: { absolute: "Bulk Olive Oil for Professional Buyers | OLIVED Tunisia" },
  description:
    "Bulk Extra Virgin olive oil from Tunisia for professional buyers — choose the specification and shipment format that fit your business, in Flexitank, IBC or drums.",
  alternates: { canonical: "/bulk-olive-oil" },
};

const formats = [
  { name: "Flexitank", text: "For full-container bulk shipments.", image: formatFlexitank, alt: "Flexitank — standard shipping containers" },
  { name: "IBC 1000L", text: "Palletised, food-grade liquid containers.", image: formatIbc, alt: "IBC 1000L — palletised food-grade containers" },
  { name: "Food-Grade Drums", text: "For flexible, smaller-volume bulk orders.", image: formatDrums, alt: "Food-grade drums" },
];

const steps = [
  { title: "Share Your Requirements", text: "Tell us the oil category, target specification, volume and destination." },
  { title: "Receive Our Proposal", text: "We confirm availability, suitable format and commercial terms." },
  { title: "Validate the Oil", text: "Review the specification, sample and applicable batch documentation." },
  { title: "Confirm Shipment", text: "The order is prepared according to the agreed terms and destination." },
];

const faqs = [
  {
    q: "Which olive oil grade is available?",
    a: "OLIVED supplies Extra Virgin olive oil, in conventional and certified organic. Availability can vary by season — our team will confirm current options for your request.",
  },
  {
    q: "Can OLIVED work with a target specification?",
    a: "Yes. Share your target specification and application, and we will confirm whether it can be met or propose the closest available match.",
  },
  {
    q: "Which bulk shipment formats are offered?",
    a: "Flexitank, IBC 1000L and food-grade drums, depending on the oil category and destination.",
  },
  {
    q: "How can I receive a sample and quotation?",
    a: "Submit the bulk enquiry form below with your requirements. Our export team will get back to you with the sample process and a tailored quotation.",
  },
];

// NOTE (see AUDIT.md): the organic claims and EU/USDA logos below need a certificate number,
// certifying body and validity date before publication. Kept as on the current site pending that proof.
const gradeTabs = [
  {
    id: "conventional",
    label: "Conventional",
    content: (
      <>
        <div>
          <h3>Extra Virgin Olive Oil</h3>
          <p className="mt-3.5 leading-[1.8] text-mid">
            Extra Virgin Olive Oil, compliant with IOC standards: naturally extracted, fruity and free from sensory
            defects, with acidity no higher than 0.8%.
          </p>
          <div className="mt-7">
            <span className="oil-apps-label">Main Applications</span>
            <p className="oil-apps-value">Premium bottling · Private label · Bulk</p>
          </div>
          <div className="mt-7">
            <PrefillLink className="btn btn-primary" prefill={{ oilCategory: "Extra Virgin Olive Oil", organicPreference: "Conventional" }}>
              Request This Oil
            </PrefillLink>
          </div>
          <p className="oil-footnote">Specification sheet, sample and batch documentation available on request.</p>
        </div>
        <div className="oil-panel-media">
          <Image
            src={evooConventional}
            alt="Conventional Extra Virgin Olive Oil"
            sizes="(max-width: 768px) 100vw, 50vw"
            loading="eager"
          />
        </div>
      </>
    ),
  },
  {
    id: "organic",
    label: "Organic",
    content: (
      <>
        <div>
          <h3>Organic Extra Virgin Olive Oil</h3>
          <p className="mt-3.5 leading-[1.8] text-mid">
            Organic Extra Virgin Olive Oil certified to EU Organic and USDA NOP standards, compliant with IOC criteria
            for acidity, purity and sensory quality.
          </p>
          <div className="mt-7">
            <span className="oil-apps-label">Certifications</span>
            <div className="oil-certs">
              <Image className="oil-cert" src={certEuOrganic} alt="EU Organic" title="EU Organic" />
              <Image className="oil-cert oil-cert-round" src={certUsdaOrganic} alt="USDA Organic" title="USDA Organic" />
            </div>
          </div>
          <div className="mt-7">
            <PrefillLink className="btn btn-primary" prefill={{ oilCategory: "Extra Virgin Olive Oil", organicPreference: "Organic" }}>
              Request This Oil
            </PrefillLink>
          </div>
          <p className="oil-footnote">
            Organic certification, specification sheet, sample and batch documentation available on request.
          </p>
        </div>
        <div className="oil-panel-media">
          <Image src={evooOrganic} alt="Organic Extra Virgin Olive Oil" sizes="(max-width: 768px) 100vw, 50vw" />
        </div>
      </>
    ),
  },
];

export default function BulkOliveOilPage() {
  return (
    <BulkPrefillProvider>
      <section className="section pt-[clamp(130px,16vh,190px)]" id="find-oil">
        <div className="container">
          <div className="section-header centered reveal">
            <span className="eyebrow-dark">Select Your Oil</span>
            <h1>Find the Right Olive Oil</h1>
            <p className="lead">
              Tunisian Extra Virgin olive oil for professional buyers, available in conventional and organic.
            </p>
          </div>
          <GradeTabs tabs={gradeTabs} />
        </div>
      </section>

      <section className="section section-cream" id="formats">
        <div className="container">
          <div className="section-header centered reveal">
            <span className="eyebrow-dark">Shipment Formats</span>
            <h2>Choose Your Shipment Format</h2>
          </div>
          <div className="card-grid card-grid-3 mt-12">
            {formats.map((f, i) => (
              <div key={f.name} className={i === 0 ? "format-card reveal" : `format-card reveal reveal-delay-${i}`}>
                <div className="format-card-media">
                  <Image src={f.image} alt={f.alt} sizes="(max-width: 768px) 100vw, 33vw" />
                </div>
                <div className="format-card-body">
                  <h4>{f.name}</h4>
                  <p>{f.text}</p>
                  <PrefillLink className="btn btn-outline" prefill={{ format: f.name }}>
                    Ask About This Format
                  </PrefillLink>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="section-header centered reveal">
            <span className="eyebrow-dark">From Enquiry to Shipment</span>
            <h2>A Clear Purchasing Process</h2>
          </div>
          <div className="pl-process pl-process-4 reveal">
            {steps.map((s) => (
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
            <span className="eyebrow-dark">Before You Enquire</span>
            <h2>Buyer FAQ</h2>
          </div>
          <div className="faq-list reveal">
            {faqs.map((f, i) => (
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
              <h2>Request Your Bulk Offer</h2>
              <p>Provide the essential details and our export team will prepare a tailored response.</p>
            </div>
            <div className="reveal reveal-delay-2">
              <EnquiryForm source="bulk" />
            </div>
          </div>
        </div>
      </div>
    </BulkPrefillProvider>
  );
}
