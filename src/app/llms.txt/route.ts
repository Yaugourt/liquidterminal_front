import { SITE_CONFIG } from "@/lib/site-config";
import { CHAPTER_CATEGORY_MAP, slugify } from "@/components/wiki/hub/topics";

export const revalidate = 3600;

/**
 * llms.txt (llmstxt.org): a curated map of the site for LLMs and AI agents.
 * The client-rendered pages are opaque to non-JS crawlers, so this file and
 * /llms-full.txt are the canonical machine-readable entry points.
 */
export async function GET() {
  const base = SITE_CONFIG.url;
  const chapters = Object.keys(CHAPTER_CATEGORY_MAP)
    .map((title) => `- [${title}](${base}/wiki/learn/${slugify(title)}): curated articles, docs and threads about ${title}`)
    .join("\n");

  const body = `# Liquid Terminal

> Free real-time analytics for the Hyperliquid ecosystem: spot & perp markets, vaults, validators, auctions, HyperCore & HyperEVM explorer, and a community-curated educational wiki. No account needed for read access.

Liquid Terminal is an independent, free product built by the Hyperliquid community. Data refreshes in real time from HyperCore and HyperEVM.

## Wiki (educational content)

The wiki is the best-covered part of the site for text content. The full corpus (every approved resource with title, summary, category and URL) is available in one file at [llms-full.txt](${base}/llms-full.txt).

- [Wiki home](${base}/wiki): search, chapters, latest resources
- [All topics](${base}/wiki/topics): index of every chapter and category
- [Read lists](${base}/wiki/readlists): community reading lists with reading order
${chapters}

## Live data sections

These pages are client-rendered dashboards; the numbers below them come from public APIs.

- [Markets](${base}/market): Hyperliquid spot & perp market stats
- [Spot](${base}/market/spot): tokens, prices, volumes
- [Perpetuals](${base}/market/perp): funding, open interest
- [Auctions](${base}/market/spot/auction): ticker auction prices and history
- [Vaults](${base}/explorer/vaults): vault TVL and performance
- [Validators](${base}/explorer/validator): staking and validator stats
- [Explorer](${base}/explorer): HyperCore transactions, blocks, addresses
- [Ecosystem](${base}/ecosystem): directory of Hyperliquid projects
- [HIP-4 docs](${base}/hip4): reverse-engineered prediction-markets documentation

## Optional

- [Public goods](${base}/ecosystem/publicgoods): open-source projects funded by validator fees
- [Legal](${base}/legal/terms): terms of use
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
