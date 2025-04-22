"use client";

import { useEffect } from "react";
import { usePageTitle } from "@/store/use-page-title";
import { MarketHeader } from "@/components/market/header/MarketHeader";
import { TokensSection } from "@/components/market/tokens/TokensSection";
import { VolumeCard } from "@/components/market/stats/VolumeCard";
import { TrendingTokensCard } from "@/components/market/stats/TrendingTokensCard";
import { AuctionCard } from "@/components/market/stats/AuctionCard";

export default function Market() {
  const { setTitle } = usePageTitle();

  // Définir le titre de la page
  useEffect(() => {
    setTitle("Market Spot");
  }, [setTitle]);

  return (
    <div className="min-h-screen">
      <div className="p-4">
        <MarketHeader />
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
