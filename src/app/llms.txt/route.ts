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

- [Market overview](${base}/market): every venue on one page — volume, fees, open interest, stablecoins
- [Spot market](${base}/market/spot): HIP-1 tokens, prices, 24h volume, marketcaps. Per-token pages at /market/spot/{TICKER}
- [Perpetuals](${base}/market/perp): funding rates, open interest, volume. Per-market pages at /market/perp/{COIN}
- [Perp DEXs (HIP-3)](${base}/market/perpdex): builder-deployed perp venues, their markets and open interest
- [Prediction markets (HIP-4)](${base}/market/hip4): outcome markets, probabilities, settlements
- [Builder codes](${base}/market/builders): order flow and fees per builder
- [Wallet tracker](${base}/market/tracker): wallets, PnL, public lists, top traders
- [Ticker auctions (HIP-1)](${base}/market/spot/auction): live spot ticker auction and full history
- [Deploy auctions (HIP-3)](${base}/market/perp/auction): perp DEX deploy auction and past deployments
- [HYPE](${base}/hype): supply, staking, buybacks, burn and protocol revenue
- [Vaults](${base}/explorer/vaults): vault TVL, APR and performance. Per-vault pages at /explorer/vaults/{address}
- [Validators](${base}/explorer/validator): staking, stake distribution and validator stats
- [Liquidations](${base}/explorer/liquidations): live liquidation feed and history
- [Priority fees](${base}/explorer/priority-fees): priority gas on fills and leaderboards
- [Explorer](${base}/explorer): HyperCore transactions, blocks, addresses
- [Ecosystem projects](${base}/ecosystem/project): directory of projects building on Hyperliquid, with TVL and fees
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
