# olived-frontend

The OLIVED website: Next.js 16 (App Router), TypeScript and Tailwind CSS 4. All pages are statically prerendered.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server on http://localhost:3000 |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |

Set `NEXT_PUBLIC_API_URL` in `.env.local` (see [`.env.example`](.env.example)) to the olived-backend URL.
It is fixed at build time, so set it before `npm run build`.

**OLIVED Studio** (private label packaging design) is part of this site, under `/studio`. The header's
*Get Started* button opens `/studio/register`, and a new account lands in `/studio/designs`. Its API is the
`studio` module of olived-backend: browser calls to `/api/studio/*` are forwarded to `NEXT_PUBLIC_API_URL`.

Security headers, including the Content-Security-Policy, are set in [`next.config.ts`](next.config.ts). If you add
a third-party script, image or video, allow its origin there.

## Structure

```
src/
  proxy.ts                sends / and /maison to the visitor's language (/fr, /fr/maison…)
  app/
    [lang]/               root layout + one folder per page, under /en, /fr and /ar
      page.tsx            /en
      maison/             /en/maison
      quality/            /en/quality
      bulk-olive-oil/     /en/bulk-olive-oil
      packaged-products/  /en/packaged-products
      contact/            /en/contact
    studio/               OLIVED Studio: its own root layout and styles (studio.css), English only
      page.tsx            /studio
      login/, register/   /studio/login, /studio/register
      (app)/              pages behind login: /studio/designs, /studio/review
    global-not-found.tsx  404 page, in all three languages
    robots.ts, sitemap.ts
  i18n/                   languages, dictionaries (en / fr / ar) and helpers
  components/
    layout/               Header, Footer, WhatsApp button, PageEffects (scroll reveal + counters)
    forms/                EnquiryForm (home / contact / bulk variants), bulk-form pre-fill
    widgets/              GradeTabs, MillCarousel, HeroVideo
    PageHero.tsx, icons.tsx
  lib/
    site.ts               company details and navigation — edit contact info here
    enquiry.ts            API client + client-side validation
  styles/components.css   site component styles (Tailwind `components` layer)
  assets/images/          optimised source images, imported statically by next/image
```

## Styling

- **Design tokens** (colours, fonts, type scale) are defined once in `src/app/globals.css` and exposed as
  Tailwind utilities: `bg-gold`, `text-mid`, `border-border`, `font-serif`, `text-h2`, `text-micro`, …
- **Component classes** from the original design (`.btn`, `.section`, `.cta-band`, `.mn-hero`, …) live in
  `src/styles/components.css` inside `@layer components`, so any Tailwind utility on the same element wins.
- Use Tailwind utilities for one-off spacing and layout instead of inline styles.
- `container` is redefined to the site's own max-width and fluid padding.

## Images

Put new images in `src/assets/images/` and import them:

```tsx
import photo from "@/assets/images/photo.jpg";
<Image src={photo} alt="…" sizes="(max-width: 768px) 100vw, 50vw" />
```

Next.js serves resized WebP/AVIF automatically. Use `preload` only for the main above-the-fold image.
