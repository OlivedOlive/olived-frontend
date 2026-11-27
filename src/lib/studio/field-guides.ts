/**
 * Help for each label field: what it is, how to write it, where it goes and what can be changed, with notes
 * for markets whose rules differ. The wording follows the market templates the checks are built on; the
 * importer and the destination's authorities have the final say before printing.
 */
export type Side = "front" | "left" | "right" | "sale";

export type FieldGuide = {
  side: Side;
  what: string;
  how: string[];
  /** What the client may change, beyond the wording. */
  edit?: string;
  markets?: Record<string, string>;
};

const GULF = "Gulf markets (GSO rules) need the label in Arabic; English may be added.";

export const SIDE_NAMES: Record<Side, string> = {
  front: "Front",
  left: "Left side · product information",
  right: "Right side · nutrition",
  sale: "Not printed: sale details",
};

export const FIELD_GUIDES: Record<string, FieldGuide> = {
  brandName: {
    side: "front",
    what: "The brand the shopper sees: ORZETA, Oussoul or your own brand name.",
    how: ["Write it exactly as on your logo.", "For ORZETA and Oussoul the brand stays the same in every market."],
    edit: "On the front the logo usually carries the brand; you can resize it, move it or add the name as text too.",
  },
  productName: {
    side: "front",
    what: "The legal name of the food, the product designation, in the market's language.",
    how: [
      "For extra virgin olive oil, keep the legal name: \"Extra virgin olive oil\" and its translation (\"Huile d'olive vierge extra\", \"Natives Olivenöl extra\"…).",
      "A marketing name may be added, but it does not replace the legal name.",
    ],
    edit: "Bigger, bolder or in another typeface is fine; keep it on the front with the origin.",
    markets: { CA: "Canada: the name in English and in French.", SA: GULF, AE: GULF, KW: GULF, QA: GULF },
  },
  productNameFr: {
    side: "front",
    what: "The product name in French, next to the English one.",
    how: ["Canada requires English and French on food labels: \"Huile d'olive extra vierge\"."],
    markets: { CA: "Required for Canada." },
  },
  productNameAr: {
    side: "front",
    what: "The product name in Arabic: زيت زيتون بكر ممتاز.",
    how: ["Keep the Arabic text right-to-left; the Studio sets Arabic lines from the right."],
    markets: { SA: GULF, AE: GULF, KW: GULF, QA: GULF },
  },
  origin: {
    side: "front",
    what: "Where the olives were grown and the oil was obtained: for OLIVED, Tunisia.",
    how: ["Write \"Origin: Tunisia\" (or \"Product of Tunisia\") in the market's language.", "For olive oil the origin is compulsory in the EU and the UK."],
    edit: "Keep it in the same field of vision as the product name, on the front.",
  },
  claim: {
    side: "front",
    what: "An optional quality claim, such as \"Cold extraction\" or \"First cold pressed\".",
    how: [
      "Only use a claim that is true for this oil: \"Cold extraction\" means the oil was obtained below 27 °C.",
      "Leave it empty if you are not sure; it is optional.",
    ],
    edit: "Any style and colour; you can delete the block.",
  },
  netQuantity: {
    side: "front",
    what: "How much oil the bottle holds.",
    how: ["Write the volume with its unit: \"750 ml\".", "The ℮ mark may follow the quantity in the EU and the UK when the filling meets the average-quantity rules."],
    edit: "Keep it on the front, large enough to read (the checklist checks the size).",
    markets: { US: "USA: both US and metric units, for example \"25.4 fl oz (750 mL)\".", CA: "Canada: metric units, for example \"750 mL\"." },
  },
  ingredients: {
    side: "left",
    what: "The ingredients list.",
    how: ["For olive oil: \"Ingredients: extra virgin olive oil\" in each label language."],
    markets: { SA: GULF, AE: GULF, KW: GULF, QA: GULF },
  },
  storage: {
    side: "left",
    what: "How to keep the oil.",
    how: ["For olive oil the EU rules ask for it: \"Store away from heat and light\"; you can add \"Reseal after use\"."],
  },
  producer: {
    side: "left",
    what: "Who made and bottled the oil, with the address.",
    how: ["For OLIVED products: \"Produced and bottled by: Olived SARL\", then the address in Sfax, Tunisia."],
  },
  importer: {
    side: "left",
    what: "Your company: the importer that puts the product on the market, with its address in that country.",
    how: [
      "Replace the [placeholder] with your company's name and full address.",
      "In the EU and the UK, a food made outside them must show the name and address of the importer there.",
    ],
    edit: "It sits in a white box so it stays readable; you can change the box colour or remove it.",
  },
  bestBefore: {
    side: "left",
    what: "The date until which the oil keeps its quality.",
    how: [
      "The date is usually printed on the bottle or label at filling. Write the wording and leave the date to the bottler, or type the date if you know it.",
      "Replace the [MM/YYYY] placeholder: the checklist does not pass while it is there.",
    ],
    markets: { SA: "Gulf markets use production and expiry dates.", AE: "Gulf markets use production and expiry dates.", KW: "Gulf markets use production and expiry dates.", QA: "Gulf markets use production and expiry dates." },
  },
  productionDate: {
    side: "left",
    what: "The date the oil was bottled.",
    how: ["Required in the Gulf and Russia, next to the expiry date.", "Usually printed at filling: write the wording and the date format."],
    markets: { RU: "Russia (EAEU rules): the date of manufacture is required." },
  },
  lot: {
    side: "left",
    what: "The batch the bottle comes from, for traceability.",
    how: ["Type the lot code, or the wording your bottler prints with it.", "Replace the [XXXXX] placeholder: the checklist does not pass while it is there."],
  },
  barcode: {
    side: "left",
    what: "The retail barcode number (GTIN).",
    how: ["Type the number GS1 gave you; the Studio draws the barcode. See the barcode guide under the box."],
    edit: "Width sets the barcode size, the top and bottom its height.",
  },
  organicControl: {
    side: "left",
    what: "For organic oil: the code of the organic control body and the origin of the farming.",
    how: [
      "EU and UK: the control body code (for Tunisia \"TN-BIO-…\") and where it was farmed (\"Non-EU agriculture\"); the EU organic logo is optional on imported products.",
      "The checklist warns when a control body code has been withdrawn.",
    ],
  },
  marks: {
    side: "left",
    what: "Conformity marks the market asks for.",
    how: ["Russia and the Eurasian Economic Union: the EAC mark."],
    markets: { RU: "Required for Russia: the EAC mark." },
  },
  foodType: {
    side: "left",
    what: "The Korean food type (식품유형) for the product.",
    how: ["Korea is a draft market in the Studio: confirm the wording with your importer."],
    markets: { KR: "Draft market: confirm every statement before printing." },
  },
  nutrition: {
    side: "right",
    what: "The nutrition table.",
    how: [
      "One line per nutrient, the name, then a tab, then the value; the Studio draws it as a two-column table.",
      "The template's values are typical for extra virgin olive oil; use your laboratory values if they differ.",
    ],
    edit: "Any typeface and size above the market's minimum; keep the lines together on the right side.",
    markets: {
      DE: "EU: energy, fat, saturates, carbohydrate, sugars, protein and salt per 100 ml.",
      FR: "EU: energy, fat, saturates, carbohydrate, sugars, protein and salt per 100 ml.",
      GB: "UK: the same nutrients as the EU, per 100 ml.",
      US: "USA: the Nutrition Facts format, per serving, with the serving size.",
      CA: "Canada: the bilingual Nutrition Facts table.",
    },
  },
  categoryStatement: {
    side: "right",
    what: "The legal description of the olive oil category.",
    how: ["EU and UK, for extra virgin olive oil: \"Superior category olive oil obtained directly from olives and solely by mechanical means\". Keep the wording."],
  },
  destinationCountry: {
    side: "sale",
    what: "The country you sell in, when it is not one of the Studio's markets.",
    how: ["Not printed: it tells the OLIVED team which rules to check."],
  },
};

/** What each step's label sides hold and what can be changed there. */
export const STEP_GUIDES = {
  front: {
    title: "What goes on the front",
    holds: ["The brand or logo", "The product name in the market's languages", "The origin", "The net quantity", "An optional claim"],
    edit: [
      "Move, resize and rotate any block; drag a corner to scale text.",
      "Change typeface, size, colour, weight and alignment; panel background colours.",
      "Add your own text, logos, images and shapes from the toolbar or by right-clicking the label.",
      "Delete optional blocks. Required information must stay on the front and big enough to read.",
    ],
  },
  sides: {
    title: "What goes on the left and right sides",
    holds: [
      "Left: ingredients, storage, producer, importer, dates, lot and barcode",
      "Right: the category statement and the nutrition table",
    ],
    edit: [
      "Pick the side under \"Add to\" before adding text, a logo or a shape.",
      "Move blocks between the sides with \"Move to left / right side\" in the block settings.",
      "Keep every required block on its side and away from the folds: the checklist warns about both.",
      "A block you deleted can be put back with \"Add to label\" in the checklist.",
    ],
  },
};
