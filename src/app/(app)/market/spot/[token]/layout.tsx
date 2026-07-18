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
    title: `${name} on Hyperliquid - Spot Price, Volume & Marketcap`,
    description: `Live ${name} spot market data on Hyperliquid: price, 24h volume, marketcap, holders and trading activity. Free, real-time.`,
    keywords: [`${name} Hyperliquid`, `${name} price`, `${name} spot`, "Hyperliquid spot market"],
    path: `/market/spot/${encodeURIComponent(name)}`,
  });
}

export default function SpotTokenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
