import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Boxes,
  CandlestickChart,
  LayoutDashboard,
  Search,
  Settings2,
  Sparkles,
} from "lucide-react";

/**
 * Declarative definition of the welcome tour steps.
 * The visual for each step is resolved by id in `OnboardingVisual`
 * (abstract CSS illustrations — no binary assets).
 */
export interface OnboardingStep {
  /** Stable identifier, also used to pick the step visual. */
  id:
    | "welcome"
    | "dashboard"
    | "market"
    | "explorer"
    | "wiki"
    | "search"
    | "setup";
  /** Small uppercase label rendered above the title. */
  kicker: string;
  title: string;
  description: string;
  icon: LucideIcon;
  /** Optional short feature bullets rendered as pills. */
  bullets?: string[];
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    kicker: "Welcome",
    title: "Liquid Terminal",
    description:
      "Your Hyperliquid data terminal. Real-time markets, on-chain exploration and curated knowledge: free, in one place.",
    icon: Sparkles,
  },
  {
    id: "dashboard",
    kicker: "Protocol pulse",
    title: "Dashboard",
    description:
      "The whole ecosystem at a glance: network KPIs, fees and revenue, liquidations, auctions and the day's top movers.",
    icon: LayoutDashboard,
    bullets: ["Protocol pulse", "Fees & revenue", "Top movers"],
  },
  {
    id: "market",
    kicker: "Markets",
    title: "Market",
    description:
      "Spot and perp directories with live stats, deploy auctions, HIP-3 DEXs, builders analytics and a wallet tracker.",
    icon: CandlestickChart,
    bullets: ["Spot & perp directories", "Auctions", "Wallet tracker"],
  },
  {
    id: "explorer",
    kicker: "On-chain",
    title: "Explorer",
    description:
      "Follow HyperCore live: blocks, transactions, validators, vaults, liquidations and bridge flows as they happen.",
    icon: Boxes,
    bullets: ["Blocks & txs", "Validators", "Vaults"],
  },
  {
    id: "wiki",
    kicker: "Learn",
    title: "Wiki",
    description:
      "Curated educational resources on everything Hyperliquid. Save what matters into read lists and share them.",
    icon: BookOpen,
    bullets: ["Curated resources", "Read lists"],
  },
  {
    id: "search",
    kicker: "Flagship",
    title: "Search everything",
    description:
      "Press ⌘K (or Ctrl+K) anywhere to jump to any token, vault, validator, address, transaction or wiki page in one keystroke.",
    icon: Search,
    bullets: ["Tokens & vaults", "Addresses & txs", "Pages & wiki"],
  },
  {
    id: "setup",
    kicker: "You're set",
    title: "Set it up your way",
    description:
      "Customize the sidebar to match your workflow, and connect your wallet to unlock tracking, read lists and XP.",
    icon: Settings2,
    bullets: ["Customize sidebar", "Connect wallet"],
  },
];
