import type { Metadata } from "next";
import Image from "next/image";
import grovesHarvest from "@/assets/images/groves-harvest.jpg";
import millennialTrees from "@/assets/images/millennial-trees.jpg";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { ContainerIcon, PhoneIcon, ShieldCheckIcon } from "@/components/icons";
import { PageHero } from "@/components/PageHero";
import { alternates } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getDictionary();
  return {
    title: { absolute: t.meta.contact.title },
    description: t.meta.contact.description,
    alternates: alternates(locale, "/contact"),
  };
}

const benefitIcons = [ShieldCheckIcon, ContainerIcon, PhoneIcon];

export default async function ContactPage() {
  const { t } = await getDictionary();
  const c = t.contact;

  return (
    <>
      <PageHero image={grovesHarvest} eyebrow={c.hero.eyebrow} title={c.hero.title} lead={c.hero.lead} />

      <section className="section">
        <div className="container">
          <div className="contact-layout">
            <div className="contact-info reveal">
              <InfoItem label={c.info.email}>
                <a href={`mailto:${site.email}`} className="border-b border-border pb-px" dir="ltr">
                  {site.email}
                </a>
              </InfoItem>
              <InfoItem label={c.info.phone}>
                <a href={site.phoneHref} dir="ltr">
                  {site.phoneDisplay}
                </a>
              </InfoItem>
              <InfoItem label={c.info.location}>{t.common.address}</InfoItem>
              <InfoItem label={c.info.responseTime}>{c.info.responseValue}</InfoItem>
              <InfoItem label={c.info.markets}>{c.info.marketsValue}</InfoItem>
              {/* Social links omitted until real LinkedIn / Instagram / Facebook URLs exist. */}
            </div>

            <div className="reveal reveal-delay-2">
              <EnquiryForm source="contact" t={t.form} />
            </div>
          </div>
        </div>
      </section>

      <section className="section section-cream scroll-mt-[100px]" id="become-distributor">
        <div className="container">
          <div className="split-layout">
            <div className="reveal">
              <span className="eyebrow">{c.distributor.eyebrow}</span>
              <h2>{c.distributor.title}</h2>
              <p className="mt-5 text-body-lg leading-[1.8] text-mid">{c.distributor.text}</p>
              <div className="feature-list mt-9">
                {c.distributor.benefits.map(({ title, text }, i) => {
                  const Icon = benefitIcons[i];
                  return (
                    <div className="feature-item" key={title}>
                      <div className="feature-icon">
                        <Icon />
                      </div>
                      <div className="feature-text">
                        <h4>{title}</h4>
                        <p>{text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="split-image reveal reveal-delay-2 relative min-h-[480px]">
              <Image
                src={millennialTrees}
                alt={c.distributor.imageAlt}
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
