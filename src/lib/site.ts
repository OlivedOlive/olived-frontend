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

export const addressLine = `${site.address.street}, ${site.address.city}, ${site.address.country}`;

export const navItems = [
  { href: "/", label: "Home" },
  { href: "/maison", label: "Maison" },
  { href: "/quality", label: "Quality" },
  { href: "/bulk-olive-oil", label: "Bulk Oil" },
  { href: "/packaged-products", label: "Packaged" },
  { href: "/contact", label: "Contact" },
] as const;

/** Pages without a dark hero image use the light header variant. */
export const lightHeaderRoutes = new Set(["/bulk-olive-oil", "/packaged-products"]);

/** Base URL of the olived-backend API. */
export const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");
