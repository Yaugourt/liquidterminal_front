import { Metadata } from "next";
import { generateMetadata as buildMetadata, decodeEntityParam } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ address: string }>;
}): Promise<Metadata> {
  const { address } = await params;
  const builder = decodeEntityParam(address);
  return buildMetadata({
    title: `Builder ${builder.slice(0, 8)}… - Hyperliquid Order Flow & Fees`,
    description: `Volume, builder fees and top users routed through Hyperliquid builder ${builder}.`,
    keywords: ["Hyperliquid builder", "builder fees", "order flow", "referral stats"],
    path: `/market/builders/${encodeURIComponent(builder)}`,
  });
}

export default function BuilderDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
