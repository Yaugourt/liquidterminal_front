import { Metadata } from "next";
import { generateMetadata as buildMetadata, decodeEntityParam } from "@/lib/seo";
import { JsonLd, breadcrumbSchema } from "@/components/JsonLd";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ dex: string; asset: string }>;
}): Promise<Metadata> {
  const { dex, asset } = await params;
  const dexName = decodeEntityParam(dex);
  const ticker = decodeEntityParam(asset).toUpperCase();
  return buildMetadata({
    title: `${ticker} on ${dexName} — HIP-3 Perp Market on Hyperliquid`,
    description: `Live price, order book, open interest, funding and operator details for the ${ticker} HIP-3 perp market deployed by ${dexName} on Hyperliquid.`,
    keywords: [
      `${ticker} HIP-3`,
      `${ticker} ${dexName}`,
      `${dexName} perp dex`,
      "HIP-3 perp market",
      "Hyperliquid builder DEX",
    ],
    path: `/market/perpdex/${encodeURIComponent(dexName)}/${encodeURIComponent(ticker)}`,
  });
}

export default async function Hip3AssetLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ dex: string; asset: string }>;
}) {
  const { dex, asset } = await params;
  const dexName = decodeEntityParam(dex);
  const ticker = decodeEntityParam(asset).toUpperCase();
  return (
    <>
      {/* The venue stays in the breadcrumb even though the route is two flat
          segments — on HIP-3 the operator is part of the market's identity. */}
      <JsonLd
        data={breadcrumbSchema([
          { name: "Liquid Terminal", path: "" },
          { name: "Market", path: "/market" },
          { name: "Perp DEXs", path: "/market/perpdex" },
          { name: dexName, path: `/market/perpdex/${encodeURIComponent(dexName)}` },
          {
            name: ticker,
            path: `/market/perpdex/${encodeURIComponent(dexName)}/${encodeURIComponent(ticker)}`,
          },
        ])}
      />
      {/* The client view renders no heading — this is the only anchor for
          screen readers and for crawlers without JS. */}
      <h1 className="sr-only">
        {ticker} HIP-3 perp market on {dexName} (Hyperliquid)
      </h1>
      {children}
    </>
  );
}
