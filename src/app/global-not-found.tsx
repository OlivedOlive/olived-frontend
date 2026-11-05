import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import grovesHarvest from "@/assets/images/groves-harvest.jpg";
import { PageHero } from "@/components/PageHero";
import { localeDir, localizeHref, locales } from "@/i18n/config";
import ar from "@/i18n/dictionaries/ar";
import en from "@/i18n/dictionaries/en";
import fr from "@/i18n/dictionaries/fr";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-cormorant",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = { title: "404 | OLIVED" };

const dictionaries = { en, fr, ar };

// The root layout sits under [lang], so unmatched URLs land here, outside it, and the
// language is unknown: the page speaks all three and links to each home page.
export default function GlobalNotFound() {
  return (
    <html lang="en" className={`${cormorant.variable} ${montserrat.variable}`}>
      <body>
        <PageHero
          image={grovesHarvest}
          eyebrow="OLIVED"
          title="404"
          // Taller content than a page banner: grow with it, and dim the photo so the text stays readable.
          className="h-auto min-h-screen [&_.page-hero-bg]:opacity-30"
        >
          <div className="mt-6 grid gap-6">
            {locales.map((locale) => {
              const t = dictionaries[locale].notFound;
              return (
                <div key={locale} lang={locale} dir={localeDir[locale]}>
                  <p className="page-hero-lead">
                    {t.title}. {t.text}
                  </p>
                  <a href={localizeHref(locale, "/")} className="btn btn-outline-light mt-3">
                    {t.home}
                  </a>
                </div>
              );
            })}
          </div>
        </PageHero>
      </body>
    </html>
  );
}
