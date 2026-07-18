import { Metadata } from "next";
import { generateMetadata as buildMetadata, decodeEntityParam } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const name = decodeEntityParam(token);
  return buildMetadata({
    title: `${name} Perpetual on Hyperliquid - Funding, Open Interest & Price`,
    description: `Live ${name} perpetual market data on Hyperliquid: mark price, funding rate, open interest, 24h volume and liquidations.`,
    keywords: [`${name} perpetual`, `${name} funding rate`, `${name} Hyperliquid`, "Hyperliquid perpetuals"],
    path: `/market/perp/${encodeURIComponent(name)}`,
  });
}

export default function PerpMarketLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
