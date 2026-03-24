/** HIP-4 doc chapters: slug → static HTML filename under /public/hip4/ */

export const HIP4_CHAPTERS = [
  { slug: "home", title: "Home", file: "home.html" },
  { slug: "overview", title: "Overview", file: "overview.html" },
  { slug: "abi", title: "Full ABI", file: "abi.html" },
  { slug: "events", title: "Events", file: "events.html" },
  { slug: "reverts", title: "Revert strings", file: "reverts.html" },
  { slug: "markets", title: "Active markets", file: "markets.html" },
  { slug: "mechanics", title: "Mechanics", file: "mechanics.html" },
  { slug: "bridge", title: "Bridge L1↔EVM", file: "bridge.html" },
  { slug: "txexamples", title: "Real txs", file: "txexamples.html" },
  { slug: "storage", title: "Storage", file: "storage.html" },
  { slug: "docs", title: "Docs & code", file: "docs.html" },
] as const;

export type Hip4Slug = (typeof HIP4_CHAPTERS)[number]["slug"];

export const HIP4_SLUGS = HIP4_CHAPTERS.map((c) => c.slug);

export function getHip4Chapter(slug: string) {
  return HIP4_CHAPTERS.find((c) => c.slug === slug) ?? null;
}

/** Extra scripts (paths under /hip4/) needed for a chapter after HTML inject */
export function hip4ScriptsForSlug(slug: string): string[] {
  if (slug === "overview") return ["/hip4/layout.js"];
  if (slug === "markets")
    return [
      "/hip4/hip4-contracts.js",
      "/hip4/markets.js",
      "/hip4/markets-scan.js",
    ];
  if (slug === "abi")
    return ["/hip4/hip4-contracts.js", "/hip4/abi.js"];
  return [];
}
