import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import fdaLogo from "@/assets/images/certs/fda-logo.svg";
import iocLogo from "@/assets/images/certs/ioc-logo.png";
import onhLogo from "@/assets/images/certs/onh-logo.png";
import sgsLogo from "@/assets/images/certs/sgs-logo.svg";
import ttsLogo from "@/assets/images/certs/tts-logo.png";
import laboratory from "@/assets/images/laboratory.jpg";
import mill1 from "@/assets/images/mill-1.jpg";
import mill2 from "@/assets/images/mill-2.jpg";
import mill3 from "@/assets/images/mill-3.jpg";
import mill4 from "@/assets/images/mill-4.jpg";
import qualityHero from "@/assets/images/quality-hero.jpg";
import { AwardIcon } from "@/components/icons";
import { PageHero } from "@/components/PageHero";
import { MillCarousel } from "@/components/widgets/MillCarousel";
import { alternates, localizeHref } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { rich } from "@/i18n/rich";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getDictionary();
  return {
    title: t.meta.quality.title,
    description: t.meta.quality.description,
    alternates: alternates(locale, "/quality"),
  };
}

const millImages = [mill1, mill2, mill3, mill4];

export default async function QualityPage() {
  const { locale, t } = await getDictionary();
  const q = t.quality;
  const href = (path: string) => localizeHref(locale, path);
  const millSlides = millImages.map((src, i) => ({ src, alt: q.mills.slides[i] }));

  return (
    <>
      <PageHero image={qualityHero} eyebrow={q.hero.eyebrow} title={q.hero.title} className="min-h-[660px]">
        <div className="mt-2 flex max-w-[640px] items-start gap-6">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-full border border-sand-pale/35 text-gold-light">
            <AwardIcon />
          </div>
          <p className="page-hero-lead max-w-none">{q.hero.lead}</p>
        </div>
        <div className="cert-strip justify-start gap-5 px-0 pt-9 pb-0">
          <div className="cert-badge-plate">
            <Image src={iocLogo} alt="International Olive Council" />
          </div>
          <div className="cert-badge-plate">
            <Image src={onhLogo} alt="Office National de l'Huile (ONH)" />
          </div>
          <div className="cert-badge-plate">
            <Image src={fdaLogo} alt="U.S. Food & Drug Administration (FDA)" />
          </div>
        </div>
      </PageHero>

      <section className="section section-cream" id="laboratory">
        <div className="container">
          <div className="split-layout">
            <div className="split-image">
              <Image
                src={laboratory}
                alt={q.lab.imageAlt}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="h-[clamp(380px,32vw,640px)] w-full object-cover"
              />
            </div>
            <div className="reveal">
              <span className="eyebrow-dark">{q.lab.eyebrow}</span>
              <h2>{q.lab.title}</h2>
              <p className="mt-5 leading-[1.8] text-mid">{rich(q.lab.text)}</p>
              <div className="cert-strip justify-start gap-5 px-0 pt-8 pb-0">
                <div className="cert-badge-plate">
                  <Image src={sgsLogo} alt="SGS" />
                </div>
                <div className="cert-badge-plate is-wordmark">Oléa Conseil</div>
                <div className="cert-badge-plate">
                  <Image src={ttsLogo} alt="TTS — Tunisian Testing Service, Monastir" />
                </div>
              </div>
              {/* TODO: Oléa Conseil logo not sourced yet — shown as a wordmark until the file is provided. */}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header centered reveal">
            <span className="eyebrow-dark">{q.mills.eyebrow}</span>
            <h2>{q.mills.title}</h2>
            <p className="lead">{rich(q.mills.lead)}</p>
          </div>
        </div>
        <MillCarousel slides={millSlides} t={t.carousel} />
      </section>

      <div className="cta-band">
        <div className="container">
          <div className="cta-band-inner">
            <div className="reveal">
              <h2>{q.cta.title}</h2>
              {/* "Full COA" removed: per AUDIT.md it is a contractual commitment not published on olived.tn. */}
              <p>{q.cta.text}</p>
            </div>
            <div className="cta-band-actions reveal reveal-delay-2">
              <Link href={href("/contact")} className="btn btn-outline-light">
                {t.common.requestQuote}
              </Link>
              <Link href={href("/bulk-olive-oil")} className="btn btn-gold">
                {q.cta.secondary}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
