"use client";

import { Header } from "@/components/Header";
import { TokensSection } from "@/components/market/spot/SpotTokensSection";
import { VolumeCard } from "@/components/market/spot/GlobalStatsCard";
import { TrendingTokensCard } from "@/components/market/spot/TrendingTokensCard";
import { AuctionCard } from "@/components/market/spot/AuctionCard";

export default function Market() {
  return (
    <div className="min-h-screen">
      <Header customTitle="Market Spot" showFees={true} />
      <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-[1920px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 mb-6">
          <VolumeCard />
          <TrendingTokensCard />
          <AuctionCard/>
        </div>
        <TokensSection />
      </div>
    </div>
  );
}
