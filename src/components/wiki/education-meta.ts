import {
  Banknote,
  BookOpen,
  Boxes,
  CandlestickChart,
  Code2,
  Coins,
  Database,
  Flame,
  Gavel,
  GitBranch,
  Hash,
  Landmark,
  ListOrdered,
  Lock,
  Package,
  Percent,
  PieChart,
  PiggyBank,
  Scale,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Vault,
  Waves,
  Workflow,
  Zap,
  type LucideIcon,
} from "lucide-react";

/**
 * Per-chapter visual metadata: icon, editorial tagline and key facts.
 *
 * Keyed by chapter title (must match `public/hyperliquid-education.json`).
 * `EducationContent` falls back to `DEFAULT_META` / `DEFAULT_SUB_META` when a
 * title is not found, so adding a new chapter to the JSON renders cleanly
 * without requiring a code change here.
 */

export interface StatItem {
  label: string;
  value: string;
  hint?: string;
}

export interface SubChapterMeta {
  icon: LucideIcon;
  stats: StatItem[];
}

export interface ChapterMeta {
  icon: LucideIcon;
  tagline: string;
  stats: StatItem[];
  subChapters?: Record<string, SubChapterMeta>;
}

export const CHAPTER_META: Record<string, ChapterMeta> = {
  Introduction: {
    icon: Sparkles,
    tagline: "A sovereign L1 for fully on-chain finance",
    stats: [
      { label: "Founded", value: "2022", hint: "Self-funded, no VC" },
      { label: "Mainnet", value: "Feb 2023", hint: "Live since launch" },
      { label: "Architecture", value: "3-layer", hint: "BFT · Core · EVM" },
    ],
  },
  HyperBFT: {
    icon: Zap,
    tagline: "Trader-grade consensus, built for latency",
    stats: [
      { label: "Median latency", value: "~0.2s", hint: "End-to-end" },
      { label: "Throughput", value: "200k OPS", hint: "1M+ architectural" },
      { label: "Finality", value: "1 block", hint: "Deterministic · no reorg" },
    ],
  },
  HyperCore: {
    icon: Database,
    tagline: "Fully on-chain order books, zero gas to trade",
    stats: [
      { label: "Trading fees", value: "Gas-free", hint: "For end users" },
      { label: "Matching", value: "On-chain CLOB", hint: "Price-time priority" },
      { label: "Markets", value: "Perp + Spot", hint: "Unified cross-margin" },
    ],
  },
  HyperEVM: {
    icon: Code2,
    tagline: "Ethereum-compatible, HyperCore-aware",
    stats: [
      { label: "Small blocks", value: "~2s", hint: "2M gas · fast trades" },
      { label: "Big blocks", value: "~60s", hint: "30M gas · deployments" },
      { label: "State", value: "Unified", hint: "Same as HyperCore" },
    ],
  },
  "HyperCore ↔ HyperEVM": {
    icon: GitBranch,
    tagline: "Where DeFi meets a native CLOB",
    stats: [
      { label: "Read Precompiles", value: "0x…0800", hint: "No external oracle" },
      { label: "CoreWriter", value: "0x3333…3333", hint: "EVM → HyperCore" },
      { label: "Atomicity", value: "Single block", hint: "Cross-layer txs" },
    ],
  },
  "Trading & Risk": {
    icon: CandlestickChart,
    tagline: "The execution surface, and what happens when it turns",
    stats: [
      { label: "Order types", value: "6", hint: "Market → TWAP" },
      { label: "Margin modes", value: "Cross · Isolated" },
      { label: "Backstop", value: "HLP → ADL", hint: "No socialized loss" },
    ],
    subChapters: {
      "order-types": {
        icon: ListOrdered,
        stats: [
          { label: "TWAP slices", value: "30s", hint: "3% max slippage" },
          { label: "Maker flag", value: "ALO", hint: "Post-only" },
          { label: "Placement", value: "Gas-free" },
        ],
      },
      "margin-modes": {
        icon: Scale,
        stats: [
          { label: "Cross", value: "Whole account", hint: "Capital efficient" },
          { label: "Isolated", value: "Capped", hint: "Loss limited to allocation" },
          { label: "Max leverage", value: "40x BTC · 25x ETH" },
        ],
      },
      "liquidations-adl": {
        icon: ShieldAlert,
        stats: [
          { label: "First backstop", value: "HLP" },
          { label: "Last resort", value: "ADL", hint: "At bankruptcy price" },
          { label: "Bad debt", value: "None", hint: "By construction" },
        ],
      },
      "funding-and-fees": {
        icon: Percent,
        stats: [
          { label: "Funding", value: "Continuous", hint: "Perp ↔ index tether" },
          { label: "Fees → AF", value: "Up to 99%", hint: "Buyback and burn" },
          { label: "Builder codes", value: "Fee share", hint: "For frontends" },
        ],
      },
    },
  },
  "Vaults & HLP": {
    icon: Vault,
    tagline: "Delegating capital to a strategy, transparently",
    stats: [
      { label: "HLP role", value: "Market maker", hint: "+ liquidation backstop" },
      { label: "Leader share", value: "10%", hint: "Of vault profits" },
      { label: "Positions", value: "On-chain", hint: "Auditable live" },
    ],
    subChapters: {
      hlp: {
        icon: PiggyBank,
        stats: [
          { label: "Deposit", value: "USDC" },
          { label: "Yield from", value: "3 streams", hint: "Spread · fees · liquidations" },
          { label: "Risk", value: "Real", hint: "$4M drawdown, Mar 2025" },
        ],
      },
      "user-vaults": {
        icon: Users,
        stats: [
          { label: "Open to", value: "Anyone" },
          { label: "Leader skin", value: "Required", hint: "Own capital in vault" },
          { label: "Transparency", value: "Per-fill" },
        ],
      },
    },
  },
  "Spot & Unit": {
    icon: Boxes,
    tagline: "Real assets on the same order book",
    stats: [
      { label: "Listing", value: "Dutch auction", hint: "31h · paid in HYPE" },
      { label: "Unit assets", value: "BTC · ETH · SOL" },
      { label: "Model", value: "Lock-and-mint", hint: "Guardian network" },
    ],
    subChapters: {
      "spot-and-auctions": {
        icon: Gavel,
        stats: [
          { label: "Auction", value: "31h Dutch" },
          { label: "Paid in", value: "HYPE" },
          { label: "Gatekeeper", value: "None", hint: "Price, not permission" },
        ],
      },
      unit: {
        icon: Package,
        stats: [
          { label: "Protocol", value: "hyperunit.xyz" },
          { label: "Mechanism", value: "Lock-and-mint" },
          { label: "Result", value: "Native spot", hint: "Not a wrapped IOU" },
        ],
      },
    },
  },
  "Stablecoins & USDH": {
    icon: Banknote,
    tagline: "Collateral that pays rent to the network",
    stats: [
      { label: "Ticker awarded by", value: "Governance", hint: "Validator vote" },
      { label: "Issuer", value: "Native Markets" },
      { label: "AQA stake", value: "1M HYPE" },
    ],
    subChapters: {
      usdh: {
        icon: Landmark,
        stats: [
          { label: "Decided by", value: "Validator vote" },
          { label: "Winner", value: "Native Markets" },
          { label: "Reserve yield", value: "To ecosystem" },
        ],
      },
      "aligned-quote-assets": {
        icon: Lock,
        stats: [
          { label: "Stake", value: "1M HYPE" },
          { label: "In exchange", value: "Fee advantages" },
          { label: "Competing", value: "USDC · USDT0 · USDH · USDe" },
        ],
      },
    },
  },
  $HYPE: {
    icon: Coins,
    tagline: "Fuel, stake and governance of the network",
    stats: [
      { label: "Total supply", value: "1B HYPE" },
      { label: "Community side", value: "~70%", hint: "No VC allocation" },
      { label: "Genesis", value: "Nov 29 2024", hint: "Community-first drop" },
    ],
    subChapters: {
      distribution: {
        icon: PieChart,
        stats: [
          { label: "Genesis airdrop", value: "31%" },
          { label: "Future emissions", value: "38.9%" },
          { label: "Contributors", value: "23.8%", hint: "Unlocks to 2027" },
        ],
      },
      "assistance-fund": {
        icon: Flame,
        stats: [
          { label: "Fees routed", value: "Up to 99%" },
          { label: "Action", value: "Buy and burn" },
          { label: "Net supply", value: "Deflationary", hint: "While volume holds" },
        ],
      },
      "staking-and-lsts": {
        icon: Lock,
        stats: [
          { label: "Secures", value: "Block production" },
          { label: "Liquid staking", value: "kHYPE", hint: "Kinetiq" },
          { label: "Added risk", value: "Contract + depeg" },
        ],
      },
    },
  },
  "HIP Framework": {
    icon: Workflow,
    tagline: "Binding code upgrades that extend the protocol",
    stats: [
      { label: "Live HIPs", value: "4", hint: "HIP-5 / HIP-6 emerging" },
      { label: "Stake to deploy perp", value: "500k HYPE", hint: "HIP-3 builder" },
      { label: "HIP-3 volume", value: "$25B+", hint: "First 3 months" },
    ],
    subChapters: {
      "hip-1": {
        icon: Hash,
        stats: [
          { label: "Auction cycle", value: "31h", hint: "Dutch · HYPE gas fee" },
          { label: "EVM mirror", value: "ERC-20", hint: "Native ↔ HyperEVM" },
          { label: "Bridges", value: "LZ · CCIP · Wormhole" },
        ],
      },
      "hip-2": {
        icon: Waves,
        stats: [
          { label: "Spread", value: "0.3%", hint: "Guaranteed on-chain" },
          { label: "Refresh", value: "3s", hint: "Every block cycle" },
          { label: "Secured by", value: "Consensus", hint: "Not a vault" },
        ],
      },
      "hip-3": {
        icon: TrendingUp,
        stats: [
          { label: "Stake", value: "500k HYPE", hint: "~$15–20M" },
          { label: "Builder fees", value: "50%", hint: "Per deployed market" },
          { label: "Open interest", value: "$1B+", hint: "Within 3 months" },
        ],
      },
      "hip-4": {
        icon: Target,
        stats: [
          { label: "Primitive", value: "Outcome markets" },
          { label: "Price is", value: "A probability" },
          { label: "Runs on", value: "HyperCore", hint: "Same CLOB + margin" },
        ],
      },
    },
  },
};

export const DEFAULT_META: ChapterMeta = {
  icon: BookOpen,
  tagline: "Hyperliquid fundamentals",
  stats: [],
};

export const DEFAULT_SUB_META: SubChapterMeta = {
  icon: BookOpen,
  stats: [],
};
