/**
 * Funding config — single source of truth for the sidebar SponsorCard and the
 * /funding page. All sponsor, partner, tier and donation copy lives here so no
 * marketing content is hardcoded in the UI.
 *
 * Fill `sponsors` only once a deal is signed: an empty array renders a
 * "become the first sponsor" call to action instead of naming a prospect.
 */

/** Tile accent so a monogram row is not a wall of cyan. */
export type FundingAccent = "brand" | "gold" | "neutral";

/** A paying sponsor: featured slot in the sidebar, top billing on /funding. */
export interface Sponsor {
  /** Display name, e.g. "EQX Labs". */
  name: string;
  /** One-line descriptor. Keep it short, no em dashes. */
  tagline: string;
  /** 2-3 letter monogram for the logo tile when no image is set. */
  monogram: string;
  /** External link (project site or X profile). */
  href: string;
  /** Optional logo URL; falls back to the monogram tile when absent. */
  logo?: string;
  /** The one sponsor pinned to the featured slot. First featured wins. */
  featured?: boolean;
}

/** An ecosystem partner (non-paying), shown as a small monogram. */
export interface Partner {
  name: string;
  monogram: string;
  href: string;
  accent?: FundingAccent;
  /** Optional logo URL; falls back to the monogram tile when absent. */
  logo?: string;
}

/** A sponsorship tier presented on /funding. */
export interface SponsorTier {
  id: string;
  name: string;
  /** Recurring price label, e.g. "$2,500 / mo". Recommended default, editable. */
  price: string;
  /** One-time equivalent, e.g. "or $25k / year". Optional. */
  priceAlt?: string;
  /** Short positioning line. */
  blurb: string;
  /** What the tier includes. */
  perks: string[];
  /** Emphasise this tier as the recommended anchor. */
  highlighted?: boolean;
}

/**
 * Confirmed paying sponsors. EMPTY until a deal is signed — do not list
 * prospects here. When empty, the sidebar shows the "become first sponsor" CTA.
 */
export const sponsors: Sponsor[] = [
  {
    name: "HypeDexer",
    tagline: "Primary data provider",
    monogram: "HD",
    href: "https://hypedexer.com",
    logo: "/partners/hypedexer.png",
    featured: true,
  },
  // Example once signed (uncomment and fill real values):
  // { name: "EQX Labs", tagline: "US equities, 24/7 on-chain", monogram: "EQX", href: "https://x.com/eqxlabs", featured: true },
];

/**
 * Ecosystem partners. Real relationships, but links are placeholders — replace
 * each "#" with the real URL before shipping.
 */
export const partners: Partner[] = [
  { name: "Hyperliquid France", monogram: "HF", href: "#", accent: "brand", logo: "/partners/hyperliquid-france.png" },
  { name: "Hypurr Collective", monogram: "HC", href: "#", accent: "gold", logo: "/partners/hypurr-collective.png" },
  { name: "HypeDexer", monogram: "HD", href: "#", accent: "brand", logo: "/partners/hypedexer.png" },
];

/**
 * Sponsorship tiers. Prices are recommended defaults — adjust to taste. The
 * "Featured" tier is the anchor: it matches/beats the reference grant, spread
 * over 12 months for predictable runway.
 */
export const sponsorTiers: SponsorTier[] = [
  {
    id: "partner",
    name: "Ecosystem Partner",
    price: "$1,000 / mo",
    priceAlt: "or $10k / year",
    blurb: "For allied projects who want a presence, not the spotlight.",
    perks: [
      "Monogram in the sidebar partners row, on every page",
      "Logo and link on the funding page",
      "A shout-out in one V2 launch post",
    ],
  },
  {
    id: "featured",
    name: "Featured Sponsor",
    price: "$2,500 / mo",
    priceAlt: "or $25k / year",
    blurb: "The featured sidebar slot, seen on every page of the terminal.",
    perks: [
      "Featured card in the sidebar (logo and tagline), on every page",
      "Top billing on the funding page",
      "Named in the V2 comms push with our partners",
      "Free HypeDexer API key to build on the same data we use",
    ],
    highlighted: true,
  },
  {
    id: "founding",
    name: "Founding Sponsor",
    price: "$5,000 / mo",
    priceAlt: "or $30k+ / year",
    blurb: "Presented-by billing and co-marketing across the network.",
    perks: [
      'Exclusive "Presented by" placement',
      "Co-marketing with Hyperliquid France, Hypurr Collective and HypeDexer",
      "Priority input on the V2 roadmap",
      "Everything in Featured",
    ],
  },
];

/**
 * Traction shown on /funding. Real numbers pulled from the site analytics
 * (12-month window). Update as the numbers grow.
 */
export const fundingStats: { label: string; value: string; sub?: string }[] = [
  { label: "Unique visitors", value: "10,502", sub: "last 12 months" },
  { label: "Page views", value: "37,517", sub: "last 12 months" },
  { label: "Paid marketing", value: "~$0", sub: "organic growth" },
];

/**
 * Donation target. PLACEHOLDER — set a real address before shipping the donate
 * block, or leave `address` empty to hide the crypto block and keep only the
 * contact call to action.
 */
export const donation: { address: string; chainLabel: string } = {
  address: "0x5CF220ac4BAb057B88838a651346164f813b9F89",
  chainLabel: "HyperEVM (EVM address)",
};

/** Where a prospective sponsor reaches out. */
export const fundingContact: { twitter: string; email: string } = {
  twitter: "https://x.com/liquidterminal",
  email: "",
};

/** Route the SponsorCard and its links point to. */
export const FUNDING_HREF = "/funding";
