"use client";

import {
  Activity,
  ArrowLeftRight,
  Blocks,
  Coins,
  Cpu,
  Droplets,
  Flame,
  Fingerprint,
  FlaskConical,
  Fuel,
  HardDrive,
  Landmark,
  Layers,
  ListOrdered,
  Network,
  PieChart,
  Receipt,
  Repeat,
  Rocket,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Timer,
  Trophy,
  UserCheck,
  Users,
  Wallet,
  Waypoints,
} from "lucide-react";
import { ShareStudio, type TileGroup, type TileParam } from "@/components/share/ShareStudio";

const WINDOW: TileParam = {
  key: "window",
  label: "Window",
  options: [
    { value: "24h", label: "24h" },
    { value: "7d", label: "7d" },
  ],
};

const SIM_EXAMPLE: TileParam = {
  key: "example",
  label: "Run",
  options: [
    { value: "wrap", label: "Wrap 1 HYPE" },
    { value: "deploy", label: "Deploy a contract" },
  ],
};

/** Elysium tiles: every entry maps to an `/api/tile/elysium-*` route. */
const GROUPS: TileGroup[] = [
  {
    title: "Network",
    tiles: [
      { id: "elysium-pulse", label: "Elysium pulse", desc: "Blocks, txs, senders since genesis", route: "elysium-pulse", icon: Activity },
      { id: "elysium-network", label: "Network specs", desc: "ArbOS, block time, gas, limits, live", route: "elysium-network", icon: Cpu },
      { id: "elysium-settlement", label: "Settlement on HyperEVM", desc: "Batches, blocks per batch, delay", route: "elysium-settlement", icon: Layers },
      { id: "elysium-snapshot", label: "Run a node", desc: "Latest archive snapshot, blocks to sync", route: "elysium-snapshot", icon: HardDrive },
    ],
  },
  {
    title: "Activity",
    tiles: [
      { id: "elysium-activity", label: "Active addresses", desc: "Daily active and new addresses", route: "elysium-activity", icon: Users },
      { id: "elysium-retention", label: "Retention", desc: "New addresses back at D+1 and D+7", route: "elysium-retention", icon: UserCheck },
      { id: "elysium-top-senders", label: "Busiest senders", desc: "Top senders and activity concentration", route: "elysium-top-senders", icon: Send },
      { id: "elysium-fees", label: "Fees paid", desc: "Daily fees in HYPE, failure rate", route: "elysium-fees", icon: Fuel },
      { id: "elysium-health", label: "Spam and failures", desc: "Daily spam and failed shares", route: "elysium-health", icon: ShieldAlert },
      { id: "elysium-tx-mix", label: "Transaction mix", desc: "Calls, transfers, deploys: 24h vs 7d", route: "elysium-tx-mix", icon: PieChart },
      { id: "elysium-address", label: "Busiest address", desc: "Profile of the top sender, 24h", route: "elysium-address", icon: Fingerprint },
    ],
  },
  {
    title: "Builders",
    tiles: [
      { id: "elysium-deployments", label: "Contract deployments", desc: "Contracts and deployers per day", route: "elysium-deployments", icon: Blocks },
      { id: "elysium-top-deployers", label: "Top deployers", desc: "Addresses deploying the most contracts", route: "elysium-top-deployers", icon: Trophy },
      { id: "elysium-trending", label: "New contracts gaining users", desc: "Recent deploys with the most callers", route: "elysium-trending", icon: Rocket },
      { id: "elysium-top-contracts", label: "Most used contracts", desc: "Calls, callers and change", route: "elysium-top-contracts", icon: ListOrdered, params: [WINDOW] },
      { id: "elysium-top-methods", label: "Most called functions", desc: "Function calls by name", route: "elysium-top-methods", icon: Flame, params: [WINDOW] },
    ],
  },
  {
    title: "Build and simulate",
    tiles: [
      { id: "elysium-costs", label: "What it costs", desc: "Live fees: send, wrap, approve, deploy", route: "elysium-costs", icon: Receipt },
      { id: "elysium-simulation", label: "A simulation", desc: "A Simulator run, re-simulated live", route: "elysium-simulation", icon: FlaskConical, params: [SIM_EXAMPLE] },
    ],
  },
  {
    title: "Tokens and DeFi",
    tiles: [
      { id: "elysium-tokens", label: "Token launches", desc: "ERC-20 tokens seen on chain", route: "elysium-tokens", icon: Coins },
      { id: "elysium-new-tokens", label: "New tokens", desc: "Launched in 24h, by transfers", route: "elysium-new-tokens", icon: Sparkles },
      { id: "elysium-top-tokens", label: "Most transferred tokens", desc: "Transfers and holders", route: "elysium-top-tokens", icon: Wallet },
      { id: "elysium-dex", label: "DEX on Elysium", desc: "Pools and swaps", route: "elysium-dex", icon: ArrowLeftRight },
      { id: "elysium-top-pools", label: "Most traded pools", desc: "Swaps and traders, 24h", route: "elysium-top-pools", icon: Repeat },
      { id: "elysium-new-pools", label: "Newest pools", desc: "Pools just created", route: "elysium-new-pools", icon: Droplets },
    ],
  },
  {
    title: "Bridge",
    tiles: [
      { id: "elysium-bridge", label: "Bridge flows", desc: "HYPE in and out, finality", route: "elysium-bridge", icon: Network },
      { id: "elysium-bridged-assets", label: "Bridged assets", desc: "Transfers and amounts by token", route: "elysium-bridged-assets", icon: Waypoints },
      { id: "elysium-top-bridgers", label: "Most active bridgers", desc: "Transfers and HYPE by address", route: "elysium-top-bridgers", icon: Landmark },
      { id: "elysium-finality", label: "Bridge finality", desc: "Deposit and withdrawal times", route: "elysium-finality", icon: Timer },
      { id: "elysium-reserves", label: "Bridge reserves", desc: "Escrow vs supply, fully backed", route: "elysium-reserves", icon: ShieldCheck },
    ],
  },
];

export default function ElysiumSharePage() {
  return (
    <ShareStudio
      groups={GROUPS}
      heading="Share studio"
      subheading="Turn Elysium testnet data into a branded, post-ready image. Simulator runs and address pages have their own image button."
      filenamePrefix="liquid-terminal-elysium"
    />
  );
}
