import { Metadata } from "next";

export const metadata: Metadata = {
  title: "PerpDexs (HIP-3) | Liquid Terminal",
  description: "Explore builder-deployed perpetual DEXs on Hyperliquid. View stats, markets, and OI caps for HIP-3 perp exchanges.",
  keywords: ["Hyperliquid", "HIP-3", "PerpDex", "Perpetuals", "DEX", "DeFi", "Builder"],
  openGraph: {
    title: "PerpDexs (HIP-3) | Liquid Terminal",
    description: "Explore builder-deployed perpetual DEXs on Hyperliquid",
    type: "website",
  },
};

export default function PerpDexLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

