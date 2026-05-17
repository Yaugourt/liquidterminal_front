"use client";

import { GlobalStatsCard, TokensSection, UniversalTokenTable } from "@/components/market/common";
import { AuctionCard } from "@/components/market/auction";
import { PageHeader } from "@/components/common";

export default function Market() {
  return (
    <>
      <PageHeader
        title="Spot Market"
        description="Spot tokens on HyperLiquid — global market stats, recent auction activity, and the full token directory."
      />

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
