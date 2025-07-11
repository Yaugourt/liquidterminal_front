import { memo } from "react";
import { Card } from "@/components/ui/card";
import { formatNumber } from "@/lib/formatting";
import { usePerpGlobalStats } from "@/services/market/perp/hooks/usePerpGlobalStats";
import { useFeesStats } from "@/services/market/fees/hooks/useFeesStats";
import { Loader2, BarChart2, Clock, Scale, Wallet } from "lucide-react";
import { useNumberFormat } from "@/store/number-format.store";

/**
 * Carte affichant les statistiques globales du marché perpetuel
 */
export const GlobalStats = memo(function GlobalStats() {
  const { stats, isLoading, error } = usePerpGlobalStats();
  const { feesStats, isLoading: feesLoading } = useFeesStats();
  const { format } = useNumberFormat();

  if (error) {
    return (
      <Card className="p-3 bg-[#051728E5] border border-[#83E9FF4D] shadow-sm backdrop-blur-sm hover:border-[#83E9FF66] transition-all rounded-md h-full">
        <div className="flex justify-center items-center h-full">
          <p className="text-red-500 text-sm">Une erreur est survenue</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-3 bg-[#051728E5] border border-[#83E9FF4D] shadow-sm backdrop-blur-sm hover:border-[#83E9FF66] transition-all rounded-md h-full flex flex-col">
      {/* Header avec icône et titre */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <BarChart2 size={18} className="text-[#f9e370]" />
          <h3 className="text-sm text-[#FFFFFF] font-medium tracking-wide">GLOBAL STATS</h3>
        </div>
      </div>

      {/* Statistiques détaillées - flex-1 pour occuper l'espace restant */}
      {isLoading || feesLoading ? (
        <div className="flex justify-center items-center flex-1">
          <Loader2 className="w-4 h-4 text-[#83E9FF] animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-8 gap-y-6 text-sm flex-1 content-center">
          <div>
            <div className="text-white mb-2 flex items-center font-medium">
              <Scale className="h-3.5 w-3.5 text-[#f9e370] mr-1.5" />
              Open Interest
            </div>
            <div className="text-white font-medium text-xs pl-5">
              {stats ? formatNumber(stats.totalOpenInterest, format, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 1,
                currency: '$',
                showCurrency: true
              }) : '$0'}
            </div>
          </div>

          <div>
            <div className="text-white mb-2 flex items-center font-medium">
              <BarChart2 className="h-3.5 w-3.5 text-[#f9e370] mr-1.5" />
              24h Volume
            </div>
            <div className="text-white font-medium text-xs pl-5">
              {stats ? formatNumber(stats.totalVolume24h, format, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 1,
                currency: '$',
                showCurrency: true
              }) : '$0'}
            </div>
          </div>

          <div>
            <div className="text-white mb-2 flex items-center font-medium">
              <Clock className="h-3.5 w-3.5 text-[#f9e370] mr-1.5" />
              Daily Fees
            </div>
            <div className="text-white font-medium text-xs pl-5">
              {feesStats ? formatNumber(feesStats.dailyFees, format, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 1,
                currency: '$',
                showCurrency: true
              }) : '$0'}
            </div>
          </div>

          <div>
            <div className="text-white mb-2 flex items-center font-medium">
              <Wallet className="h-3.5 w-3.5 text-[#f9e370] mr-1.5" />
              HLP TVL
            </div>
            <div className="text-white font-medium text-xs pl-5">
              {stats ? formatNumber(stats.hlpTvl, format, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 1,
                currency: '$',
                showCurrency: true
              }) : '$0'}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}); 