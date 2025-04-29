"use client";

import { useEffect } from "react";
import { usePageTitle } from "@/store/use-page-title";
import { UnifiedHeader } from "@/components/UnifiedHeader";
import { TokensSection } from "@/components/market/spot/SpotTokensSection";
import { VolumeCard } from "@/components/market/spot/GlobalStatsCard";
import { TrendingTokensCard } from "@/components/market/spot/TrendingTokensCard";
import { AuctionCard } from "@/components/market/spot/AuctionCard";

export default function Market() {
  const { setTitle } = usePageTitle();

  // Définir le titre de la page
  useEffect(() => {
    setTitle("Market Spot");
  }, [setTitle]);

  return (
    <div className="min-h-screen">
      <div className="p-4">
        <div className="flex flex-col gap-6">
          <UnifiedHeader customTitle="Market Spot" />
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
