import { Metadata } from "next";
import { generateMetadata as buildMetadata } from "@/lib/seo";
import { JsonLd, breadcrumbSchema } from "@/components/JsonLd";

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ address: string }>;
}): Promise<Metadata> {
  const { address } = await params;
  return buildMetadata({
    title: `Vault ${address.slice(0, 8)}… - Hyperliquid Vaults`,
    description: `Detailed analytics for Hyperliquid vault ${address}. TVL history, equity snapshots, ledger, and sub-vault breakdown.`,
    keywords: ["Hyperliquid vault", "vault analytics", "DeFi vault", "TVL", "vault detail"],
    path: `/explorer/vaults/${address}`,
  });
}

// ISR: revalidate every 2 minutes — vault data updates moderately
export const revalidate = 120;

export default async function VaultDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ address: string }>;
}) {
  const { address } = await params;
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Liquid Terminal", path: "" },
          { name: "Explorer", path: "/explorer" },
          { name: "Vaults", path: "/explorer/vaults" },
          { name: `Vault ${address.slice(0, 8)}…`, path: `/explorer/vaults/${address}` },
        ])}
      />
      {children}
    </>
  );
}
