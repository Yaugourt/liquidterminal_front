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
    title: `${name} Perpetual on Hyperliquid - Funding, Open Interest & Price`,
    description: `Live ${name} perpetual market data on Hyperliquid: mark price, funding rate, open interest, 24h volume and liquidations.`,
    keywords: [`${name} perpetual`, `${name} funding rate`, `${name} Hyperliquid`, "Hyperliquid perpetuals"],
    path: `/market/perp/${encodeURIComponent(name)}`,
  });
}

export default async function PerpMarketLayout({
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
          { name: "Perpetuals", path: "/market/perp" },
          { name, path: `/market/perp/${encodeURIComponent(name)}` },
        ])}
      />
      {/* See the spot token layout: the client trading view renders no
          heading, so this is the page's only document outline anchor. */}
      <h1 className="sr-only">{name} perpetual market on Hyperliquid</h1>
      {children}
    </>
  );
}
