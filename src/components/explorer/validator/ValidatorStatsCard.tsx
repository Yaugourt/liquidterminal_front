import { memo } from "react";
import { Shield, Users, Coins, ExternalLink, Clock } from "lucide-react";
import { useValidators } from "@/services/explorer/validator";
import { useHoldersStats } from "@/services/explorer/validator/hooks/useHoldersStats";
import { useUnstakingStatsData } from "@/services/explorer/validator/hooks/staking";
import { useNumberFormat } from "@/store/number-format.store";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useHypePrice } from "@/services/market/hype/hooks/useHypePrice";
import Link from "next/link";

/**
 * Carte affichant les statistiques des validateurs
 */
export const ValidatorStatsCard = memo(function ValidatorStatsCard() {
  const { stats, isLoading, error } = useValidators();
  const { stats: holdersStats } = useHoldersStats();
  const { upcomingUnstaking } = useUnstakingStatsData();
  const { format } = useNumberFormat();
  const { price: hypePrice } = useHypePrice();

  if (error) {
    return (
      <div className="p-4 h-full flex flex-col">
        <div className="flex items-center gap-2 text-rose-400">
          <Shield size={18} />
          <span className="text-sm">Failed to load validator stats</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 h-full flex flex-col">
      {/* Header with title */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-brand-accent/10 flex items-center justify-center">
            <Shield size={16} className="text-brand-accent" />
          </div>
          <h3 className="text-[11px] text-text-secondary font-semibold uppercase tracking-wider">
            Validator Stats
          </h3>
        </div>
        
        <Link
          href="https://app.hyperliquid.xyz/staking"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-label text-text-muted hover:text-brand-accent transition-colors"
        >
          Stake
          <ExternalLink size={10} />
        </Link>
      </div>

      {/* Main content */}
      {isLoading ? (
        <div className="flex justify-center items-center flex-1">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-accent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm flex-1 content-center">
          {/* Total Validators */}
          <div>
            <div className="text-text-secondary mb-1 flex items-center text-xs font-medium">
              <Users className="h-3.5 w-3.5 text-brand-accent mr-1.5" />
              Total Validators
            </div>
            <div className="text-white font-bold text-sm pl-5">
              {stats.total}
              <span className="text-emerald-400 text-xs ml-2 font-medium">({stats.active} active)</span>
            </div>
          </div>

          {/* HYPE Staked */}
          <div>
            <div className="text-text-secondary mb-1 flex items-center text-xs font-medium">
              <Coins className="h-3.5 w-3.5 text-brand-accent mr-1.5" />
              HYPE Staked
            </div>
            <div className="text-white font-bold text-sm pl-5">
              {formatNumber(stats.totalHypeStaked, format, { maximumFractionDigits: 0 })}
              {hypePrice && (
                <div className="text-text-muted text-xs font-medium">
                  ${formatNumber(stats.totalHypeStaked * hypePrice, format, { maximumFractionDigits: 0 })}
                </div>
              )}
            </div>
          </div>

          {/* Average Staked */}
          <div>
            <div className="text-text-secondary mb-1 flex items-center text-xs font-medium">
              <div className="w-3.5 h-3.5 rounded-full bg-brand-gold/20 flex items-center justify-center mr-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-gold"></div>
              </div>
              Average Staked
            </div>
            <div className="text-white font-bold text-sm pl-5">
              {holdersStats ? formatNumber(holdersStats.averageStaked, format, { maximumFractionDigits: 0 }) : '0'} HYPE
            </div>
          </div>

          {/* Active Stakers */}
          <div>
            <div className="text-text-secondary mb-1 flex items-center text-xs font-medium">
              <div className="w-3.5 h-3.5 rounded-full bg-brand-accent/20 flex items-center justify-center mr-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-accent"></div>
              </div>
              Active Stakers
            </div>
            <div className="text-white font-bold text-sm pl-5">
              {holdersStats ? formatNumber(holdersStats.totalHolders, format, { maximumFractionDigits: 0 }) : '0'}
            </div>
          </div>

          {/* 1h Unstaking */}
          <div>
            <div className="text-text-secondary mb-1 flex items-center text-xs font-medium">
              <Clock className="h-3.5 w-3.5 text-brand-accent mr-1.5" />
              1h Unstaking
            </div>
            <div className="text-white font-bold text-sm pl-5">
              {upcomingUnstaking ? formatNumber(upcomingUnstaking.nextHour.totalTokens, format, { maximumFractionDigits: 0 }) : '0'} HYPE
            </div>
          </div>

          {/* 24h Unstaking */}
          <div>
            <div className="text-text-secondary mb-1 flex items-center text-xs font-medium">
              <Clock className="h-3.5 w-3.5 text-brand-accent mr-1.5" />
              24h Unstaking
            </div>
            <div className="text-white font-bold text-sm pl-5">
              {upcomingUnstaking ? formatNumber(upcomingUnstaking.next24Hours.totalTokens, format, { maximumFractionDigits: 0 }) : '0'} HYPE
            </div>
          </div>
        </div>
      )}
    </div>
  );
}); 