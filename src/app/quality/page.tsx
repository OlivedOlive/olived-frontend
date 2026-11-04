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

export const metadata: Metadata = {
  title: "Quality Certifications & Standards",
  description:
    "OLIVED quality certifications: International Olive Council (IOC), ONH, FDA registration, and laboratory partnerships with SGS, Oléa Conseil and TTS Monastir.",
  alternates: { canonical: "/quality" },
};

const millSlides = [
  { src: mill1, alt: "Hand-picking freshly harvested olives from a harvest net" },
  { src: mill2, alt: "Partner mill workers harvesting olives in the orchard" },
  { src: mill3, alt: "Crate of freshly harvested olives ready for pressing" },
  { src: mill4, alt: "Hand-selecting ripe olives on the branch" },
];

export default function QualityPage() {
  return (
    <>
      <PageHero image={qualityHero} eyebrow="Certifications" title="Quality Certifications & Standards" className="min-h-[660px]">
        <div className="mt-2 flex max-w-[640px] items-start gap-6">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-full border border-sand-pale/35 text-gold-light">
            <AwardIcon />
          </div>
          <p className="page-hero-lead max-w-none">
            OLIVED adheres to the highest quality standards. Our laboratory is certified by the International Olive
            Council (IOC), and all exported olive oil is verified and certified by the ONH. Our facilities are also
            registered with the FDA, ensuring the safety and quality of our products.
          </p>
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
                alt="Laboratory sample analysis"
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="h-[480px] w-full object-cover"
              />
            </div>
            <div className="reveal">
              <span className="eyebrow-dark">Laboratory Partners</span>
              <h2>Commitment to Quality: Partnerships with Leading Laboratories</h2>
              <p className="mt-5 leading-[1.8] text-mid">
                At <strong>OLIVED</strong>, quality is non-negotiable. We have official partnerships with three highly
                recognized laboratories to ensure the highest standards for our olive oil. <strong>SGS</strong> conducts
                comprehensive analysis of all products before export, with sampling performed by third parties for
                impartiality. <strong>Oléa Conseil</strong> specializes in tasting and selecting our olive oils,
                confirming their exceptional flavor profiles. Additionally, <strong>TTS Monastir</strong> oversees all
                safety and security controls, ensuring every drop meets stringent quality and safety standards. These
                collaborations reflect our unwavering commitment to delivering premium olive oil you can trust.
              </p>
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
            <span className="eyebrow-dark">Sourcing Network</span>
            <h2>Collaborating with Trusted Oil Mill Partners</h2>
            <p className="lead">
              In addition to our own production, <strong>OLIVED</strong> collaborates with trusted oil mill partners
              who share our commitment to quality and sustainability. These partnerships allow us to expand our
              offerings while maintaining the same rigorous standards of traceability, authenticity, and excellence. By
              working closely with these mills, we ensure that every drop of olive oil bearing the <strong>OLIVED</strong>{" "}
              name reflects our dedication to tradition, innovation, and the unparalleled taste of Tunisia.
            </p>
          </div>
        </div>
        <MillCarousel slides={millSlides} />
      </section>

      <div className="cta-band">
        <div className="container">
          <div className="cta-band-inner">
            <div className="reveal">
              <h2>Request our certification dossier</h2>
              {/* "Full COA" removed: per AUDIT.md it is a contractual commitment not published on olived.tn. */}
              <p>IOC, ONH and FDA documentation and laboratory reports — sent within 24 hours.</p>
            </div>
            <div className="cta-band-actions reveal reveal-delay-2">
              <Link href="/contact" className="btn btn-outline-light">
                Request a Quote
              </Link>
              <Link href="/bulk-olive-oil" className="btn btn-gold">
                Explore Grades
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
