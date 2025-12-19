"use client";

import { AuctionCard } from "@/components/market/auction";
import { GlobalStatsCard, TokensSection, UniversalTokenTable } from "@/components/market/common";

export default function MarketPerp() {
  return (
    <>
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