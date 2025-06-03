import { memo } from "react";
import { Card } from "@/components/ui/card";
import { formatNumber } from "@/lib/formatting";
import { useSpotGlobalStats } from "@/services/market/spot/hooks/useSpotGlobalStats";
import { useFeesStats } from "@/services/market/fees/hooks/useFeesStats";
import { Loader2, BarChart2, Clock, CalendarDays, Wallet } from "lucide-react";
import { useNumberFormat } from "@/store/number-format.store";

/**
 * Carte affichant le volume sur 24h et d'autres statistiques du marché
 */
export const VolumeCard = memo(function VolumeCard() {
  const { stats, isLoading, error } = useSpotGlobalStats();
  const { feesStats, isLoading: feesLoading } = useFeesStats();
  const { format } = useNumberFormat();

  if (error) {
    return (
      <Card className="bg-[#0A1F32]/80 backdrop-blur-sm border border-[#1E3851] p-5 rounded-xl shadow-md hover:border-[#83E9FF40] transition-all">
        <div className="flex justify-center items-center h-24">
          <p className="text-red-500">Une erreur est survenue lors du chargement des données</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-[#0A1F32]/80 backdrop-blur-sm border border-[#1E3851] p-5 rounded-xl shadow-md hover:border-[#83E9FF40] transition-all">
      <div className="flex justify-between items-start mb-5">
        <h3 className="text-[15px] text-white font-medium font-serif">24h Volume</h3>
        {isLoading ? (
          <Loader2 className="w-4 h-4 text-[#83E9FF] animate-spin" />
        ) : (
          <span className="text-[#83E9FF] text-[15px] font-medium">
            {stats ? formatNumber(stats.totalVolume24h, format) : '-'}
          </span>
        )}
      </div>

      {isLoading || feesLoading ? (
        <div className="flex justify-center items-center p-4">
          <Loader2 className="w-5 h-5 text-[#83E9FF] animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          <div>
            <div className="text-[#FFFFFF80] text-xs mb-1 tracking-wide flex items-center">
              <CalendarDays className="h-3.5 w-3.5 text-[#83E9FF80] mr-1.5" />
              Daily Spot Fees
            </div>
            <div className="text-white text-sm font-medium">
              {feesStats ? formatNumber(feesStats.dailySpotFees, format) : '$0'}
            </div>
          </div>

          <div>
            <div className="text-[#FFFFFF80] text-xs mb-1 tracking-wide flex items-center">
              <Clock className="h-3.5 w-3.5 text-[#83E9FF80] mr-1.5" />
              Hourly Spot Fees
            </div>
            <div className="text-white text-sm font-medium">
              {feesStats ? formatNumber(feesStats.hourlySpotFees, format) : '$0'}
            </div>
          </div>

          <div>
            <div className="text-[#FFFFFF80] text-xs mb-1 tracking-wide flex items-center">
              <Wallet className="h-3.5 w-3.5 text-[#83E9FF80] mr-1.5" />
              Total USDC
            </div>
            <div className="text-white text-sm font-medium">
              {stats ? formatNumber(stats.totalSpotUSDC, format) : '$0'}
            </div>
          </div>

          <div>
            <div className="text-[#FFFFFF80] text-xs mb-1 tracking-wide flex items-center">
              <BarChart2 className="h-3.5 w-3.5 text-[#83E9FF80] mr-1.5" />
              Total HIP2
            </div>
            <div className="text-white text-sm font-medium">
              {stats ? formatNumber(stats.totalHIP2, format) : '$0'}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}); 