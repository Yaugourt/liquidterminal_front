import { Metadata } from "next";
import { generateMetadata as buildMetadata, decodeEntityParam } from "@/lib/seo";
import { JsonLd, breadcrumbSchema } from "@/components/JsonLd";

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

export default async function SpotTokenLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const name = decodeEntityParam(token);
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Liquid Terminal", path: "" },
          { name: "Market", path: "/market" },
          { name: "Spot", path: "/market/spot" },
          { name, path: `/market/spot/${encodeURIComponent(name)}` },
        ])}
      />
      {children}
    </>
  );
}
