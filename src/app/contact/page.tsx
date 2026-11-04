import type { Metadata } from "next";
import Image from "next/image";
import grovesHarvest from "@/assets/images/groves-harvest.jpg";
import millennialTrees from "@/assets/images/millennial-trees.jpg";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { ContainerIcon, PhoneIcon, ShieldCheckIcon } from "@/components/icons";
import { PageHero } from "@/components/PageHero";
import { addressLine, site } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Contact & Quote Request | OLIVED — Premium Tunisian Olive Oil" },
  description:
    "Contact OLIVED to request a bulk quote or enquire about the ORZETA packaged collection. We respond within 24 hours.",
  alternates: { canonical: "/contact" },
};

const distributorBenefits = [
  {
    icon: ShieldCheckIcon,
    title: "Exclusive Territory Options",
    text: "Market exclusivity agreements available for qualified partners",
  },
  { icon: ContainerIcon, title: "Marketing Support", text: "Sales materials, samples and dedicated account management" },
  { icon: PhoneIcon, title: "Reliable Supply Chain", text: "Consistent volume, documentation and delivery across seasons" },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        image={grovesHarvest}
        eyebrow="Get In Touch"
        title="Contact OLIVED"
        lead="Request a bulk quote or enquire about the ORZETA collection. We respond within 24 hours."
      />

      <section className="section">
        <div className="container">
          <div className="contact-layout">
            <div className="contact-info reveal">
              <InfoItem label="Email">
                <a href={`mailto:${site.email}`} className="border-b border-border pb-px">
                  {site.email}
                </a>
              </InfoItem>
              <InfoItem label="Phone">
                <a href={site.phoneHref}>{site.phoneDisplay}</a>
              </InfoItem>
              <InfoItem label="Location">{addressLine}</InfoItem>
              <InfoItem label="Response Time">Within 24 hours</InfoItem>
              <InfoItem label="Export Markets">EU · UK · US · GCC · APAC · Global</InfoItem>
              {/* Social links omitted until real LinkedIn / Instagram / Facebook URLs exist. */}
            </div>

            <div className="reveal reveal-delay-2">
              <EnquiryForm source="contact" />
            </div>
          </div>
        </div>
      </section>

      <section className="section section-cream scroll-mt-[100px]" id="become-distributor">
        <div className="container">
          <div className="split-layout">
            <div className="reveal">
              <span className="eyebrow">Distribution Network</span>
              <h2>Become an OLIVED distributor</h2>
              <p className="mt-5 text-body-lg leading-[1.8] text-mid">
                We are actively building exclusive distribution agreements in key markets. If you are an established
                importer or distributor looking for a reliable, premium Tunisian olive oil source, we want to hear from
                you.
              </p>
              <div className="feature-list mt-9">
                {distributorBenefits.map(({ icon: Icon, title, text }) => (
                  <div className="feature-item" key={title}>
                    <div className="feature-icon">
                      <Icon />
                    </div>
                    <div className="feature-text">
                      <h4>{title}</h4>
                      <p>{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="split-image reveal reveal-delay-2 relative min-h-[480px]">
              <Image
                src={millennialTrees}
                alt="OLIVED groves — distribution partnership"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function InfoItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="contact-info-item">
      <div className="contact-info-label">{label}</div>
      <div className="contact-info-value">{children}</div>
    </div>
  );
}
