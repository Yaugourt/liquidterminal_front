import { Metadata } from "next";
import { generateMetadata as buildMetadata, decodeEntityParam } from "@/lib/seo";
import { JsonLd, breadcrumbSchema } from "@/components/JsonLd";

/**
 * The coin as the page reads it. An outcome coin keeps its `#` (`#120`):
 * `decodeEntityParam` would drop it and point the canonical, title and
 * breadcrumb at `/market/hip4/120`, a coin that does not exist.
 */
function coinName(param: string): string {
  const name = decodeEntityParam(param);
  try {
    const raw = decodeURIComponent(param);
    if (/^#\d{1,12}$/.test(raw)) return raw;
  } catch {
    // malformed escape: decodeEntityParam already fell back to the raw param
  }
  return name;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ coin: string }>;
}): Promise<Metadata> {
  const { coin } = await params;
  const name = coinName(coin);
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
  const name = coinName(coin);
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
