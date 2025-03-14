import { memo } from "react";
import { MarketStatsCard } from "../MarketStatsCard";
import { AuctionCard } from "./AuctionCard";
import { useAuctionData } from "./useAuctionData";
import { formatNumberWithoutDecimals } from "./utils";
import { Token } from "@/services/markets/types";
import { formatNumber } from "@/lib/format";

interface MarketStatsSectionProps {
  totalMarketCap: number;
  totalSpotVolume: number;
  trendingTokens: Token[];
  totalTokenCount: number;
}

// Composant pour afficher les statistiques générales du marché
const MarketCapCard = memo(function MarketCapCard({ totalMarketCap, totalSpotVolume, totalTokenCount }: Omit<MarketStatsSectionProps, 'trendingTokens'>) {
  return (
    <MarketStatsCard title="Market Cap">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
        <div>
          <p className="text-[#FFFFFF99] text-xs sm:text-sm">Total marketcap:</p>
          <p className="text-white text-sm sm:text-base">${formatNumberWithoutDecimals(totalMarketCap)}</p>
        </div>
        <div>
          <p className="text-[#FFFFFF99] text-xs sm:text-sm">24h spot volume:</p>
          <p className="text-white text-sm sm:text-base">${formatNumberWithoutDecimals(totalSpotVolume)}</p>
        </div>
        <div>
          <p className="text-[#FFFFFF99] text-xs sm:text-sm">Total spot token:</p>
          <p className="text-white text-sm sm:text-base">{formatNumber(totalTokenCount)}</p>
        </div>
        <div>
          <p className="text-[#FFFFFF99] text-xs sm:text-sm">24h perp volume:</p>
          <p className="text-white text-sm sm:text-base">$0</p>
        </div>
      </div>
    </MarketStatsCard>
  );
});

// Composant pour afficher les tokens les plus populaires
const TopVolumeTokensCard = memo(function TopVolumeTokensCard({ trendingTokens }: Pick<MarketStatsSectionProps, 'trendingTokens'>) {
  return (
    <MarketStatsCard title="Top Volume Tokens">
      <div className="space-y-2 sm:space-y-3">
        {trendingTokens.map((token) => (
          <div key={token.name} className="grid grid-cols-12 items-center gap-1 sm:gap-2">
            <span className="text-white col-span-5 truncate text-xs sm:text-sm">{token.name}</span>
            <span className="text-white col-span-4 text-right text-xs sm:text-sm">${formatNumber(token.price)}</span>
            <span
              className={`col-span-3 text-right text-xs sm:text-sm ${token.change24h >= 0 ? "text-[#37983F]" : "text-red-500"}`}
            >
              {token.change24h >= 0 ? "+" : ""}
              {formatNumber(token.change24h)}%
            </span>
          </div>
        ))}
      </div>
    </MarketStatsCard>
  );
});

export const MarketStatsSection = memo(function MarketStatsSection({
  totalMarketCap,
  totalSpotVolume,
  trendingTokens,
  totalTokenCount,
}: MarketStatsSectionProps) {
  // Utiliser le hook personnalisé pour gérer les données d'enchère
  const {
    currentPrice,
    displayPrice,
    progress,
    loading,
    timeUntilStart,
    isUpcoming,
    isActive,
    lastAuction,
    isPurchased,
    nextAuctionPrice,
    nextAuctionTime
  } = useAuctionData();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-4 md:my-8">
      <MarketCapCard 
        totalMarketCap={totalMarketCap}
        totalSpotVolume={totalSpotVolume}
        totalTokenCount={totalTokenCount}
      />

      <TopVolumeTokensCard trendingTokens={trendingTokens} />

      <AuctionCard
        currentPrice={currentPrice}
        displayPrice={displayPrice}
        progress={progress}
        isActive={isActive}
        isUpcoming={isUpcoming}
        timeUntilStart={timeUntilStart}
        lastAuction={lastAuction}
        loading={loading}
        isPurchased={isPurchased}
        nextAuctionPrice={nextAuctionPrice}
        nextAuctionTime={nextAuctionTime}
      />
    </div>
  );
});
