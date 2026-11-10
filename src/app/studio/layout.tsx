import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import { Suspense } from "react";
import "./studio.css";

// The studio has its own root layout (the website's is app/[lang]/layout.tsx), so the two
// never share styles. Moving between them is a full page load.

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

export const metadata: Metadata = {
  title: { default: "OLIVED Studio", template: "%s | OLIVED Studio" },
  description: "Design private label olive oil packaging for your market.",
  robots: { index: false },
};

// Every studio page reads the login cookie, so none of them can be prerendered.
export const instant = false;

export default function StudioRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${montserrat.variable}`}>
      <body className="min-h-screen">
        {/* With Cache Components, reading cookies() must happen inside a Suspense boundary. */}
        <Suspense>{children}</Suspense>
      </body>
    </html>
  );
}
