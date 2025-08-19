import { memo } from "react";
import { Card } from "@/components/ui/card";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useSpotGlobalStats } from "@/services/market/spot/hooks/useSpotGlobalStats";
import { usePerpGlobalStats } from "@/services/market/perp/hooks/usePerpGlobalStats";
import { useFeesStats } from "@/services/market/fees/hooks/useFeesStats";
import { Loader2, BarChart2, Clock, CalendarDays, Scale, Wallet } from "lucide-react";
import { useNumberFormat } from "@/store/number-format.store";
import { SpotGlobalStats } from "@/services/market/spot/types";
import { PerpGlobalStats } from "@/services/market/perp/types";

type GlobalStats = SpotGlobalStats | PerpGlobalStats;

// Type guards
function isSpotStats(stats: GlobalStats): stats is SpotGlobalStats {
  return 'totalSpotUSDC' in stats;
}

function isPerpStats(stats: GlobalStats): stats is PerpGlobalStats {
  return 'hlpTvl' in stats;
}

interface GlobalStatsCardProps {
  market: 'spot' | 'perp';
}

/**
 * Carte affichant les statistiques globales du marché (spot ou perp)
 */
export const GlobalStatsCard = memo(function GlobalStatsCard({ market }: GlobalStatsCardProps) {
  // Toujours appeler les hooks, mais ignorer les résultats non pertinents
  const { stats: spotStats, isLoading: spotLoading, error: spotError } = useSpotGlobalStats();
  const { stats: perpStats, isLoading: perpLoading, error: perpError } = usePerpGlobalStats();
    
  const { feesStats, isLoading: feesLoading } = useFeesStats();
  const { format } = useNumberFormat();

  const stats = market === 'spot' ? spotStats : perpStats;
  const isLoading = market === 'spot' ? spotLoading : perpLoading;
  const error = market === 'spot' ? spotError : perpError;

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
          {/* Première stat - conditionnelle selon le marché */}
          {market === 'spot' ? (
            <div>
              <div className="text-white mb-2 flex items-center font-medium">
                <CalendarDays className="h-3.5 w-3.5 text-[#f9e370] mr-1.5" />
                Daily Fees
              </div>
              <div className="text-white font-medium text-xs pl-5">
                {feesStats ? formatNumber(feesStats.dailySpotFees, format, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 1,
                  currency: '$',
                  showCurrency: true
                }) : '$0'}
              </div>
            </div>
          ) : (
            <div>
              <div className="text-white mb-2 flex items-center font-medium">
                <Scale className="h-3.5 w-3.5 text-[#f9e370] mr-1.5" />
                Open Interest
              </div>
              <div className="text-white font-medium text-xs pl-5">
                {stats && isPerpStats(stats) ? formatNumber(stats.totalOpenInterest, format, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 1,
                  currency: '$',
                  showCurrency: true
                }) : '$0'}
              </div>
            </div>
          )}

          {/* Deuxième stat - conditionnelle selon le marché */}
          {market === 'spot' ? (
            <div>
              <div className="text-white mb-2 flex items-center font-medium">
                <Clock className="h-3.5 w-3.5 text-[#f9e370] mr-1.5" />
                Hourly Fees
              </div>
              <div className="text-white font-medium text-xs pl-5">
                {feesStats ? formatNumber(feesStats.hourlySpotFees, format, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 1,
                  currency: '$',
                  showCurrency: true
                }) : '$0'}
              </div>
            </div>
          ) : (
            <div>
              <div className="text-white mb-2 flex items-center font-medium">
                <BarChart2 className="h-3.5 w-3.5 text-[#f9e370] mr-1.5" />
                24h Volume
              </div>
              <div className="text-white font-medium text-xs pl-5">
                {stats ? formatNumber((stats as GlobalStats).totalVolume24h, format, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 1,
                  currency: '$',
                  showCurrency: true
                }) : '$0'}
              </div>
            </div>
          )}

          {/* Troisième stat - conditionnelle selon le marché */}
          {market === 'spot' ? (
            <div>
              <div className="text-white mb-2 flex items-center font-medium">
                <Wallet className="h-3.5 w-3.5 text-[#f9e370] mr-1.5" />
                Total USDC
              </div>
              <div className="text-white font-medium text-xs pl-5">
                {stats && isSpotStats(stats) ? formatNumber(stats.totalSpotUSDC, format, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 1,
                  currency: '$',
                  showCurrency: true
                }) : '$0'}
              </div>
            </div>
          ) : (
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
          )}

          {/* Quatrième stat - conditionnelle selon le marché */}
          {market === 'spot' ? (
            <div>
              <div className="text-white mb-2 flex items-center font-medium">
                <BarChart2 className="h-3.5 w-3.5 text-[#f9e370] mr-1.5" />
                24h Volume
              </div>
              <div className="text-white font-medium text-xs pl-5">
                {stats ? formatNumber((stats as GlobalStats).totalVolume24h, format, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 1,
                  currency: '$',
                  showCurrency: true
                }) : '$0'}
              </div>
            </div>
          ) : (
            <div>
              <div className="text-white mb-2 flex items-center font-medium">
                <Wallet className="h-3.5 w-3.5 text-[#f9e370] mr-1.5" />
                HLP TVL
              </div>
              <div className="text-white font-medium text-xs pl-5">
                {stats && isPerpStats(stats) ? formatNumber(stats.hlpTvl, format, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 1,
                  currency: '$',
                  showCurrency: true
                }) : '$0'}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}); 