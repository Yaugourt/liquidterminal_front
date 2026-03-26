/** HIP-4 doc chapters — React bodies in src/components/hip4/chapters/ */

export const HIP4_NAV_SECTIONS = ["primary", "bridge", "evm"] as const;
export type Hip4NavSection = (typeof HIP4_NAV_SECTIONS)[number];

export const HIP4_NAV_SECTION_LABELS: Record<Hip4NavSection, string> = {
  primary: "Research & HyperCore",
  bridge: "L1 ↔ HyperEVM",
  evm: "Third-party EVM (unconfirmed)",
};

export const HIP4_CHAPTERS = [
  { slug: "home", title: "Home", section: "primary" },
  { slug: "research", title: "Timeline", section: "primary" },
  { slug: "core", title: "HyperCore (L1)", section: "primary" },
  { slug: "reference", title: "API & data", section: "primary" },
  { slug: "info-api", title: "Info endpoint", section: "primary" },
  { slug: "compare", title: "Industry compare", section: "primary" },
  { slug: "bridge", title: "Bridge L1↔EVM", section: "bridge" },
  { slug: "overview", title: "EVM overview", section: "evm" },
  { slug: "abi", title: "Full ABI", section: "evm" },
  { slug: "events", title: "Events", section: "evm" },
  { slug: "reverts", title: "Revert strings", section: "evm" },
  { slug: "markets", title: "Active markets", section: "evm" },
  { slug: "mechanics", title: "Mechanics", section: "evm" },
  { slug: "txexamples", title: "Real txs", section: "evm" },
  { slug: "storage", title: "Storage", section: "evm" },
  { slug: "docs", title: "Docs & code", section: "evm" },
] as const;

export type Hip4Slug = (typeof HIP4_CHAPTERS)[number]["slug"];

export const HIP4_SLUGS = HIP4_CHAPTERS.map((c) => c.slug);

export function getHip4Chapter(slug: string) {
  return HIP4_CHAPTERS.find((c) => c.slug === slug) ?? null;
}

/** Section id for a slug — used for default-open accordion in mobile nav. */
export function getHip4SectionForSlug(slug: string): Hip4NavSection | null {
  const ch = getHip4Chapter(slug);
  return ch?.section ?? null;
}
