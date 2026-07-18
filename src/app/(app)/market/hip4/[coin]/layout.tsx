import { Metadata } from "next";
import { generateMetadata as buildMetadata, decodeEntityParam } from "@/lib/seo";
import { JsonLd, breadcrumbSchema } from "@/components/JsonLd";

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

export default async function Hip4CoinLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ coin: string }>;
}) {
  const { coin } = await params;
  const name = decodeEntityParam(coin);
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Liquid Terminal", path: "" },
          { name: "Market", path: "/market" },
          { name: "Prediction markets", path: "/market/hip4" },
          { name, path: `/market/hip4/${encodeURIComponent(name)}` },
        ])}
      />
      <h1 className="sr-only">{name} prediction market on Hyperliquid (HIP-4)</h1>
      {children}
    </>
  );
}
