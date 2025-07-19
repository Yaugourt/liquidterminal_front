import { memo } from "react";
import { Card } from "@/components/ui/card";
import { Shield, Users, Coins, ExternalLink, Clock } from "lucide-react";
import { useValidators } from "@/services/validator";
import { useHoldersStats } from "@/services/validator/hooks/useHoldersStats";
import { useUnstakingStatsData } from "@/services/validator/hooks/staking";
import { useNumberFormat } from "@/store/number-format.store";
import { formatNumber } from "@/lib/formatting";
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
      <Card className="p-3 bg-[#051728E5] border border-red-500/50 shadow-sm backdrop-blur-sm rounded-md h-full flex flex-col">
        <div className="flex items-center gap-2 text-red-400">
          <Shield size={18} />
          <span className="text-sm">Failed to load validator stats</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-[#051728E5] border border-[#83E9FF4D] shadow-sm backdrop-blur-sm hover:border-[#83E9FF66] transition-all rounded-md h-full flex flex-col">
      {/* Header avec titre */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-1.5">
          <Shield size={18} className="text-[#f9e370]" />
          <h3 className="text-sm text-[#FFFFFF] font-medium tracking-wide">
            VALIDATOR STATS
          </h3>
        </div>
        
        <Link
          href="https://app.hyperliquid.xyz/staking"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-2 py-1 text-xs text-[#F9E370] hover:text-white transition-colors"
        >
          Stake
          <ExternalLink size={12} />
        </Link>
      </div>

      {/* Contenu principal - Grid de 4 comme dans spot */}
      {isLoading ? (
        <div className="flex justify-center items-center flex-1">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#83E9FF]"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm flex-1 content-center">
          {/* Total Validators - ne pas toucher */}
          <div>
            <div className="text-white mb-2 flex items-center font-medium">
              <Users className="h-3.5 w-3.5 text-[#f9e370] mr-1.5" />
              Total Validators
            </div>
            <div className="text-white font-medium text-xs pl-5">
              {stats.total}
              <span className="text-[#4ADE80] text-xs ml-2">({stats.active} active)</span>
            </div>
          </div>

          {/* HYPE Staked - ne pas toucher */}
          <div>
            <div className="text-white mb-2 flex items-center font-medium">
              <Coins className="h-3.5 w-3.5 text-[#f9e370] mr-1.5" />
              HYPE Staked
            </div>
            <div className="text-white font-medium text-xs pl-5">
              {formatNumber(stats.totalHypeStaked, format, { maximumFractionDigits: 0 })}
              {hypePrice && (
                <div className="text-[#83E9FF] text-xs">
                  ${formatNumber(stats.totalHypeStaked * hypePrice, format, { maximumFractionDigits: 0 })}
                </div>
              )}
            </div>
          </div>

          {/* Average Staked - du hook useHoldersStats */}
          <div>
            <div className="text-white mb-2 flex items-center font-medium">
              <div className="w-3.5 h-3.5 rounded-full bg-[#F9E370]/20 flex items-center justify-center mr-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#F9E370]"></div>
              </div>
              Average Staked
            </div>
            <div className="text-white font-medium text-xs pl-5">
              {holdersStats ? formatNumber(holdersStats.averageStaked, format, { maximumFractionDigits: 0 }) : '0'} HYPE
            </div>
          </div>

          {/* Active Stakers */}
          <div>
            <div className="text-white mb-2 flex items-center font-medium">
              <div className="w-3.5 h-3.5 rounded-full bg-[#83E9FF]/20 flex items-center justify-center mr-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#83E9FF]"></div>
              </div>
              Active Stakers
            </div>
            <div className="text-white font-medium text-xs pl-5">
              {holdersStats ? formatNumber(holdersStats.totalHolders, format, { maximumFractionDigits: 0 }) : '0'}
            </div>
          </div>

          {/* 1h Unstaking */}
          <div>
            <div className="text-white mb-2 flex items-center font-medium">
              <Clock className="h-3.5 w-3.5 text-[#f9e370] mr-1.5" />
              1h Unstaking
            </div>
            <div className="text-white font-medium text-xs pl-5">
              {upcomingUnstaking ? formatNumber(upcomingUnstaking.nextHour.totalTokens, format, { maximumFractionDigits: 0 }) : '0'} HYPE
            </div>
          </div>

          {/* 24h Unstaking */}
          <div>
            <div className="text-white mb-2 flex items-center font-medium">
              <Clock className="h-3.5 w-3.5 text-[#f9e370] mr-1.5" />
              24h Unstaking
            </div>
            <div className="text-white font-medium text-xs pl-5">
              {upcomingUnstaking ? formatNumber(upcomingUnstaking.next24Hours.totalTokens, format, { maximumFractionDigits: 0 }) : '0'} HYPE
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}); 