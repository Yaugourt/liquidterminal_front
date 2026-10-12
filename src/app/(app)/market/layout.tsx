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
      {/* Market family tabs, mirrored from the sidebar; hidden on the
          non-market pages that share the /market prefix. */}
      <MarketScopeBar />
      {children}
    </>
  );
}

