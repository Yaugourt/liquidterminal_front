import {
  BookOpen,
  Code2,
  Coins,
  Database,
  GitBranch,
  Hash,
  Sparkles,
  TrendingUp,
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
  $HYPE: {
    icon: Coins,
    tagline: "Fuel, stake and governance of the network",
    stats: [
      { label: "Total supply", value: "1B HYPE" },
      { label: "Circulating", value: "~334M", hint: "Unlocks through 2027" },
      { label: "Genesis", value: "Nov 29 2024", hint: "Community-first drop" },
    ],
  },
  "HIP Framework": {
    icon: Workflow,
    tagline: "Binding code upgrades that extend the protocol",
    stats: [
      { label: "Live HIPs", value: "3", hint: "More in draft" },
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
