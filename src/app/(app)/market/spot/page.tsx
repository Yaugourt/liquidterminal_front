"use client";

import { GlobalStatsCard, TokensSection, UniversalTokenTable } from "@/components/market/common";
import { AuctionCard } from "@/components/market/auction";

export default function Market() {
  return (
    <>
      <div className="space-y-2">
        <h1 className="font-inter text-2xl sm:text-3xl font-semibold text-white tracking-tight">
          Spot Market
        </h1>
        <p className="text-sm text-text-secondary max-w-2xl">
          Spot tokens on HyperLiquid — global market stats, recent auction activity, and the full token directory.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
        <GlobalStatsCard market="spot" />
        <div className="h-full">
          <UniversalTokenTable market="spot" mode="compact" />
        </div>
        <AuctionCard marketType="spot" />
      </div>
      <TokensSection market="spot" />
    </>
  );
}
