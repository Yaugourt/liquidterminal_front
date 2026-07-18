import { Metadata } from "next";
import { generateMetadata as buildMetadata, decodeEntityParam } from "@/lib/seo";
import { JsonLd, breadcrumbSchema } from "@/components/JsonLd";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ dex: string }>;
}): Promise<Metadata> {
  const { dex } = await params;
  const name = decodeEntityParam(dex);
  return buildMetadata({
    title: `${name} - Hyperliquid Perp DEX (HIP-3) Stats`,
    description: `Stats for the ${name} builder perp DEX on Hyperliquid (HIP-3): markets, volume, open interest, fees and oracle activity.`,
    keywords: [`${name} perp dex`, `${name} Hyperliquid`, "HIP-3", "Hyperliquid builder DEX"],
    path: `/market/perpdex/${encodeURIComponent(name)}`,
  });
}

export default async function PerpDexDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ dex: string }>;
}) {
  const { dex } = await params;
  const name = decodeEntityParam(dex);
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Liquid Terminal", path: "" },
          { name: "Market", path: "/market" },
          { name: "Perp DEXs", path: "/market/perpdex" },
          { name, path: `/market/perpdex/${encodeURIComponent(name)}` },
        ])}
      />
      <h1 className="sr-only">{name} perp DEX on Hyperliquid (HIP-3)</h1>
      {children}
    </>
  );
}
