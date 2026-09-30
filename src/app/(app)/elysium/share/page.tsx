"use client";

import { Activity, ArrowLeftRight, Blocks, Coins, Fuel, Network, Users } from "lucide-react";
import { ShareStudio, type TileGroup } from "@/components/share/ShareStudio";

/** Elysium tiles: every entry maps to an `/api/tile/elysium-*` route. */
const GROUPS: TileGroup[] = [
  {
    title: "Network",
    tiles: [
      { id: "elysium-pulse", label: "Elysium pulse", desc: "Blocks, txs, senders since genesis", route: "elysium-pulse", icon: Activity },
      { id: "elysium-activity", label: "Active addresses", desc: "Daily active and new addresses", route: "elysium-activity", icon: Users },
      { id: "elysium-fees", label: "Fees paid", desc: "Daily fees in HYPE, failure rate", route: "elysium-fees", icon: Fuel },
    ],
  },
  {
    title: "Builders",
    tiles: [
      { id: "elysium-deployments", label: "Contract deployments", desc: "Contracts and deployers per day", route: "elysium-deployments", icon: Blocks },
      { id: "elysium-tokens", label: "Token launches", desc: "ERC-20 tokens seen on chain", route: "elysium-tokens", icon: Coins },
      { id: "elysium-dex", label: "DEX on Elysium", desc: "Pools and swaps", route: "elysium-dex", icon: ArrowLeftRight },
    ],
  },
  {
    title: "Bridge",
    tiles: [{ id: "elysium-bridge", label: "Bridge flows", desc: "HYPE in and out, finality", route: "elysium-bridge", icon: Network }],
  },
];

export default function ElysiumSharePage() {
  return (
    <ShareStudio
      groups={GROUPS}
      heading="Share studio"
      subheading="Turn Elysium testnet data into a branded, post-ready image."
      filenamePrefix="liquid-terminal-elysium"
    />
  );
}
