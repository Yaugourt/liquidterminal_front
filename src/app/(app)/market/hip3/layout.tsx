import { Metadata } from "next";

export const metadata: Metadata = {
  title: "HIP-3 (indexer) | Liquid Terminal",
  description:
    "HIP-3 builder DEX metrics from the LiquidTerminal indexer: overview, DEXs, markets, trading activity, and charts.",
  keywords: ["Hyperliquid", "HIP-3", "Indexer", "HypeDexer", "Perpetuals", "DEX"],
  openGraph: {
    title: "HIP-3 (indexer) | Liquid Terminal",
    description: "Builder DEX metrics from the LiquidTerminal indexer.",
    type: "website",
  },
};

export default function Hip3Layout({ children }: { children: React.ReactNode }) {
  return children;
}
