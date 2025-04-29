import { MarketStatsCard } from "../MarketStatsCard";
import { formatNumber } from "@/lib/format";
import { useTopPerpMarkets } from "@/services/market/perp/hooks/usePerpMarket";
import { usePerpGlobalStats } from "@/services/market/perp/hooks/usePerpGlobalStats";
import { Loader2 } from "lucide-react";


export function MarketStatsSectionPerp() {
  const { data: trendingTokens, isLoading: isLoadingTokens, error: tokensError } = useTopPerpMarkets();
  const { stats: globalStats, isLoading: isLoadingStats, error: statsError } = usePerpGlobalStats();

  // Fonction pour formater les nombres sans décimales
  const formatWholeNumber = (value: number): string => {
    return Math.round(value).toLocaleString('en-US');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 md:my-8">
      <MarketStatsCard title="Market Cap">
        {isLoadingStats ? (
          <div className="flex justify-center items-center h-24">
            <Loader2 className="h-8 w-8 animate-spin text-[#83E9FF]" />
          </div>
        ) : statsError ? (
          <div className="flex justify-center items-center h-24">
            <p className="text-red-500">Une erreur est survenue lors du chargement des statistiques</p>
          </div>
        ) : globalStats ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
            <div>
              <p className="text-[#FFFFFF99] text-xs sm:text-sm">Total Open Interest:</p>
              <p className="text-white text-sm sm:text-base">
                ${formatWholeNumber(globalStats.totalOpenInterest)}
              </p>
            </div>
            <div>
              <p className="text-[#FFFFFF99] text-xs sm:text-sm">24h Volume:</p>
              <p className="text-white text-sm sm:text-base">
                ${formatWholeNumber(globalStats.totalVolume24h)}
              </p>
            </div>
            <div>
              <p className="text-[#FFFFFF99] text-xs sm:text-sm">Total Trades 24h:</p>
              <p className="text-white text-sm sm:text-base">
                {formatWholeNumber(globalStats.totalTrades24h)}
              </p>
            </div>
            <div>
              <p className="text-[#FFFFFF99] text-xs sm:text-sm">HLP TVL:</p>
              <p className="text-white text-sm sm:text-base">
                ${formatWholeNumber(globalStats.hlpTvl)}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center h-24">
            <p className="text-[#FFFFFF80]">Aucune donnée disponible</p>
          </div>
        )}
      </MarketStatsCard>

      <MarketStatsCard title="Top Volume Tokens">
        {isLoadingTokens ? (
          <div className="flex justify-center items-center h-24">
            <Loader2 className="h-8 w-8 animate-spin text-[#83E9FF]" />
          </div>
        ) : tokensError ? (
          <div className="flex justify-center items-center h-24">
            <p className="text-red-500">Une erreur est survenue lors du chargement des données</p>
          </div>
        ) : trendingTokens && trendingTokens.length > 0 ? (
          <div className="space-y-2 sm:space-y-3">
            {trendingTokens.map((token) => (
              <div key={token.name} className="grid grid-cols-12 items-center gap-1 sm:gap-2">
                <span className="text-white col-span-5 truncate text-xs sm:text-sm">{token.name}</span>
                <span className="text-white col-span-4 text-right text-xs sm:text-sm">${formatNumber(token.price)}</span>
                <span className={`col-span-3 text-right text-xs sm:text-sm ${token.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {token.change24h >= 0 ? '+' : ''}{token.change24h}%
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center h-24">
            <p className="text-[#FFFFFF80]">Aucun token disponible</p>
          </div>
        )}
      </MarketStatsCard>
    </div>
  );
} 