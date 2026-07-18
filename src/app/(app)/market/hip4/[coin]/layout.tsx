import { Metadata } from "next";
import { generateMetadata as buildMetadata, decodeEntityParam } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ coin: string }>;
}): Promise<Metadata> {
  const { coin } = await params;
  const name = decodeEntityParam(coin);
  return buildMetadata({
    title: `${name} Prediction Market on Hyperliquid - HIP-4 Odds & Volume`,
    description: `Live HIP-4 prediction market ${name} on Hyperliquid: outcome odds, prices, trading volume, open interest and fills.`,
    keywords: [`${name} prediction market`, "HIP-4", "Hyperliquid predictions", "outcome odds"],
    path: `/market/hip4/${encodeURIComponent(name)}`,
  });
}

export default function Hip4CoinLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
