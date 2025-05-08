"use client";

import { useEffect } from "react";
import { usePageTitle } from "@/store/use-page-title";
import {  Header } from "@/components/Header";
import { TokensSection } from "@/components/market/spot/SpotTokensSection";
import { VolumeCard } from "@/components/market/spot/GlobalStatsCard";
import { TrendingTokensCard } from "@/components/market/spot/TrendingTokensCard";
import { AuctionCard } from "@/components/market/spot/AuctionCard";

export default function Market() {
  const { setTitle } = usePageTitle();

  return (
    <div className="min-h-screen">
      <div className="p-4">
        <div className="flex flex-col gap-6">
          < Header customTitle="Market Spot" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4 md:my-8">
          <VolumeCard />
          <TrendingTokensCard />
          <AuctionCard/>
        </div>
        <TokensSection />
      </div>
    </div>
  );
}
