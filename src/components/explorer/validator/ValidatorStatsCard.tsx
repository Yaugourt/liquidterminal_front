import { memo } from "react";
import { Shield, Users, Coins, ExternalLink, Clock } from "lucide-react";
import { useValidators } from "@/services/explorer/validator";
import { useHoldersStats } from "@/services/explorer/validator/hooks/useHoldersStats";
import { useUnstakingStatsData } from "@/services/explorer/validator/hooks/staking";
import { useNumberFormat } from "@/store/number-format.store";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useHypePrice } from "@/services/market/hype/hooks/useHypePrice";
import Link from "next/link";
import { StatsPanel } from "@/components/common";

interface InlineStatProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  subValue?: React.ReactNode;
}

function InlineStat({ icon, label, value, subValue }: InlineStatProps) {
  return (
    <div>
      <div className="text-text-secondary mb-1 flex items-center text-xs font-medium">
        <span className="mr-1.5">{icon}</span>
        {label}
      </div>
      <div className="text-white font-bold text-sm pl-5">
        {value}
        {subValue && <div className="text-text-muted text-xs font-medium">{subValue}</div>}
      </div>
    </div>
  );
}

export const ValidatorStatsCard = memo(function ValidatorStatsCard() {
  const { stats, isLoading, error } = useValidators();
  const { stats: holdersStats } = useHoldersStats();
  const { upcomingUnstaking } = useUnstakingStatsData();
  const { format } = useNumberFormat();
  const { price: hypePrice } = useHypePrice();

  return (
    <StatsPanel
      title="Validator Stats"
      icon={<Shield size={16} className="text-brand-accent" />}
      isLoading={isLoading}
      error={error}
      errorTitle="Failed to load validator stats"
      headerAction={
        <Link
          href="https://app.hyperliquid.xyz/staking"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-label text-text-muted hover:text-brand-accent transition-colors"
        >
          Stake
          <ExternalLink size={10} />
        </Link>
      }
    >
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm content-center h-full">
        <InlineStat
          icon={<Users className="h-3.5 w-3.5 text-brand-accent" />}
          label="Total Validators"
          value={
            <>
              {stats.total}
              <span className="text-emerald-400 text-xs ml-2 font-medium">({stats.active} active)</span>
            </>
          }
        />
        <InlineStat
          icon={<Coins className="h-3.5 w-3.5 text-brand-accent" />}
          label="HYPE Staked"
          value={formatNumber(stats.totalHypeStaked, format, { maximumFractionDigits: 0 })}
          subValue={
            hypePrice
              ? `$${formatNumber(stats.totalHypeStaked * hypePrice, format, { maximumFractionDigits: 0 })}`
              : undefined
          }
        />
        <InlineStat
          icon={
            <div className="w-3.5 h-3.5 rounded-full bg-brand-gold/20 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-gold"></div>
            </div>
          }
          label="Average Staked"
          value={`${holdersStats ? formatNumber(holdersStats.averageStaked, format, { maximumFractionDigits: 0 }) : "0"} HYPE`}
        />
        <InlineStat
          icon={
            <div className="w-3.5 h-3.5 rounded-full bg-brand-accent/20 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-accent"></div>
            </div>
          }
          label="Active Stakers"
          value={holdersStats ? formatNumber(holdersStats.totalHolders, format, { maximumFractionDigits: 0 }) : "0"}
        />
        <InlineStat
          icon={<Clock className="h-3.5 w-3.5 text-brand-accent" />}
          label="1h Unstaking"
          value={`${upcomingUnstaking ? formatNumber(upcomingUnstaking.nextHour.totalTokens, format, { maximumFractionDigits: 0 }) : "0"} HYPE`}
        />
        <InlineStat
          icon={<Clock className="h-3.5 w-3.5 text-brand-accent" />}
          label="24h Unstaking"
          value={`${upcomingUnstaking ? formatNumber(upcomingUnstaking.next24Hours.totalTokens, format, { maximumFractionDigits: 0 }) : "0"} HYPE`}
        />
      </div>
    </StatsPanel>
  );
});
