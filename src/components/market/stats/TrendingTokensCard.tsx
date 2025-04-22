import { memo } from "react";
import { MarketStatsCard } from "../MarketStatsCard";

/**
 * Carte affichant les tokens les plus populaires (placeholder)
 */
export const TrendingTokensCard = memo(function TrendingTokensCard() {
  return (
    <MarketStatsCard title="Top Volume Tokens">
      <div className="space-y-2 sm:space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="grid grid-cols-12 items-center gap-1 sm:gap-2">
            <span className="text-white col-span-5 truncate text-xs sm:text-sm">Token {index + 1}</span>
            <span className="text-white col-span-4 text-right text-xs sm:text-sm">--</span>
            <span className="col-span-3 text-right text-xs sm:text-sm text-gray-400">--%</span>
          </div>
        ))}
      </div>
    </MarketStatsCard>
  );
}); 