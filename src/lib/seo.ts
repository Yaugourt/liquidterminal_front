import { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/site-config";

const siteUrl = SITE_CONFIG.url;

/**
 * Decode a dynamic route param for titles/canonicals. These are tickers,
 * addresses and dex/builder names, so we strip to a conservative charset
 * BEFORE the length cap: this is defence-in-depth behind `JsonLd`'s escaping
 * so a param can never carry markup into a title or a JSON-LD block, even if a
 * future sink forgets to escape. Anything outside the set is dropped, not
 * encoded.
 */
export function decodeEntityParam(raw: string): string {
  let decoded: string;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    decoded = raw;
  }
  return decoded.replace(/[^A-Za-z0-9:_\-. ]/g, "").slice(0, 48).trim();
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
    title: "HIP-4 Research - Exploratory Prediction Markets Documentation",
    description:
      "Reverse-engineered HIP-4 prediction markets documentation: ABI, events, mechanics, bridge and code examples. Not official Hyperliquid documentation.",
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

  // The dashboard holds no personal data — it is the ecosystem overview, split
  // into four scopes. The old "track your portfolio" copy promised an account
  // page that never existed here (that is /profile).
  dashboard: {
    title: "Dashboard - Hyperliquid Ecosystem Overview",
    description: "Live overview of the Hyperliquid ecosystem: network activity, market venues, capital allocation, and the projects building on it.",
    keywords: ["Hyperliquid dashboard", "ecosystem overview", "Hyperliquid metrics", "onchain activity"],
    path: "/dashboard",
  },

  dashboardMarket: {
    title: "Market Overview - Hyperliquid Venues",
    description: "Perpetuals, HIP-3 markets, spot trading, live liquidations and TWAP flow across Hyperliquid, in one recap.",
    keywords: ["Hyperliquid market overview", "perpetuals", "HIP-3", "spot markets", "liquidations"],
    path: "/dashboard/market",
    image: "/og/market.png",
  },

  dashboardCapital: {
    title: "Capital Overview - Hyperliquid Vaults, Validators & Traders",
    description: "Protocol revenue, stablecoin supply, vault and validator allocation, plus the wallets moving size on Hyperliquid.",
    keywords: ["Hyperliquid capital", "protocol revenue", "vaults", "validators", "wallet tracker"],
    path: "/dashboard/capital",
    image: "/og/explorer.png",
  },

  dashboardEcosystem: {
    title: "Ecosystem Overview - Projects & Research on Hyperliquid",
    description: "Protocols building on Hyperliquid ranked by TVL and fees via DefiLlama, alongside the most saved research and read lists.",
    keywords: ["Hyperliquid ecosystem", "DefiLlama", "protocol TVL", "Hyperliquid projects", "research"],
    path: "/dashboard/ecosystem",
    image: "/og/ecosystem.png",
  },

  exportPage: {
    title: "Export Hyperliquid Data as CSV",
    description: "Download Hyperliquid market, chain and capital data as CSV: fills, liquidations, HIP-3 and HIP-4 markets, vaults, validators and more, over the date range you choose.",
    keywords: ["Hyperliquid CSV", "export data", "Hyperliquid API", "onchain data download", "trading data"],
    path: "/export",
  },

  publicGoodsPage: {
    title: "Public Goods - Open Source Projects on Hyperliquid",
    description: "Browse open-source public goods projects building on Hyperliquid. Funded by validator fees through EnigmaValidator. Curated by Ryzed (Hyperswap), Imad (Enigma), and Kirby (HypurrCo).",
    keywords: ["public goods", "open source", "Hyperliquid grants", "validator funding", "community projects", "EnigmaValidator"],
    path: "/ecosystem/publicgoods",
    image: "/og/ecosystem.png",
  },

  fundingPage: {
    title: "Support Liquid Terminal - Sponsors & Donors",
    description:
      "Back the independent data terminal for Hyperliquid. Sponsor the sidebar, partner with us, or donate. 10,000+ visitors over 12 months with next to no paid marketing.",
    keywords: ["sponsor Liquid Terminal", "Hyperliquid sponsor", "donate", "crypto sponsorship", "Hyperliquid data"],
    path: "/funding",
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

  // ── Elysium (Kinetiq L2 testnet): one preset per page so no two pages
  // share a title, description or canonical.
  elysium: {
    title: "Elysium Testnet Explorer - Blocks, Transactions & Bridge",
    description: "Live Elysium testnet data: blocks, transactions, active addresses, HYPE bridge flows and reserves, and the batches settled on HyperEVM.",
    keywords: ["Elysium", "Elysium testnet", "Kinetiq L2", "HyperEVM L2", "Elysium explorer"],
    path: "/elysium",
  },
  elysiumNetwork: {
    title: "Elysium Network Specs - Chain ID, RPC, Gas & ArbOS",
    description: "Elysium testnet network parameters read live: chain ID 99801, RPC endpoints, block time, gas price, ArbOS and Stylus versions, rollup contracts. Add it to your wallet in one click.",
    keywords: ["Elysium RPC", "Elysium chain id", "Elysium testnet network", "add Elysium to wallet", "Elysium gas"],
    path: "/elysium/network",
  },
  elysiumSimulate: {
    title: "Elysium Transaction Simulator - Dry-Run Calls & Deployments",
    description: "Simulate any Elysium call or contract deployment on live testnet state before signing: status, gas, fee, events, revert reason and the address a contract gets. Deploy from your own wallet once the checks pass.",
    keywords: ["Elysium simulator", "simulate transaction", "eth_simulateV1", "deploy contract Elysium", "Elysium gas estimate"],
    path: "/elysium/simulate",
  },
  elysiumDecode: {
    title: "Elysium Contract Decoder - Bytecode, Proxies & Admin Powers",
    description: "Decode any Elysium contract from its bytecode: what it is, its functions, the proxy implementation behind it, who deployed it and the admin powers its owner holds.",
    keywords: ["Elysium contract decoder", "decode bytecode", "proxy implementation", "contract admin", "Elysium contracts"],
    path: "/elysium/decode",
  },
  elysiumContracts: {
    title: "Elysium Contracts - Deployments, Top Deployers & Most Used",
    description: "Contracts on Elysium testnet: daily deployments, the busiest deployers, the most called contracts and functions, and new contracts gaining users.",
    keywords: ["Elysium contracts", "Elysium deployments", "most used contracts", "Elysium deployers"],
    path: "/elysium/contracts",
  },
  elysiumTokens: {
    title: "Elysium Tokens - New Token Launches & Transfers",
    description: "ERC-20 tokens on Elysium testnet: daily launches, the newest tokens, and the most transferred tokens with their holders.",
    keywords: ["Elysium tokens", "Elysium token launches", "ERC-20 Elysium", "new tokens"],
    path: "/elysium/tokens",
  },
  elysiumDex: {
    title: "Elysium DEX - Pools, Swaps & Factories",
    description: "Decentralized exchanges on Elysium testnet: pools created, swaps per day, the most traded pools and the newest ones, by factory.",
    keywords: ["Elysium DEX", "Elysium swaps", "Elysium pools", "Uniswap Elysium"],
    path: "/elysium/dex",
  },
  elysiumBridge: {
    title: "Elysium Bridge - HYPE Flows, Finality & Reserves",
    description: "The Elysium to HyperEVM bridge: daily HYPE in and out, bridged assets, deposit and withdrawal times, the most active bridgers and escrow reserves against supply.",
    keywords: ["Elysium bridge", "bridge HYPE Elysium", "Elysium withdrawal time", "Elysium reserves"],
    path: "/elysium/bridge",
  },
  elysiumUsers: {
    title: "Elysium Users - Active Addresses & Retention",
    description: "Who uses Elysium testnet: daily active and new addresses, D+1 and D+7 retention by cohort, and how concentrated activity is among the busiest senders.",
    keywords: ["Elysium users", "Elysium active addresses", "Elysium retention", "Elysium activity"],
    path: "/elysium/users",
  },
  elysiumEconomics: {
    title: "Elysium Economics - Fees, Spam & Failed Transactions",
    description: "Elysium testnet economics: fees paid in HYPE per day, average fee, and the share of spam and failed transactions.",
    keywords: ["Elysium fees", "Elysium gas fees", "Elysium spam", "failed transactions"],
    path: "/elysium/economics",
  },
  elysiumNode: {
    title: "Run an Elysium Node - Archive Snapshots & Sync",
    description: "Run an Elysium testnet node: the latest archive snapshot and its checksum, the Nitro and Docker commands to restore it, and how many blocks are left to sync.",
    keywords: ["Elysium node", "run Elysium node", "Elysium snapshot", "Arbitrum Nitro node"],
    path: "/elysium/node",
  },
  elysiumShare: {
    title: "Elysium Share Studio - Post-Ready Data Cards",
    description: "Turn Elysium testnet data into branded images ready to post: network, activity, builders, tokens, DEX, bridge and simulation cards, copied in one click.",
    keywords: ["Elysium stats", "Elysium charts", "share Elysium data"],
    path: "/elysium/share",
  },

  // ── HYPE chapters
  hypeFinancials: {
    title: "Hyperliquid Revenue & Income Statement - HYPE Financials",
    description: "Hyperliquid protocol financials: fees and revenue history, revenue by segment, quarterly revenue and an income statement, with how it ranks among crypto protocols.",
    keywords: ["Hyperliquid revenue", "Hyperliquid fees", "Hyperliquid income statement", "HYPE financials"],
    path: "/hype/financials",
  },
  hypeValuation: {
    title: "HYPE Valuation - Price to Fees & Revenue Multiples",
    description: "HYPE valuation multiples from trailing twelve-month fees and revenue: price to fees, price to earnings and earnings yield, on circulating and diluted supply, with their history.",
    keywords: ["HYPE valuation", "HYPE price to earnings", "HYPE multiples", "HYPE FDV"],
    path: "/hype/valuation",
  },
  hypeCapital: {
    title: "HYPE Supply, Buybacks & Burn - Assistance Fund Tracker",
    description: "Where HYPE goes: supply and scarcity, Assistance Fund buybacks, burn, staking, genesis distribution and whale versus retail holdings.",
    keywords: ["HYPE buyback", "Assistance Fund", "HYPE burn", "HYPE supply", "HYPE staking", "HYPE holders"],
    path: "/hype/capital",
  },
  hypeOperations: {
    title: "Hyperliquid Operating Metrics - Fee Run Rate & TVL",
    description: "Hyperliquid operating metrics: fee run rate, total value locked history and the core activity figures behind them.",
    keywords: ["Hyperliquid TVL", "Hyperliquid metrics", "fee run rate", "Hyperliquid operations"],
    path: "/hype/operations",
  },

  // ── Pages that inherited a parent's (or the home page's) title
  marketTrades: {
    title: "Hyperliquid Trade Explorer - Closed Trades & Realized PnL",
    description: "Every closed round-trip trade on Hyperliquid, entry to exit: filter by coin, sort by realized PnL, volume or hold time.",
    keywords: ["Hyperliquid trades", "Hyperliquid PnL", "biggest trades Hyperliquid", "trade explorer"],
    path: "/market/trades",
    image: "/og/market.png",
  },
  builderIntelligence: {
    title: "Hyperliquid Builder Analytics - Users, Revenue & Coins",
    description: "Analytics on users trading through Hyperliquid builder codes: builder revenue, user behavior and coin exposure.",
    keywords: ["Hyperliquid builder analytics", "builder codes users", "builder revenue"],
    path: "/market/builders/intelligence",
    image: "/og/market.png",
  },
  evm: {
    title: "HyperEVM Explorer - Blocks, Transactions & Gas",
    description: "Blocks, transactions and gas on HyperEVM, the general-purpose execution layer secured by the same HyperBFT consensus as HyperCore.",
    keywords: ["HyperEVM", "HyperEVM explorer", "HyperEVM gas", "HyperEVM blocks"],
    path: "/evm",
    image: "/og/explorer.png",
  },
  sharePage: {
    title: "Hyperliquid Share Studio - Post-Ready Data Cards",
    description: "Turn live Hyperliquid data into branded images ready to post: markets, revenue, liquidations, HYPE, validators and stablecoins, or build your own card.",
    keywords: ["Hyperliquid charts", "Hyperliquid stats image", "share Hyperliquid data"],
    path: "/share",
  },
  usdh: {
    title: "USDH Swap",
    description: "Swap USDC into USDH between HyperCore and HyperEVM.",
    path: "/usdh",
    // USDH is being wound down in favour of USDC: do not promote the swap in search.
    noIndex: true,
  },
  wikiTopics: {
    title: "Hyperliquid Topics - Wiki Resources by Subject",
    description: "Hyperliquid resources grouped by topic: trading, HYPE, HIP-3, HIP-4, vaults, DeFi, stablecoins and more, ranked by community saves.",
    keywords: ["Hyperliquid guides", "Hyperliquid topics", "learn Hyperliquid"],
    path: "/wiki/topics",
    image: "/og/wiki.png",
  },
  wikiReadlists: {
    title: "Hyperliquid Read Lists - Curated Reading Paths",
    description: "Curated reading lists on Hyperliquid built by the community: ordered articles, docs and threads to learn a subject end to end.",
    keywords: ["Hyperliquid reading list", "learn Hyperliquid", "Hyperliquid resources"],
    path: "/wiki/readlists",
    image: "/og/wiki.png",
  },
};

