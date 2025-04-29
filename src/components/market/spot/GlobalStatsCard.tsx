import { memo } from "react";
import { MarketStatsCard } from "../MarketStatsCard";
import { formatNumberWithoutDecimals } from "../../../lib/formatting";
import { useSpotGlobalStats } from "@/services/market/spot/hooks/useSpotGlobalStats";
import { Loader2 } from "lucide-react";

/**
 * Carte affichant le volume sur 24h et d'autres statistiques du marché
 */
export const VolumeCard = memo(function VolumeCard() {
  const { stats, isLoading, error } = useSpotGlobalStats();

  return (
    <MarketStatsCard 
      title="24h Volume"
      headerRight={
        isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-[#83E9FF]" />
        ) : stats ? (
          <p className="text-[#83E9FF] text-lg font-semibold">
            ${formatNumberWithoutDecimals(stats.totalVolume24h)}
          </p>
        ) : (
          <p className="text-[#83E9FF] text-lg font-semibold">-</p>
        )
      }
    >
      {isLoading ? (
        <div className="flex justify-center items-center h-24">
          <Loader2 className="h-8 w-8 animate-spin text-[#83E9FF]" />
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-24">
          <p className="text-red-500">Une erreur est survenue lors du chargement des données</p>
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
          <div>
            <p className="text-[#FFFFFF99] text-xs sm:text-sm">Total Market Cap:</p>
            <p className="text-white text-sm sm:text-base">
              ${formatNumberWithoutDecimals(stats.totalMarketCap)}
            </p>
          </div>
          <div>
            <p className="text-[#FFFFFF99] text-xs sm:text-sm">Total Pairs:</p>
            <p className="text-white text-sm sm:text-base">
              {stats.totalPairs}
            </p>
          </div>
          <div>
            <p className="text-[#FFFFFF99] text-xs sm:text-sm">Total USDC:</p>
            <p className="text-white text-sm sm:text-base">
              ${formatNumberWithoutDecimals(stats.totalSpotUSDC)}
            </p>
          </div>
          <div>
            <p className="text-[#FFFFFF99] text-xs sm:text-sm">Total HIP2:</p>
            <p className="text-white text-sm sm:text-base">
              ${formatNumberWithoutDecimals(stats.totalHIP2)}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center h-24">
          <p className="text-[#FFFFFF99]">Aucune donnée disponible</p>
        </div>
      )}
    </MarketStatsCard>
  );
}); 