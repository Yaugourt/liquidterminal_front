/** HIP-4 doc chapters — React bodies in src/components/hip4/chapters/ */

export const HIP4_CHAPTERS = [
  { slug: "home", title: "Home" },
  { slug: "overview", title: "Overview" },
  { slug: "abi", title: "Full ABI" },
  { slug: "events", title: "Events" },
  { slug: "reverts", title: "Revert strings" },
  { slug: "markets", title: "Active markets" },
  { slug: "mechanics", title: "Mechanics" },
  { slug: "bridge", title: "Bridge L1↔EVM" },
  { slug: "txexamples", title: "Real txs" },
  { slug: "storage", title: "Storage" },
  { slug: "docs", title: "Docs & code" },
] as const;

export type Hip4Slug = (typeof HIP4_CHAPTERS)[number]["slug"];

export const HIP4_SLUGS = HIP4_CHAPTERS.map((c) => c.slug);

export function getHip4Chapter(slug: string) {
  return HIP4_CHAPTERS.find((c) => c.slug === slug) ?? null;
}
