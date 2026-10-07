"use client";

import {
  Users, TrendingUp, Layers, Trophy, Zap, Activity, Droplet, BarChart3,
  DollarSign, ShieldCheck, Landmark,
} from "lucide-react";
import { ShareStudio, type TileGroup } from "@/components/share/ShareStudio";

const GROUPS: TileGroup[] = [
  {
    title: "Protocol moats",
    tiles: [
      { id: "positioning", label: "Smart money positioning", desc: "Net long/short of the top traders", route: "positioning", icon: Users },
      {
        id: "metric",
        label: "Growth trend",
        desc: "Self-sampled OI, users or fees over time",
        route: "metric",
        icon: TrendingUp,
        params: [
          {
            key: "metric",
            label: "Metric",
            options: [
              { value: "total_oi", label: "Open interest" },
              { value: "active_users_24h", label: "Active users" },
              { value: "total_fees_24h", label: "Protocol fees" },
            ],
          },
        ],
      },
      { id: "hip3", label: "HIP-3 ecosystem", desc: "Builder-deployed perp DEXs", route: "hip3", icon: Layers },
    ],
  },
  {
    title: "Money shots",
    tiles: [
      { id: "biggest-trade", label: "Biggest closed trades", desc: "Largest realized win and loss", route: "biggest-trade", icon: Trophy },
      { id: "liquidations", label: "Liquidations", desc: "24h flush, long vs short", route: "liquidations", icon: Zap },
    ],
  },
  {
    title: "Market snapshots",
    tiles: [
      { id: "market-pulse", label: "Market pulse", desc: "24h volume, traders, fees, OI", route: "market-pulse", icon: Activity },
      { id: "hype", label: "HYPE price", desc: "Spot price and fundamentals", route: "hype", icon: Droplet },
      { id: "volume-10d", label: "Market volume", desc: "Daily traded volume", route: "volume-10d", icon: BarChart3 },
    ],
  },
  {
    title: "Fundamentals",
    tiles: [
      {
        id: "revenue",
        label: "Protocol revenue",
        desc: "Revenue by source, fees and reserve yield",
        route: "revenue",
        icon: DollarSign,
        params: [
          {
            key: "window",
            label: "Window",
            options: [
              { value: "7d", label: "7d" },
              { value: "30d", label: "30d" },
              { value: "90d", label: "90d" },
              { value: "1y", label: "1y" },
              { value: "all", label: "All" },
            ],
          },
        ],
      },
      { id: "validators", label: "Validators", desc: "Staking decentralization", route: "validators", icon: ShieldCheck },
      { id: "stablecoins", label: "Stablecoins", desc: "Stablecoin supply", route: "stablecoins", icon: Landmark },
    ],
  },
];

export default function SharePage() {
  return (
    <ShareStudio
      groups={GROUPS}
      allowCustom
      heading="Share studio"
      subheading="Turn any Hyperliquid metric into a branded, post-ready image."
    />
  );
}
