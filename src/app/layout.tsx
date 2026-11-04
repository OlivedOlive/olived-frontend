import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { PageEffects } from "@/components/layout/PageEffects";
import { RouteShell } from "@/components/layout/RouteShell";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { site } from "@/lib/site";
import "./globals.css";

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

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Tunisian Extra Virgin Olive Oil Supplier | Bulk & Packaged — OLIVED",
    template: "%s | OLIVED Tunisia",
  },
  description:
    "Family-owned Tunisian olive oil producer since 1916, exporting since 2006. Bulk and packaged EVOO — IOC-certified lab, ONH-verified exports.",
  icons: {
    // app/favicon.ico is picked up automatically; the SVG is offered alongside it.
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    siteName: "OLIVED",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "OLIVED olive groves in Sfax, Tunisia" }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#1C1A16",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${cormorant.variable} ${montserrat.variable}`} data-scroll-behavior="smooth">
      <body>
        {/* Without JavaScript, scroll-reveal content must still be visible. */}
        <noscript>
          <style>{`.reveal,.fade-in{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <RouteShell>
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </RouteShell>
        <WhatsAppFloat />
        <PageEffects />
      </body>
    </html>
  );
}
