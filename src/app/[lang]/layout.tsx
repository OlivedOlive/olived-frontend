import type { Metadata, Viewport } from "next";
import { Amiri, Cormorant_Garamond, IBM_Plex_Sans_Arabic, Montserrat } from "next/font/google";
import { InlineScript } from "@/components/InlineScript";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { PageEffects } from "@/components/layout/PageEffects";
import { RouteShell } from "@/components/layout/RouteShell";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { localeDir, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { site } from "@/lib/site";
import "../globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-montserrat",
  display: "swap",
});

// Arabic faces: a classic Naskh serif for headings, a clean sans for text.
// Not preloaded, so English and French pages don't download them.
const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-amiri",
  display: "swap",
  preload: false,
});

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500"],
  variable: "--font-plex-arabic",
  display: "swap",
  preload: false,
});

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return {
    metadataBase: new URL(site.url),
    title: { default: t.meta.siteTitle, template: t.meta.titleTemplate },
    description: t.meta.siteDescription,
    icons: {
      // app/favicon.ico is picked up automatically; the SVG is offered alongside it.
      icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
      apple: "/apple-touch-icon.png",
    },
    openGraph: {
      type: "website",
      siteName: "OLIVED",
      images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: t.meta.ogImageAlt }],
    },
    twitter: { card: "summary_large_image" },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f2" },
    { media: "(prefers-color-scheme: dark)", color: "#12110e" },
  ],
};

/**
 * Sets the theme before first paint (no flash): the saved choice, otherwise the device
 * setting. CSS keys every dark rule on <html data-theme="dark">.
 */
const themeScript = `(function(){var d=document.documentElement,t;try{t=localStorage.getItem("theme")}catch(e){}if(t!=="dark"&&t!=="light")t=window.matchMedia&&matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";d.setAttribute("data-theme",t)})()`;

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const { locale, t } = await getDictionary();
  const fonts = [cormorant.variable, montserrat.variable, amiri.variable, plexArabic.variable].join(" ");

  return (
    <html lang={locale} dir={localeDir[locale]} className={fonts} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <InlineScript html={themeScript} />
      </head>
      <body suppressHydrationWarning>
        {/* Without JavaScript, scroll-reveal content must still be visible. */}
        <noscript>
          <style>{`.reveal,.fade-in{opacity:1!important;transform:none!important;filter:none!important}`}</style>
        </noscript>
        <RouteShell>
          <Header locale={locale} t={t.common} />
          <main id="main">{children}</main>
          <Footer />
        </RouteShell>
        <WhatsAppFloat label={t.common.whatsapp} />
        <PageEffects />
      </body>
    </html>
  );
}
