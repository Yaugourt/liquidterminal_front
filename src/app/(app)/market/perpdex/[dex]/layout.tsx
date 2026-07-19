import { Metadata } from "next";
import { generateMetadata as buildMetadata, decodeEntityParam } from "@/lib/seo";

/**
 * Shared metadata for the venue subtree. The heading and breadcrumb live in
 * `(overview)/layout.tsx` so they apply to the venue page alone — `[asset]`
 * publishes its own, deeper breadcrumb and its own `<h1>`.
 */
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

export default function PerpDexDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
