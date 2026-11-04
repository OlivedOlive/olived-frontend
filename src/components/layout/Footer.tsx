import Image from "next/image";
import Link from "next/link";
import logoWhite from "@/assets/images/logo-olived-white.png";
import { MailIcon, PhoneIcon, PinIcon } from "@/components/icons";
import { localizeHref } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { site } from "@/lib/site";
import { CopyrightYear } from "./CopyrightYear";

// Social links and the Privacy / Terms pages are intentionally absent until they exist
// (the static site linked them to "#"). Add them here once real URLs are available.
export async function Footer() {
  const { locale, t } = await getDictionary();
  const href = (path: string) => localizeHref(locale, path);

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="logo">
              <Image src={logoWhite} alt="OLIVED" className="h-11 w-auto" />
            </div>
            <p className="footer-brand-desc">{t.footer.tagline}</p>
          </div>

          <div>
            <h4 className="footer-col-title">{t.footer.products}</h4>
            <div className="footer-links">
              <Link href={href("/bulk-olive-oil")}>{t.footer.bulkOliveOil}</Link>
              <Link href={href("/packaged-products")}>{t.footer.packagedProducts}</Link>
            </div>
          </div>

          <div>
            <h4 className="footer-col-title">{t.footer.company}</h4>
            <div className="footer-links">
              <Link href={href("/maison")}>{t.footer.ourMaison}</Link>
              <Link href={href("/quality")}>{t.footer.quality}</Link>
              <Link href={href("/contact")}>{t.footer.contact}</Link>
            </div>
          </div>

          <div>
            <h4 className="footer-col-title">{t.footer.contact}</h4>
            <div className="footer-contact-line">
              <PinIcon />
              <span>{t.common.address}</span>
            </div>
            <div className="footer-contact-line">
              <MailIcon />
              <a href={`mailto:${site.email}`} dir="ltr">
                {site.email}
              </a>
            </div>
            <div className="footer-contact-line">
              <PhoneIcon />
              <a href={site.phoneHref} dir="ltr">
                {site.phoneDisplay}
              </a>
            </div>
            <div className="mt-5">
              <Link href={href("/contact")} className="btn btn-gold px-6 py-3 text-[11px]">
                {t.common.requestQuote}
              </Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            © <CopyrightYear /> {t.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
