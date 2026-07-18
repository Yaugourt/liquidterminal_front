import { Metadata } from "next";
import { generateMetadata, seoConfig } from "@/lib/seo";
import { MarketScopeBar } from "@/components/market/hub/MarketScopeBar";

export const metadata: Metadata = generateMetadata(seoConfig.market);

export default function MarketLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Spot/Perp left the sidebar: this bar is the market-wide navigation,
          persistent on every /market/* page (verdict design). */}
      <MarketScopeBar />
      {children}
    </>
  );
}

