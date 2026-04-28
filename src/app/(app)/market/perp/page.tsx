"use client";

import { AuctionCard } from "@/components/market/auction";
import { GlobalStatsCard, TokensSection, UniversalTokenTable } from "@/components/market/common";

export default function MarketPerp() {
  return (
    <>
      <div className="space-y-2">
        <h1 className="font-inter text-2xl sm:text-3xl font-semibold text-white tracking-tight">
          Perpetuals
        </h1>
        <p className="text-sm text-text-secondary max-w-2xl">
          Perpetual markets on HyperLiquid — global stats, open interest, funding rates, and the full perp directory.
        </p>
      </div>

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