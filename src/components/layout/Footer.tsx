import Image from "next/image";
import Link from "next/link";
import logoWhite from "@/assets/images/logo-olived-white.png";
import { MailIcon, PhoneIcon, PinIcon } from "@/components/icons";
import { addressLine, site } from "@/lib/site";
import { CopyrightYear } from "./CopyrightYear";

// Social links and the Privacy / Terms pages are intentionally absent until they exist
// (the static site linked them to "#"). Add them here once real URLs are available.
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="logo">
              <Image src={logoWhite} alt="OLIVED" className="h-11 w-auto" />
            </div>
            <p className="footer-brand-desc">{site.tagline}</p>
          </div>

          <div>
            <h4 className="footer-col-title">Products</h4>
            <div className="footer-links">
              <Link href="/bulk-olive-oil">Bulk Olive Oil</Link>
              <Link href="/packaged-products">Packaged Products</Link>
            </div>
          </div>

          <div>
            <h4 className="footer-col-title">Company</h4>
            <div className="footer-links">
              <Link href="/maison">Our Maison</Link>
              <Link href="/quality">Quality</Link>
              <Link href="/contact">Contact</Link>
            </div>
          </div>

          <div>
            <h4 className="footer-col-title">Contact</h4>
            <div className="footer-contact-line">
              <PinIcon />
              <span>{addressLine}</span>
            </div>
            <div className="footer-contact-line">
              <MailIcon />
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </div>
            <div className="footer-contact-line">
              <PhoneIcon />
              <a href={site.phoneHref}>{site.phoneDisplay}</a>
            </div>
            <div className="mt-5">
              <Link href="/contact" className="btn btn-gold px-6 py-3 text-[11px]">
                Request a Quote
              </Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            © <CopyrightYear /> OLIVED. All rights reserved. Premium Tunisian Olive Oil.
          </p>
        </div>
      </div>
    </footer>
  );
}
