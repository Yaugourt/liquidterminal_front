import { memo } from "react";
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
      <div className="p-4 bg-brand-secondary/60 backdrop-blur-md border border-border-subtle rounded-2xl shadow-xl shadow-black/20 h-full">
        <div className="flex justify-center items-center h-full">
          <p className="text-rose-400 text-sm">Une erreur est survenue</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-brand-secondary/60 backdrop-blur-md border border-border-subtle rounded-2xl hover:border-border-hover transition-all shadow-xl shadow-black/20 h-full flex flex-col">
      {/* Header avec icône et titre */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-xl bg-brand-gold/10 flex items-center justify-center">
          <BarChart2 size={16} className="text-brand-gold" />
        </div>
        <h3 className="text-[11px] text-text-secondary font-semibold uppercase tracking-wider">Global Stats</h3>
      </div>

      {/* Statistiques détaillées - flex-1 pour occuper l'espace restant */}
      {isLoading || feesLoading ? (
        <div className="flex justify-center items-center flex-1">
          <Loader2 className="w-6 h-6 text-brand-accent animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm flex-1 content-center">
          {/* Première stat - conditionnelle selon le marché */}
          {market === 'spot' ? (
            <div>
              <div className="text-text-secondary mb-1 flex items-center text-xs">
                <CalendarDays className="h-3.5 w-3.5 text-brand-accent mr-1.5" />
                Daily Fees
              </div>
              <div className="text-white font-bold text-sm pl-5">
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
              <div className="text-text-secondary mb-1 flex items-center text-xs">
                <Scale className="h-3.5 w-3.5 text-brand-accent mr-1.5" />
                Open Interest
              </div>
              <div className="text-white font-bold text-sm pl-5">
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
              <div className="text-text-secondary mb-1 flex items-center text-xs">
                <Clock className="h-3.5 w-3.5 text-brand-accent mr-1.5" />
                Hourly Fees
              </div>
              <div className="text-white font-bold text-sm pl-5">
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
              <div className="text-text-secondary mb-1 flex items-center text-xs">
                <BarChart2 className="h-3.5 w-3.5 text-brand-accent mr-1.5" />
                24h Volume
              </div>
              <div className="text-white font-bold text-sm pl-5">
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
              <div className="text-text-secondary mb-1 flex items-center text-xs">
                <Wallet className="h-3.5 w-3.5 text-brand-accent mr-1.5" />
                Total USDC
              </div>
              <div className="text-white font-bold text-sm pl-5">
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
              <div className="text-text-secondary mb-1 flex items-center text-xs">
                <Clock className="h-3.5 w-3.5 text-brand-accent mr-1.5" />
                Daily Fees
              </div>
              <div className="text-white font-bold text-sm pl-5">
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
              <div className="text-text-secondary mb-1 flex items-center text-xs">
                <BarChart2 className="h-3.5 w-3.5 text-brand-accent mr-1.5" />
                24h Volume
              </div>
              <div className="text-white font-bold text-sm pl-5">
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
              <div className="text-text-secondary mb-1 flex items-center text-xs">
                <Wallet className="h-3.5 w-3.5 text-brand-accent mr-1.5" />
                HLP TVL
              </div>
              <div className="text-white font-bold text-sm pl-5">
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
    </div>
  );
}); 