/** Single source of truth for company details used across pages, footer and JSON-LD. */
export const site = {
  name: "OLIVED",
  url: "https://olived.tn",
  email: "Contact@olived.tn",
  phoneDisplay: "+216 92 300 800",
  phoneHref: "tel:+21692300800",
  whatsappHref: "https://wa.me/21692300800",
  address: {
    street: "Rue Saltianya",
    city: "Sfax",
    country: "Tunisia",
    countryCode: "TN",
  },
  tagline: "Premium Tunisian olive oil for the world's most demanding markets. Bulk and packaged solutions.",
} as const;

/** Next.js replaces (not merges) openGraph per page, so pages that set their own must spread this. */
export const openGraphDefaults = (imageAlt: string) => ({
  type: "website" as const,
  siteName: site.name,
  images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: imageAlt }],
});

export const addressLine = `${site.address.street}, ${site.address.city}, ${site.address.country}`;

/** Labels come from the dictionary (common.nav[key]); hrefs are prefixed with the language. */
export const navItems = [
  { href: "/", key: "home" },
  { href: "/maison", key: "maison" },
  { href: "/quality", key: "quality" },
  { href: "/bulk-olive-oil", key: "bulk" },
  { href: "/packaged-products", key: "packaged" },
  { href: "/contact", key: "contact" },
] as const;

/** Pages without a dark hero image use the light header variant. */
export const lightHeaderRoutes = new Set(["/bulk-olive-oil", "/packaged-products"]);

/** Base URL of the olived-backend API. */
export const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");
