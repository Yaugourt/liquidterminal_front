import { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/site-config";

const siteUrl = SITE_CONFIG.url;

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
    title,
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
    title: "Liquid Terminal - Complete HyperLiquid Explorer & Analytics Platform",
    description: "Explore HyperLiquid ecosystem with the most comprehensive free terminal. Track on-chain data, market analytics, validators, vaults & DeFi activity on HyperCore & HyperEVM.",
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
    title: "HyperLiquid Explorer - Complete On-Chain Data Analysis | Liquid Terminal",
    description: "Explore HyperLiquid blockchain data: transactions, blocks, addresses, validators & vaults. Real-time on-chain analytics for HyperCore with HyperEVM coming soon.",
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
  },
  
  market: {
    title: "HyperLiquid Market Analytics - Spot, Perpetuals & DeFi Data | Liquid Terminal",
    description: "Comprehensive HyperLiquid market analytics: spot trading, perpetual futures, auction data, trader tracking & DeFi metrics. Free real-time dashboard.",
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
  },
  
  ecosystem: {
    title: "Liquid Ecosystem - HyperLiquid Projects Directory",
    description: "Comprehensive directory of HyperLiquid ecosystem projects. Discover dApps, tools, and services built on HyperCore and HyperEVM.",
    keywords: ["HyperLiquid ecosystem", "dApps", "crypto projects", "DeFi tools", "blockchain apps"],
    path: "/ecosystem",
  },
  
  publicGoods: {
    title: "Public Goods Initiative - Support Open Source on HyperLiquid",
    description: "Discover and support open-source projects building public goods for the HyperLiquid ecosystem. Funded by validator fees without community donations. Curated by Ryzed, Imad, and Kirby.",
    keywords: ["public goods", "open source", "grants", "HyperLiquid funding", "crypto grants", "validator funding"],
    path: "/ecosystem/public-goods",
  },
  
  wiki: {
    title: "Liquid Wiki - HyperLiquid Knowledge Base",
    description: "Complete knowledge base for HyperLiquid ecosystem. Guides, tutorials, documentation, and curated resources for builders and users.",
    keywords: ["HyperLiquid wiki", "crypto guides", "blockchain tutorials", "documentation", "learning resources"],
    path: "/wiki",
  },
  
  tracker: {
    title: "Liquid Tracker - Wallet & Portfolio Tracker",
    description: "Track your HyperLiquid wallets and portfolios in real-time. Organize wallets in lists, import via CSV, monitor performance. Free and premium tiers.",
    keywords: ["wallet tracker", "portfolio tracker", "crypto wallet", "multi-wallet", "HyperLiquid tracker"],
    path: "/market/tracker",
  },
  
  api: {
    title: "Liquid API - HyperLiquid Data API",
    description: "Access HyperLiquid data via REST API. Free tier available. Real-time market data, blockchain info, and ecosystem metrics for developers.",
    keywords: ["crypto API", "blockchain API", "HyperLiquid API", "market data API", "REST API"],
    path: "/products/api",
  },
  
  rpc: {
    title: "Liquid RPC - HyperLiquid RPC Node Service",
    description: "Fast and reliable RPC nodes for HyperLiquid. Connect your dApps and tools with low latency and high availability. Free and paid tiers.",
    keywords: ["RPC node", "blockchain node", "HyperLiquid RPC", "crypto infrastructure", "web3 node"],
    path: "/products/rpc",
  },
  
  publicLists: {
    title: "Public Wallet Lists - Community Curated Lists",
    description: "Browse and copy public wallet lists shared by the HyperLiquid community. Discover interesting addresses and follow top traders.",
    keywords: ["wallet lists", "public lists", "trader lists", "crypto addresses", "portfolio sharing"],
    path: "/market/tracker/public-lists",
  },

  spot: {
    title: "Spot Market - HyperLiquid Token Trading",
    description: "Real-time spot trading data for HyperLiquid tokens. Track prices, volume, liquidity, and market metrics.",
    keywords: ["spot trading", "token prices", "HyperLiquid tokens", "crypto market", "trading volume"],
    path: "/market/spot",
  },

  perp: {
    title: "Perpetuals - HyperLiquid Futures Trading",
    description: "Track HyperLiquid perpetual futures markets. Real-time funding rates, open interest, liquidations, and trading volumes.",
    keywords: ["perpetual futures", "perps", "funding rates", "open interest", "crypto derivatives"],
    path: "/market/perp",
  },

  spotAuction: {
    title: "Spot Auctions - HyperLiquid Token Auctions",
    description: "Monitor ongoing and upcoming spot token auctions on HyperLiquid. Participate in fair launches and token distributions.",
    keywords: ["token auctions", "fair launch", "HyperLiquid auctions", "token distribution", "IDO", "spot auction"],
    path: "/market/spot/auction",
  },
  perpAuction: {
    title: "Perpetual Auctions - HyperLiquid DEXs",
    description: "Monitor HyperLiquid Perpetual DEX auctions. Track new perpetual listings and participate in the ecosystem.",
    keywords: ["perp auctions", "HyperLiquid perps", "new listings", "DEX auctions"],
    path: "/market/perp/auction",
  },

  dashboard: {
    title: "Dashboard - Your HyperLiquid Overview",
    description: "Personalized dashboard for your HyperLiquid activity. Track your portfolio, positions, transactions, and more.",
    keywords: ["crypto dashboard", "portfolio overview", "trading dashboard", "HyperLiquid account"],
    path: "/dashboard",
  },

  publicGoodsPage: {
    title: "Public Goods - Open Source Projects on HyperLiquid",
    description: "Browse open-source public goods projects building on HyperLiquid. Funded by validator fees through EnigmaValidator. Curated by Ryzed (Hyperswap), Imad (Enigma), and Kirby (HypurrCo).",
    keywords: ["public goods", "open source", "HyperLiquid grants", "validator funding", "community projects", "EnigmaValidator"],
    path: "/ecosystem/publicgoods",
  },

  vaults: {
    title: "Vaults Explorer - HyperLiquid Vaults",
    description: "Explore HyperLiquid vaults and their performance. Track TVL, returns, strategies, and vault metrics.",
    keywords: ["crypto vaults", "HyperLiquid vaults", "TVL", "vault strategies", "DeFi vaults"],
    path: "/explorer/vaults",
  },

  validators: {
    title: "Validators - HyperLiquid Network Validators",
    description: "Monitor HyperLiquid validators, staking stats, commission rates, and network security metrics.",
    keywords: ["validators", "staking", "HyperLiquid validators", "proof of stake", "network security"],
    path: "/explorer/validator",
  },

  liquidations: {
    title: "Liquidations - HyperLiquid Liquidation Events",
    description: "Track HyperLiquid liquidation events in real-time. Monitor size, notional value, and market impact of liquidations.",
    keywords: ["liquidations", "HyperLiquid liquidations", "trading liquidations", "perp liquidations", "market data"],
    path: "/explorer/liquidations",
  },
};

