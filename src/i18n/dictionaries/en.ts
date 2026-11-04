/**
 * English — the source dictionary. fr.ts and ar.ts must have exactly the same shape
 * (TypeScript enforces it). Light markup: **bold**, *italic*, newline = line break.
 * Option `value`s sent to the backend stay in English so the sales team reads one language.
 */
const en = {
  meta: {
    siteTitle: "Tunisian Extra Virgin Olive Oil Supplier | Bulk & Packaged — OLIVED",
    titleTemplate: "%s | OLIVED Tunisia",
    siteDescription:
      "Family-owned Tunisian olive oil producer since 1916, exporting since 2006. Bulk and packaged EVOO — IOC-certified lab, ONH-verified exports.",
    ogImageAlt: "OLIVED olive groves in Sfax, Tunisia",
    home: {
      ogTitle: "Tunisian Extra Virgin Olive Oil Supplier | OLIVED",
      ogDescription: "Family-owned Tunisian olive oil producer since 1916, exporting since 2006. Bulk and packaged EVOO.",
    },
    maison: {
      title: "Notre Maison — Heritage & Vision | OLIVED Tunisian Olive Oil",
      description:
        "Discover the OLIVED Maison — a Tunisian house built on thousand-year-old heritage, single-source philosophy and international excellence.",
    },
    quality: {
      title: "Quality Certifications & Standards",
      description:
        "OLIVED quality certifications: International Olive Council (IOC), ONH, FDA registration, and laboratory partnerships with SGS, Oléa Conseil and TTS Monastir.",
    },
    bulk: {
      title: "Bulk Olive Oil for Professional Buyers | OLIVED Tunisia",
      description:
        "Bulk Extra Virgin olive oil from Tunisia for professional buyers — choose the specification and shipment format that fit your business, in Flexitank, IBC or drums.",
    },
    packaged: {
      title: "ORZETA Packaged Olive Oil - Premium Retail Collection | OLIVED Tunisia",
      description:
        "Discover ORZETA by OLIVED - a premium Tunisian olive oil collection for gourmet retail, gifting and refined hospitality. Elegant packaging, Mediterranean character, export-ready execution.",
    },
    contact: {
      title: "Contact & Quote Request | OLIVED — Premium Tunisian Olive Oil",
      description:
        "Contact OLIVED to request a bulk quote or enquire about the ORZETA packaged collection. We respond within 24 hours.",
    },
  },

  common: {
    nav: {
      home: "Home",
      maison: "Maison",
      quality: "Quality",
      bulk: "Bulk Oil",
      packaged: "Packaged",
      contact: "Contact",
    },
    mainNavigation: "Main navigation",
    homeLink: "OLIVED — home",
    requestQuote: "Request a Quote",
    language: "Language",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    themeToDark: "Switch to dark mode",
    themeToLight: "Switch to light mode",
    whatsapp: "Chat with OLIVED on WhatsApp",
    address: "Rue Saltianya, Sfax, Tunisia",
    becomeDistributor: "Become a Distributor",
  },

  footer: {
    tagline: "Premium Tunisian olive oil for the world's most demanding markets. Bulk and packaged solutions.",
    products: "Products",
    bulkOliveOil: "Bulk Olive Oil",
    packagedProducts: "Packaged Products",
    company: "Company",
    ourMaison: "Our Maison",
    quality: "Quality",
    contact: "Contact",
    rights: "OLIVED. All rights reserved. Premium Tunisian Olive Oil.",
  },

  home: {
    hero: {
      eyebrow: "Tunisian Producer · Full Traceability · Export-Ready",
      title: "Tunisian Olive Oil.\nFrom Our Groves\n*to the World.*",
      subtitle:
        "Bulk and packaged olive oil, supported by controlled production, verified quality and export-ready documentation.",
      primary: "Get a Tailored Export Offer",
      secondary: "Explore Our Capabilities",
      proof: "Response within 24 business hours · Confidential enquiry · Export documentation provided",
      facts: [
        { label: "Origin", value: "Sfax, Tunisia" },
        { label: "Family heritage", value: "Since 1916" },
        { label: "Exporting", value: "Since 2006" },
        { label: "Extraction", value: "180 MT / day" },
      ],
    },
    marqueeLabel: "OLIVED at a glance",
    provenance: [
      "Sfax, Tunisia",
      "Chemlali & Chetoui",
      "Family Heritage Since 1916",
      "IOC-Certified Laboratory",
      "FDA-Registered Facility",
      "SGS Analysis Before Shipment",
      "Flexitank · IBC · Drums",
      "Exporting Since 2006",
    ],
    sourcing: {
      eyebrow: "Start Your Enquiry",
      title: "What are you sourcing?",
      bulk: {
        eyebrow: "Bulk Export",
        title: "Bulk Olive Oil",
        text: "EVOO, virgin, refined and pomace olive oil in export-ready bulk formats.",
        link: "Explore Bulk",
      },
      packaged: {
        eyebrow: "Retail Ready",
        title: "Packaged Collection",
        text: "ORZETA — a premium packaged collection with Mediterranean character, ready for retail shelves.",
        link: "Discover ORZETA",
      },
    },
    trust: {
      title: "Quality Verified for International Trade",
      text: "FDA-registered facility · IOC-certified laboratory · ONH export verification · SGS analysis before shipment",
      link: "View Quality Credentials",
    },
    about: {
      eyebrow: "Family Heritage Since 1916",
      title: "A Tunisian Olive Oil Heritage, Built for International Markets",
      p1: "Rooted in Sfax since 1916, our family heritage combines generations of agricultural knowledge with modern extraction, storage and export capabilities.",
      p2: "Our single-source philosophy gives us control from grove to shipment — supporting traceability, consistent quality and dependable supply for international partners.",
      link: "Discover Our Maison",
      imageAlt: "OLIVED — olive groves in Sfax, Tunisia",
    },
    stats: {
      eyebrow: "Scale, Control & Reliability",
      title: "Built to Supply International Markets",
      heroEyebrow: "Global Standing",
      heroSuffix: "nd",
      heroLabel: "Tunisia: World's 2nd Olive Oil Exporter",
      heroSub: "IOC — 2024/25 season",
      labels: [
        "Hectares of Groves",
        "MT — Annual Production",
        "T — Stainless-Steel Storage",
        "MT/Day — Extraction Capacity",
        "Family Heritage",
        "International Export",
      ],
    },
    fullbleed: {
      imageAlt: "OLIVED olive groves at harvest",
      eyebrow: "Single-Source Control",
      title: "From Our Tunisian Groves to Global Markets — Controlled at Every Step.",
      link: "See Our Production",
    },
    journey: {
      eyebrow: "Traceability",
      title: "One chain of custody,\n*grove to shipment.*",
      steps: [
        { step: "Grove", fact: "1,500 ha", text: "Plantations rooted in the Sfax region of Tunisia." },
        { step: "Extraction", fact: "180 MT/day", text: "Modern extraction capacity, complemented by trusted partner mills." },
        { step: "Laboratory", fact: "IOC-certified", text: "An in-house laboratory certified by the International Olive Council." },
        { step: "Storage", fact: "900 T", text: "Stainless-steel storage for consistent, dependable supply." },
        { step: "Shipment", fact: "SGS-verified", text: "SGS analysis and export documentation before every shipment." },
      ],
    },
    solutions: {
      eyebrow: "Our Offer",
      title: "Two Ways to Work with OLIVED",
      lead: "Bulk or packaged — a solution for every market.",
      bulk: {
        tag: "Bulk Export",
        title: "Bulk Olive Oil",
        text: "EVOO, virgin, refined and pomace olive oil available in export-ready bulk formats, subject to specification and availability.",
        tags: ["Flexitank", "IBC", "Drums"],
        link: "Explore Bulk Solutions",
      },
      packaged: {
        tag: "Packaged Collection",
        title: "ORZETA",
        text: "A premium packaged collection combining Tunisian origin, contemporary presentation and Mediterranean character.",
        link: "Discover ORZETA",
      },
      distributorQuestion: "Interested in representing ORZETA in your market?",
    },
    export: {
      eyebrow: "Export Capabilities",
      title: "Export-Ready for Your Destination",
      lead: "Tell us the product, estimated volume and destination. Our team will prepare the appropriate commercial and export response.",
      cta: "Discuss Your Destination",
      features: [
        "Bulk and packaged solutions",
        "Flexitank, IBC and drums",
        "Export documentation",
        "SGS analysis before shipment",
        "Tailored quotation",
      ],
    },
    cta: {
      title: "Tell Us What You Need",
      text: "Share your product, estimated volume and destination. Our export team will respond within 24 business hours.",
    },
  },

  maison: {
    hero: {
      eyebrow: "Notre Maison",
      title: "A Tunisian House.\n*For the World's Finest Tables.*",
      scroll: "Discover the Maison",
    },
    intro: {
      label: "Groupe OLIVED",
      title: "A House Built\n*Over Generations*",
      body: "Founded in 2006 in the Sfax region, OLIVED has built a fully integrated, single-source model over four generations — from our own groves to extraction, controlled storage and global distribution.",
      more: "Read More",
    },
    figures: ["Founded", "Generations", "Hectares", "Markets"],
    heritage: {
      imageAlt: "Millennial olive trees — Sfax Region, Tunisia",
      caption: "Sfax Region · Tunisia · Since Antiquity",
      label: "Patrimoine Tunisien",
      title: "A Land of\n*Civilisation*",
      poem: "For over millennia,\nthe olive tree has shaped this land.\n\nNot as agriculture —\nbut as culture.",
      varieties: "Chemlali · Chetoui · Oueslati · Zarazi · Picholine Tunisienne",
      facts: [
        "Tunisia is among the world's leading olive oil exporters.",
        "Over **80 million olive trees** across the country.",
        "Nearly **30%** of cultivable land dedicated to olive groves.",
      ],
    },
    philosophy: {
      eyebrow: "Single-Source Philosophy",
      title: "When Origin Is Known,\n*Everything Else Follows.*",
      sub: "Every litre is traceable from grove to harvest, extraction and analysis.",
      primary: "Request a Presentation",
      secondary: "Discover Our Grades",
    },
    final: {
      stats: ["ha of Plantations", "MT Annual Production", "MT/Day Extraction"],
      title: "Work With\n*OLIVED*",
      sub: "For bulk buyers, distributors and brand partners.",
    },
  },

  quality: {
    hero: {
      eyebrow: "Certifications",
      title: "Quality Certifications & Standards",
      lead: "OLIVED adheres to the highest quality standards. Our laboratory is certified by the International Olive Council (IOC), and all exported olive oil is verified and certified by the ONH. Our facilities are also registered with the FDA, ensuring the safety and quality of our products.",
    },
    lab: {
      imageAlt: "Laboratory sample analysis",
      eyebrow: "Laboratory Partners",
      title: "Commitment to Quality: Partnerships with Leading Laboratories",
      text: "At **OLIVED**, quality is non-negotiable. We have official partnerships with three highly recognized laboratories to ensure the highest standards for our olive oil. **SGS** conducts comprehensive analysis of all products before export, with sampling performed by third parties for impartiality. **Oléa Conseil** specializes in tasting and selecting our olive oils, confirming their exceptional flavor profiles. Additionally, **TTS Monastir** oversees all safety and security controls, ensuring every drop meets stringent quality and safety standards. These collaborations reflect our unwavering commitment to delivering premium olive oil you can trust.",
    },
    mills: {
      eyebrow: "Sourcing Network",
      title: "Collaborating with Trusted Oil Mill Partners",
      lead: "In addition to our own production, **OLIVED** collaborates with trusted oil mill partners who share our commitment to quality and sustainability. These partnerships allow us to expand our offerings while maintaining the same rigorous standards of traceability, authenticity, and excellence. By working closely with these mills, we ensure that every drop of olive oil bearing the **OLIVED** name reflects our dedication to tradition, innovation, and the unparalleled taste of Tunisia.",
      slides: [
        "Hand-picking freshly harvested olives from a harvest net",
        "Partner mill workers harvesting olives in the orchard",
        "Crate of freshly harvested olives ready for pressing",
        "Hand-selecting ripe olives on the branch",
      ],
    },
    cta: {
      title: "Request our certification dossier",
      text: "IOC, ONH and FDA documentation and laboratory reports — sent within 24 hours.",
      secondary: "Explore Grades",
    },
  },

  bulk: {
    hero: {
      eyebrow: "Select Your Oil",
      title: "Find the Right Olive Oil",
      lead: "Tunisian Extra Virgin olive oil for professional buyers, available in conventional and organic.",
    },
    tabsLabel: "Olive oil grade",
    conventional: {
      tab: "Conventional",
      title: "Extra Virgin Olive Oil",
      text: "Extra Virgin Olive Oil, compliant with IOC standards: naturally extracted, fruity and free from sensory defects, with acidity no higher than 0.8%.",
      appsLabel: "Main Applications",
      apps: "Premium bottling · Private label · Bulk",
      footnote: "Specification sheet, sample and batch documentation available on request.",
      imageAlt: "Conventional Extra Virgin Olive Oil",
    },
    organic: {
      tab: "Organic",
      title: "Organic Extra Virgin Olive Oil",
      text: "Organic Extra Virgin Olive Oil certified to EU Organic and USDA NOP standards, compliant with IOC criteria for acidity, purity and sensory quality.",
      certsLabel: "Certifications",
      footnote: "Organic certification, specification sheet, sample and batch documentation available on request.",
      imageAlt: "Organic Extra Virgin Olive Oil",
    },
    requestOil: "Request This Oil",
    formats: {
      eyebrow: "Shipment Formats",
      title: "Choose Your Shipment Format",
      ask: "Ask About This Format",
      items: [
        { name: "Flexitank", text: "For full-container bulk shipments.", alt: "Flexitank — standard shipping containers" },
        { name: "IBC 1000L", text: "Palletised, food-grade liquid containers.", alt: "IBC 1000L — palletised food-grade containers" },
        { name: "Food-Grade Drums", text: "For flexible, smaller-volume bulk orders.", alt: "Food-grade drums" },
      ],
    },
    process: {
      eyebrow: "From Enquiry to Shipment",
      title: "A Clear Purchasing Process",
      steps: [
        { title: "Share Your Requirements", text: "Tell us the oil category, target specification, volume and destination." },
        { title: "Receive Our Proposal", text: "We confirm availability, suitable format and commercial terms." },
        { title: "Validate the Oil", text: "Review the specification, sample and applicable batch documentation." },
        { title: "Confirm Shipment", text: "The order is prepared according to the agreed terms and destination." },
      ],
    },
    faq: {
      eyebrow: "Before You Enquire",
      title: "Buyer FAQ",
      items: [
        {
          q: "Which olive oil grade is available?",
          a: "OLIVED supplies Extra Virgin olive oil, in conventional and certified organic. Availability can vary by season — our team will confirm current options for your request.",
        },
        {
          q: "Can OLIVED work with a target specification?",
          a: "Yes. Share your target specification and application, and we will confirm whether it can be met or propose the closest available match.",
        },
        {
          q: "Which bulk shipment formats are offered?",
          a: "Flexitank, IBC 1000L and food-grade drums, depending on the oil category and destination.",
        },
        {
          q: "How can I receive a sample and quotation?",
          a: "Submit the bulk enquiry form below with your requirements. Our export team will get back to you with the sample process and a tailored quotation.",
        },
      ],
    },
    cta: {
      title: "Request Your Bulk Offer",
      text: "Provide the essential details and our export team will prepare a tailored response.",
    },
  },

  packaged: {
    rail: ["single origin", "cold extracted", "retail ready"],
    hero: {
      kicker: "Packaged collection",
      mini: "ORZETA / Our Products",
      titleSoft: "Quiet Mediterranean",
      titleStrong: "luxury, bottled.",
      copy: "ORZETA translates OLIVED's Tunisian olive oil into a retail object: composed, tactile and contemporary. The collection is designed for gourmet shelves, gifting and modern Mediterranean hospitality without losing the depth of origin.",
      primary: "Discover Collection",
      secondary: "Request Line Sheet",
      meta: [
        { label: "Formats", value: "250ml to 750ml" },
        { label: "Profile", value: "Soft fruit, almond, olive leaf" },
        { label: "Use", value: "Retail, gifting, hospitality" },
      ],
      tags: ["Tunisia", "Extra Virgin"],
      blendLabel: "Blend",
      blend: "Chemlali and Chetoui, balanced for a softer premium palate.",
      packshotAlt: "ORZETA packaged olive oil bottle",
      shelfLabel: "Shelf presence",
      shelf: "Minimal packaging language, tactile neutrals and export-ready finishing.",
      footer: [
        { label: "Material feel", text: "Soft matte labels, restrained palette, precise typography." },
        { label: "Collection logic", text: "Glass bottles, gifting formats and merchandising continuity." },
        { label: "Execution", text: "Palletised delivery, compliant labelling and clean export documentation." },
      ],
    },
    collection: {
      eyebrow: "Our Products",
      title: "Three retail-ready expressions of ORZETA",
      lead: "One premium visual language, adapted for gourmet retail, gifting and modern Mediterranean counters.",
      signature: {
        kicker: "Signature line",
        title: "ORZETA Signature",
        text: "The core expression of the house. A balanced, soft-fruited extra virgin olive oil for elegant daily use and premium grocery shelves.",
        chips: ["250ml", "500ml", "750ml"],
        note: "Everyday premium",
        link: "Get Specifications",
        imageAlt: "ORZETA Signature bottle",
      },
      reserve: {
        kicker: "Premium gifting",
        title: "ORZETA Reserve",
        text: "A more ceremonial presentation built for curation, luxury hampers and shelves where understatement matters more than excess.",
        chips: ["500ml", "Gift box", "Limited lots"],
        note: "Curated placement",
        link: "Request Samples",
      },
      organic: {
        kicker: "Organic selection",
        title: "ORZETA Organic",
        text: "An organic-ready expression for buyers seeking certification, restrained aesthetics and contemporary Mediterranean positioning.",
        chips: ["Organic", "Retail glass", "Export ready"],
        note: "Clean label positioning",
        link: "Ask Availability",
      },
    },
    editorial: {
      eyebrow: "Premium Range",
      title: "A reusable design language for modern olive oil storytelling",
      text: "The ORZETA page system is built like an editorial brand space: generous margins, quiet typography, neutral materials, and one hero product image allowed to breathe. It is designed to scale from hero to sub-pages without losing tone.",
      notes: [
        { title: "Editorial whitespace", text: "Large breathing room around the product keeps the presentation calm, expensive and deliberate." },
        { title: "Soft olive accents", text: "Olive green is used with restraint, as structure and emphasis rather than decoration." },
        { title: "Luxury retail clarity", text: "Headlines stay legible, product formats stay scannable, and every CTA feels measured." },
        { title: "Reusable modules", text: "Hero, collection cards, editorial split and format tiles can be reused across future product families." },
      ],
      imageAlt: "ORZETA premium packshot",
      captionLabel: "Design Direction",
      caption: "Minimal, tactile, Mediterranean, export-ready.",
    },
    formats: {
      eyebrow: "Formats And Merchandising",
      title: "From gourmet shelves to hospitality service",
      lead: "The same visual discipline can extend across retail, food service and heritage tin presentations without fragmenting the brand.",
      cards: [
        {
          kicker: "Retail",
          title: "Gourmet Shelf",
          text: "Dark glass, soft matte labels and clean front panels designed for premium grocery, delicatessen and concept-store placement.",
          items: ["250ml, 500ml and 750ml glass", "Gift-ready carton language", "Balanced premium price architecture"],
        },
        {
          kicker: "Food Service",
          title: "Modern Hospitality",
          text: "Formats adapted for restaurants, boutique hotels and table service where olive oil becomes part of the dining ritual.",
          items: ["500ml service bottle and 1L refill", "Elegant back-of-house continuity", "Hospitality-ready secondary packaging"],
        },
        {
          kicker: "Tin Packaging",
          title: "Heritage Tin",
          text: "A Mediterranean format with stronger visual memory. Ideal for family-size use, gifting or markets where olive oil tin remains a trusted signifier.",
          items: ["3L and 5L tin potential", "Large-surface storytelling panels", "Premium yet practical presence"],
        },
      ],
    },
    cta: {
      title: "Build the packaged line your market expects",
      text: "Share your target channel, preferred formats and branding intent. We will shape the right ORZETA presentation with you.",
      primary: "Request Line Sheet",
      secondary: "Start A Project",
    },
  },

  contact: {
    hero: {
      eyebrow: "Get In Touch",
      title: "Contact OLIVED",
      lead: "Request a bulk quote or enquire about the ORZETA collection. We respond within 24 hours.",
    },
    info: {
      email: "Email",
      phone: "Phone",
      location: "Location",
      responseTime: "Response Time",
      responseValue: "Within 24 hours",
      markets: "Export Markets",
      marketsValue: "EU · UK · US · GCC · APAC · Global",
    },
    distributor: {
      eyebrow: "Distribution Network",
      title: "Become an OLIVED distributor",
      text: "We are actively building exclusive distribution agreements in key markets. If you are an established importer or distributor looking for a reliable, premium Tunisian olive oil source, we want to hear from you.",
      benefits: [
        { title: "Exclusive Territory Options", text: "Market exclusivity agreements available for qualified partners" },
        { title: "Marketing Support", text: "Sales materials, samples and dedicated account management" },
        { title: "Reliable Supply Chain", text: "Consistent volume, documentation and delivery across seasons" },
      ],
      imageAlt: "OLIVED groves — distribution partnership",
    },
  },

  carousel: {
    label: "Partner mills",
    previous: "Previous image",
    next: "Next image",
    slideOf: "{n} of {total}",
  },

  form: {
    variants: {
      home: {
        submit: "Receive My Export Proposal",
        note: "Confidential enquiry · No commitment · Response within 24 business hours",
      },
      contact: {
        submit: "Send Request",
        note: "We respond within 24 hours · All enquiries treated with strict confidentiality",
      },
      bulk: {
        submit: "Submit Bulk Enquiry",
        note: "Confidential enquiry · Response within 24 business hours",
      },
    },
    fullName: "Full Name",
    fullNamePlaceholder: "John Smith",
    company: "Company",
    companyPlaceholder: "Your company",
    email: "Business Email",
    emailPlaceholder: "you@company.com",
    phone: "Phone",
    phonePlaceholder: "+1 000 000 0000",
    country: "Country / Destination",
    destinationCountry: "Destination Country",
    countryPlaceholder: "e.g. Germany, UAE, USA…",
    sourcingNeed: "Sourcing Need",
    enquiryType: "Enquiry Type",
    interests: { bulk: "Bulk Olive Oil", packaged: "Packaged Collection", packagedOrzeta: "Packaged / ORZETA", distributor: "Become a Distributor" },
    oilCategory: "Olive Oil Category",
    selectCategory: "Select a category",
    organicPreference: "Conventional or Organic",
    selectOption: "Select an option",
    preferredFormat: "Preferred Format",
    selectFormat: "Select a format",
    volume: "Estimated Volume",
    volumePerYear: "Estimated Volume / Year",
    volumePlaceholder: "Approximate quantity",
    selectRange: "Select a range",
    targetSpec: "Target Specification or Application",
    targetSpecPlaceholder: "e.g. intended use or specification target",
    message: "Message",
    messagePlaceholder: "Tell us about your project, grade preferences or packaging requirements…",
    messagePlaceholderBulk: "Tell us more about your project…",
    options: {
      "Extra Virgin Olive Oil": "Extra Virgin Olive Oil",
      "Not sure yet": "Not sure yet",
      Conventional: "Conventional",
      Organic: "Organic",
      "No preference": "No preference",
      Flexitank: "Flexitank",
      "IBC 1000L": "IBC 1000L",
      "Food-Grade Drums": "Food-Grade Drums",
      "Under 5 MT": "Under 5 MT",
      "5 – 20 MT": "5 – 20 MT",
      "20 – 100 MT": "20 – 100 MT",
      "100 – 500 MT": "100 – 500 MT",
      "500 MT +": "500 MT +",
    },
    sending: "Sending…",
    thanks: "Thank you — your enquiry has been received.",
    thanksText: "Our export team will respond within 24 business hours.",
    another: "Send another enquiry",
    errors: {
      fullName: "Full name is required",
      company: "Company is required",
      email: "A valid email is required",
      country: "Country is required",
      interests: "Select at least one enquiry type",
      oilCategory: "Olive oil category is required",
      organicPreference: "Select conventional or organic",
      volume: "Estimated volume is required",
      format: "Preferred format is required",
      targetSpec: "Target specification is required",
      message: "Message is required",
      network: "We could not send your enquiry. Please try again, or email Contact@olived.tn.",
      server: "Please check the highlighted fields.",
    },
  },
};

export type Dictionary = typeof en;
export default en;
