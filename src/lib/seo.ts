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
    title: "Hyperliquid Explorer - Complete On-Chain Data Analysis",
    description: "Explore Hyperliquid blockchain data: transactions, blocks, addresses, validators & vaults. Real-time on-chain analytics for HyperCore with HyperEVM coming soon.",
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
    title: "Liquid Ecosystem - Hyperliquid Projects Directory",
    description: "Comprehensive directory of Hyperliquid ecosystem projects. Discover dApps, tools, and services built on HyperCore and HyperEVM.",
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
    title: "Liquid Wiki - Hyperliquid Knowledge Base",
    description: "Complete knowledge base for Hyperliquid ecosystem. Guides, tutorials, documentation, and curated resources for builders and users.",
    keywords: ["Hyperliquid wiki", "crypto guides", "blockchain tutorials", "documentation", "learning resources"],
    path: "/wiki",
    image: "/og/wiki.png",
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
    title: "Liquid Tracker - Wallet & Portfolio Tracker",
    description: "Track your Hyperliquid wallets and portfolios in real-time. Organize wallets in lists, import via CSV, monitor performance. Free and premium tiers.",
    keywords: ["wallet tracker", "portfolio tracker", "crypto wallet", "multi-wallet", "Hyperliquid tracker"],
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
    title: "Spot Auctions - Hyperliquid Token Auctions",
    description: "Monitor ongoing and upcoming spot token auctions on Hyperliquid. Participate in fair launches and token distributions.",
    keywords: ["token auctions", "fair launch", "Hyperliquid auctions", "token distribution", "IDO", "spot auction"],
    path: "/market/spot/auction",
    image: "/og/market.png",
  },
  perpAuction: {
    title: "Perpetual Auctions - Hyperliquid DEXs",
    description: "Monitor Hyperliquid Perpetual DEX auctions. Track new perpetual listings and participate in the ecosystem.",
    keywords: ["perp auctions", "Hyperliquid perps", "new listings", "DEX auctions"],
    path: "/market/perp/auction",
    image: "/og/market.png",
  },

  marketBuilders: {
    title: "Builders - Referral & Fee Stats",
    description:
      "Explore Hyperliquid referral builders: global volume and fee stats, top builders by activity, and per-builder detail with top users.",
    keywords: ["Hyperliquid builders", "referral fees", "builder fees", "DEX builders", "indexer"],
    path: "/market/builders",
    image: "/og/market.png",
  },

  marketHip4: {
    title: "HIP-4 - Prediction Markets",
    description:
      "Live HIP-4 prediction markets on Hyperliquid — outcome probabilities, trading volume, open interest, fills, and market resolutions.",
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
    title: "Vaults Explorer - Hyperliquid Vaults",
    description: "Explore Hyperliquid vaults and their performance. Track TVL, returns, strategies, and vault metrics.",
    keywords: ["crypto vaults", "Hyperliquid vaults", "TVL", "vault strategies", "DeFi vaults"],
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
    title: "Validators - Hyperliquid Network Validators",
    description: "Monitor Hyperliquid validators, staking stats, commission rates, and network security metrics.",
    keywords: ["validators", "staking", "Hyperliquid validators", "proof of stake", "network security"],
    path: "/explorer/validator",
    image: "/og/explorer.png",
  },

  liquidations: {
    title: "Liquidations - Hyperliquid Liquidation Events",
    description: "Track Hyperliquid liquidation events in real-time. Monitor size, notional value, and market impact of liquidations.",
    keywords: ["liquidations", "Hyperliquid liquidations", "trading liquidations", "perp liquidations", "market data"],
    path: "/explorer/liquidations",
    image: "/og/explorer.png",
  },
};

