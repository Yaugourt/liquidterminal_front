"use client";

import { AuctionCard } from "@/components/market/auction";
import { GlobalStatsCard, TokensSection, UniversalTokenTable } from "@/components/market/common";
import { PageHeader } from "@/components/common";

export default function MarketPerp() {
  return (
    <>
      <PageHeader
        title="Perpetuals"
        description="Perpetual markets on HyperLiquid — global stats, open interest, funding rates, and the full perp directory."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlobalStatsCard market="perp" />
        <div className="h-full">
          <UniversalTokenTable market="perp" mode="compact" />
        </div>
        <AuctionCard marketType="perp" />
      </div>
      <TokensSection market="perp" />
    </>
  );
}