import { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/site-config";

const siteUrl = SITE_CONFIG.url;

/** Decode a dynamic route param for titles/canonicals (defensive length cap). */
export function decodeEntityParam(raw: string): string {
  try {
    return decodeURIComponent(raw).slice(0, 48).trim();
  } catch {
    return raw.slice(0, 48).trim();
  }
}

interface SEOProps {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  image?: string;
  noIndex?: boolean;
}

export function generateMetadata({
  title,
  description,
  path = "",
  keywords = [],
  image = "/og-image.png",
  noIndex = false,
}: SEOProps): Metadata {
  const url = `${siteUrl}${path}`;
  const fullTitle = `${title} | Liquid Terminal`;

  return {
    // Absolute on purpose: the root layout's `%s | Liquid Terminal` template
    // does not reach grandchildren of a layout that sets a string title (the
    // whole /market section rendered brandless, /market itself doubled).
    title: { absolute: fullTitle },
    description,
    keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: "Liquid Terminal",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
      site: "@liquidterminal",
      creator: "@liquidterminal",
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : undefined,
  };
}

// Metadata presets pour chaque section
export const seoConfig = {
  home: {
    title: "Hyperliquid Analytics, Explorer & Wiki",
    description: "Explore Hyperliquid ecosystem with the most comprehensive free terminal. Track on-chain data, market analytics, validators, vaults & DeFi activity on HyperCore & HyperEVM.",
    keywords: [
      "hyperliquid explorer",
      "hyperliquid analytics", 
      "hyperliquid terminal",
      "hypercore data",
      "hyperevm terminal",
      "defi dashboard",
      "hyperliquid on-chain explorer",
      "hyperliquid market data",
    ],
  },
  
  explorer: {
    title: "Hyperliquid Explorer - Blocks, Transactions, Vaults & Validators",
    description: "Explore Hyperliquid on-chain data: transactions, blocks, addresses, validators and vaults. Real-time HyperCore analytics, free and without an account.",
    keywords: [
      "hyperliquid explorer",
      "hyperliquid blockchain",
      "on-chain analytics",
      "hypercore explorer",
      "transaction search",
      "address lookup",
      "validator tracking",
    ],
    path: "/explorer",
    image: "/og/explorer.png",
  },
  
  market: {
    title: "Hyperliquid Market Analytics - Spot, Perpetuals & DeFi Data",
    description: "Comprehensive Hyperliquid market analytics: spot trading, perpetual futures, auction data, trader tracking & DeFi metrics. Free real-time dashboard.",
    keywords: [
      "hyperliquid market data",
      "hyperliquid analytics",
      "perpetual futures",
      "spot trading data",
      "defi metrics",
      "trader tracking",
      "market dashboard",
    ],
    path: "/market",
    image: "/og/market.png",
  },
  
  ecosystem: {
    title: "Hyperliquid Ecosystem - Project Directory & Rankings",
    description: "Directory of projects building on Hyperliquid: DeFi, infrastructure, wallets and tools, ranked with live TVL and fees from DefiLlama.",
    keywords: ["Hyperliquid ecosystem", "dApps", "crypto projects", "DeFi tools", "blockchain apps"],
    // The bare /ecosystem route does not exist (404): the directory lives at
    // /ecosystem/project, and the canonical must say so.
    path: "/ecosystem/project",
    image: "/og/ecosystem.png",
  },
  
  publicGoods: {
    title: "Public Goods Initiative - Support Open Source on Hyperliquid",
    description: "Discover and support open-source projects building public goods for the Hyperliquid ecosystem. Funded by validator fees without community donations. Curated by Ryzed, Imad, and Kirby.",
    keywords: ["public goods", "open source", "grants", "Hyperliquid funding", "crypto grants", "validator funding"],
    path: "/ecosystem/publicgoods",
    image: "/og/ecosystem.png",
  },
  
  wiki: {
    title: "Hyperliquid Wiki - Guides, Docs & Learning Resources",
    description: "Community-curated Hyperliquid knowledge base: a structured curriculum, guides, docs and resources for traders and builders.",
    keywords: ["Hyperliquid wiki", "Hyperliquid guides", "crypto guides", "blockchain tutorials", "documentation", "learning resources"],
    path: "/wiki",
    image: "/og/wiki.png",
  },

  perpdex: {
    title: "Hyperliquid Perp DEXs - HIP-3 Builder Markets",
    description: "All builder-deployed perp DEXs on Hyperliquid (HIP-3): venues, markets, open interest, volume, fees and deploy auctions.",
    keywords: ["Hyperliquid perp DEX", "HIP-3", "builder DEX", "perpetuals", "deploy auction"],
    path: "/market/perpdex",
    image: "/og/market.png",
  },

  hype: {
    title: "HYPE Token - Supply, Staking, Burn & Buybacks",
    description: "HYPE tokenomics live: circulating supply and scarcity, staking, Assistance Fund buybacks, burn and the protocol revenue flywheel.",
    keywords: ["HYPE token", "HYPE supply", "HYPE staking", "Hyperliquid HYPE", "HYPE burn", "Assistance Fund"],
    path: "/hype",
  },

  hip4: {
    title: "HIP-4 Contest — Exploratory documentation",
    description:
      "Reverse-engineered HIP-4 prediction markets documentation on HyperEVM testnet (chain 998). ABI, events, mechanics, bridge, and code examples — not official Hyperliquid documentation.",
    keywords: [
      "HIP-4",
      "Hyperliquid",
      "prediction markets",
      "HyperEVM",
      "testnet",
      "contest contract",
    ],
    path: "/hip4",
  },
  
  tracker: {
    title: "Hyperliquid Wallet Tracker - Portfolio & PnL",
    description: "Track any Hyperliquid wallet in real time: positions, PnL and activity. Organize wallets in lists, import via CSV, follow top traders. Free.",
    keywords: ["Hyperliquid wallet tracker", "portfolio tracker", "wallet tracker", "multi-wallet", "Hyperliquid tracker"],
    path: "/market/tracker",
    image: "/og/market.png",
  },
  
  api: {
    title: "Liquid API - Hyperliquid Data API",
    description: "Access Hyperliquid data via REST API. Free tier available. Real-time market data, blockchain info, and ecosystem metrics for developers.",
    keywords: ["crypto API", "blockchain API", "Hyperliquid API", "market data API", "REST API"],
    path: "/products/api",
  },
  
  rpc: {
    title: "Liquid RPC - Hyperliquid RPC Node Service",
    description: "Fast and reliable RPC nodes for Hyperliquid. Connect your dApps and tools with low latency and high availability. Free and paid tiers.",
    keywords: ["RPC node", "blockchain node", "Hyperliquid RPC", "crypto infrastructure", "web3 node"],
    path: "/products/rpc",
  },
  
  publicLists: {
    title: "Public Wallet Lists - Community Curated Lists",
    description: "Browse and copy public wallet lists shared by the Hyperliquid community. Discover interesting addresses and follow top traders.",
    keywords: ["wallet lists", "public lists", "trader lists", "crypto addresses", "portfolio sharing"],
    path: "/market/tracker/public-lists",
    image: "/og/market.png",
  },

  spot: {
    title: "Hyperliquid Spot Market - Live Token Prices & Volume",
    description: "Real-time Hyperliquid spot market data: token prices, 24h volume, stablecoin liquidity, marketcaps and deploy auctions. Free, no account needed.",
    keywords: ["hyperliquid spot market", "spot trading", "token prices", "Hyperliquid tokens", "trading volume"],
    path: "/market/spot",
    image: "/og/market.png",
  },

  perp: {
    title: "Hyperliquid Perpetuals - Funding Rates, Open Interest & Volume",
    description: "Track every Hyperliquid perpetual market: real-time funding rates, open interest, liquidations, and trading volumes across 170+ pairs.",
    keywords: ["hyperliquid perpetuals", "perpetual futures", "funding rates", "open interest", "crypto derivatives"],
    path: "/market/perp",
    image: "/og/market.png",
  },

  spotAuction: {
    title: "Hyperliquid Ticker Auctions - Live HIP-1 Auction Tracker",
    description: "Follow the live Hyperliquid ticker auction: current Dutch auction price, countdown to the next one, and the full history of past HIP-1 ticker sales.",
    keywords: ["Hyperliquid auction", "ticker auction", "HIP-1", "token auctions", "Hyperliquid auctions", "spot auction"],
    path: "/market/spot/auction",
    image: "/og/market.png",
  },
  perpAuction: {
    title: "Hyperliquid Perp Deploy Auctions - HIP-3 Auction Tracker",
    description: "Track Hyperliquid perp deploy auctions (HIP-3): live auction state, price in HYPE, countdown and every past builder DEX deployment.",
    keywords: ["Hyperliquid auction", "perp deploy auction", "HIP-3", "perp auctions", "DEX auctions"],
    path: "/market/perp/auction",
    image: "/og/market.png",
  },

  marketBuilders: {
    title: "Hyperliquid Builder Codes - Volume & Fees Leaderboard",
    description:
      "Hyperliquid builder codes ranked: order-flow volume, builder fees and top users for every interface routing orders to Hyperliquid.",
    keywords: ["Hyperliquid builder codes", "builder fees", "Hyperliquid builders", "referral fees", "order flow"],
    path: "/market/builders",
    image: "/og/market.png",
  },

  marketHip4: {
    title: "Hyperliquid Prediction Markets - HIP-4 Odds & Volume",
    description:
      "Live HIP-4 prediction markets on Hyperliquid: outcome probabilities, trading volume, open interest, fills, and market resolutions.",
    keywords: ["HIP-4", "prediction markets", "Hyperliquid outcomes", "binary markets", "DEX predictions"],
    path: "/market/hip4",
    image: "/og/market.png",
  },

  dashboard: {
    title: "Dashboard - Your Hyperliquid Overview",
    description: "Personalized dashboard for your Hyperliquid activity. Track your portfolio, positions, transactions, and more.",
    keywords: ["crypto dashboard", "portfolio overview", "trading dashboard", "Hyperliquid account"],
    path: "/dashboard",
  },

  publicGoodsPage: {
    title: "Public Goods - Open Source Projects on Hyperliquid",
    description: "Browse open-source public goods projects building on Hyperliquid. Funded by validator fees through EnigmaValidator. Curated by Ryzed (Hyperswap), Imad (Enigma), and Kirby (HypurrCo).",
    keywords: ["public goods", "open source", "Hyperliquid grants", "validator funding", "community projects", "EnigmaValidator"],
    path: "/ecosystem/publicgoods",
    image: "/og/ecosystem.png",
  },

  vaults: {
    title: "Hyperliquid Vaults - TVL, APR & Performance Rankings",
    description: "Every Hyperliquid vault ranked by TVL, APR and followers: HLP, protocol vaults and user-run strategies, with full performance history per vault.",
    keywords: ["Hyperliquid vaults", "HLP vault", "vault APR", "crypto vaults", "vault strategies", "DeFi vaults"],
    path: "/explorer/vaults",
    image: "/og/explorer.png",
  },

  priorityFees: {
    title: "Priority Fees - Hyperliquid Explorer",
    description:
      "Track Hyperliquid priority gas fees, HIP-3 gossip auction slots, leaderboards, and recent fills with priority gas.",
    keywords: [
      "priority fees",
      "Hyperliquid",
      "priority gas",
      "HIP-3",
      "gossip auctions",
      "indexer",
    ],
    path: "/explorer/priority-fees",
    image: "/og/explorer.png",
  },

  validators: {
    title: "Hyperliquid Validators - Staking, Stake Share & Commissions",
    description: "Monitor Hyperliquid validators: stake, uptime, commissions and HYPE staking flows across the whole validator set.",
    keywords: ["Hyperliquid validators", "HYPE staking", "validators", "staking", "proof of stake", "HyperBFT"],
    path: "/explorer/validator",
    image: "/og/explorer.png",
  },

  liquidations: {
    title: "Hyperliquid Liquidations - Live Feed & History",
    description: "Track Hyperliquid liquidations in real time: live feed, aggregate stats and history with size, notional value and market impact.",
    keywords: ["liquidations", "Hyperliquid liquidations", "trading liquidations", "perp liquidations", "market data"],
    path: "/explorer/liquidations",
    image: "/og/explorer.png",
  },
};

