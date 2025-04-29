import { memo } from "react";
import { MarketStatsCard } from "../MarketStatsCard";
import { useTrendingSpotTokens } from "@/services/market/spot/hooks/useSpotMarket";
import { Loader2 } from "lucide-react";
import { formatNumberWithoutDecimals } from "../../../lib/formatting";

/**
 * Carte affichant les tokens les plus populaires
 */
export const TrendingTokensCard = memo(function TrendingTokensCard() {
  const { data: trendingTokens, isLoading, error } = useTrendingSpotTokens();

  return (
    <MarketStatsCard title="Top Volume Tokens">
      {isLoading ? (
        <div className="flex justify-center items-center h-24">
          <Loader2 className="h-8 w-8 animate-spin text-[#83E9FF]" />
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-24">
          <p className="text-red-500">Une erreur est survenue lors du chargement des données</p>
        </div>
      ) : trendingTokens && trendingTokens.length > 0 ? (
        <div className="space-y-2 sm:space-y-3">
          {trendingTokens.map((token, index) => (
            <div key={token.name} className="grid grid-cols-12 items-center gap-1 sm:gap-2">
              <span className="text-white col-span-5 truncate text-xs sm:text-sm">{token.name}</span>
              <span className="text-white col-span-4 text-right text-xs sm:text-sm">
                ${formatNumberWithoutDecimals(token.price)}
              </span>
              <span className={`col-span-3 text-right text-xs sm:text-sm ${token.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="grid grid-cols-12 items-center gap-1 sm:gap-2">
              <span className="text-white col-span-5 truncate text-xs sm:text-sm">Token {index + 1}</span>
              <span className="text-white col-span-4 text-right text-xs sm:text-sm">--</span>
              <span className="col-span-3 text-right text-xs sm:text-sm text-gray-400">--%</span>
            </div>
          ))}
        </div>
      )}
    </MarketStatsCard>
  );
}); 