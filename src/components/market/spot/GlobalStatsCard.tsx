import { memo } from "react";
import { MarketStatsCard } from "../MarketStatsCard";
import { formatNumberWithoutDecimals, formatFullNumberWithCurrency } from "../../../lib/formatting";
import { useSpotGlobalStats } from "@/services/market/spot/hooks/useSpotGlobalStats";
import { useFeesStats } from "@/services/market/fees/hooks/useFeesStats";
import { Loader2, BarChart2, ChevronRight, Clock, CalendarDays } from "lucide-react";

/**
 * Carte affichant le volume sur 24h et d'autres statistiques du marché
 */
export const VolumeCard = memo(function VolumeCard() {
  const { stats, isLoading, error } = useSpotGlobalStats();
  const { feesStats, isLoading: feesLoading } = useFeesStats();

  return (
    <MarketStatsCard 
      title="24h Volume"
      headerRight={
        isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-[#83E9FF]" />
        ) : stats ? (
          <p className="text-[#83E9FF] text-lg font-semibold">
            {formatFullNumberWithCurrency(stats.totalVolume24h)}
          </p>
        ) : (
          <p className="text-[#83E9FF] text-lg font-semibold">-</p>
        )
      }
    >
      {isLoading || feesLoading ? (
        <div className="flex justify-center items-center h-24">
          <Loader2 className="h-8 w-8 animate-spin text-[#83E9FF]" />
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-24">
          <p className="text-red-500">Une erreur est survenue lors du chargement des données</p>
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
          <div className="group transition-all hover:bg-[#83E9FF08] rounded-lg p-2 cursor-pointer flex flex-col">
            <div className="flex items-center mb-1">
              <CalendarDays size={14} className="text-[#83E9FF80] mr-1.5" />
              <p className="text-[#FFFFFF99] text-xs sm:text-sm font-medium">Daily Spot Fees</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-white text-sm sm:text-base font-semibold">
                {feesStats ? formatFullNumberWithCurrency(feesStats.dailySpotFees) : '$0'}
              </p>
              <ChevronRight size={14} className="text-[#83E9FF40] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          
          <div className="group transition-all hover:bg-[#83E9FF08] rounded-lg p-2 cursor-pointer flex flex-col">
            <div className="flex items-center mb-1">
              <Clock size={14} className="text-[#83E9FF80] mr-1.5" />
              <p className="text-[#FFFFFF99] text-xs sm:text-sm font-medium">Hourly Spot Fees</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-white text-sm sm:text-base font-semibold">
                {feesStats ? formatFullNumberWithCurrency(feesStats.hourlySpotFees) : '$0'}
              </p>
              <ChevronRight size={14} className="text-[#83E9FF40] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          
          <div className="group transition-all hover:bg-[#83E9FF08] rounded-lg p-2 cursor-pointer flex flex-col">
            <div className="flex items-center mb-1">
              <BarChart2 size={14} className="text-[#83E9FF80] mr-1.5" />
              <p className="text-[#FFFFFF99] text-xs sm:text-sm font-medium">Total USDC</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-white text-sm sm:text-base font-semibold">
                {formatFullNumberWithCurrency(stats.totalSpotUSDC)}
              </p>
              <ChevronRight size={14} className="text-[#83E9FF40] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          
          <div className="group transition-all hover:bg-[#83E9FF08] rounded-lg p-2 cursor-pointer flex flex-col">
            <div className="flex items-center mb-1">
              <BarChart2 size={14} className="text-[#83E9FF80] mr-1.5" />
              <p className="text-[#FFFFFF99] text-xs sm:text-sm font-medium">Total HIP2</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-white text-sm sm:text-base font-semibold">
                {formatFullNumberWithCurrency(stats.totalHIP2)}
              </p>
              <ChevronRight size={14} className="text-[#83E9FF40] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
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