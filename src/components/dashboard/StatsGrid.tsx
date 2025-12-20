import { useDashboardStats, DashboardGlobalStats } from "@/services/dashboard";
import { StatsCard, StatsCardSkeleton } from "@/components/common/StatsCard";
import { GlassPanel } from "@/components/ui/glass-panel";
import { useNumberFormat } from "@/store/number-format.store";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { Users, Activity, Wallet, Shield, Database } from "lucide-react";

interface StatsGridProps {
  stats?: DashboardGlobalStats;
}

export function StatsGrid({ stats: initialData }: StatsGridProps) {
  const { stats, isLoading, error } = useDashboardStats(initialData);
  const { format } = useNumberFormat();

  const formatStat = (value: number | undefined | null, options?: { prefix?: string; decimals?: number }) => {
    const { prefix = '', decimals = 0 } = options || {};
    if (value === undefined || value === null) {
      return `${prefix}0`;
    }
    return formatNumber(value, format, {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
      currency: prefix,
      showCurrency: !!prefix
    });
  };

  if (isLoading && !initialData) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5 sm:gap-2 md:gap-3 w-full">
        {[...Array(5)].map((_, index) => (
          <StatsCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5 sm:gap-2 md:gap-3 w-full">
        <GlassPanel className="col-span-full p-4 text-center text-rose-400 text-sm">
          Error: {error.message}
        </GlassPanel>
      </div>
    );
  }

  const currentStats = stats || initialData;

  const statsItems = currentStats ? [
    {
      title: "Users",
      value: formatStat(currentStats.numberOfUsers),
      icon: <Users size={16} className="text-brand-accent" />,
    },
    {
      title: "Daily Volume",
      value: formatStat(currentStats.dailyVolume, { prefix: '$', decimals: 2 }),
      icon: <Activity size={16} className="text-brand-accent" />,
    },
    {
      title: "Bridged USDC",
      value: formatStat(currentStats.bridgedUsdc, { prefix: '$', decimals: 1 }),
      icon: <Wallet size={16} className="text-brand-accent" />,
    },
    {
      title: "HYPE Staked",
      value: formatStat(currentStats.totalHypeStake, { decimals: 1 }),
      icon: <Shield size={16} className="text-brand-accent" />,
    },
    {
      title: "Vaults TVL",
      value: formatStat(currentStats.vaultsTvl, { prefix: '$', decimals: 1 }),
      icon: <Database size={16} className="text-brand-accent" />,
    },
  ] : [];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5 sm:gap-2 md:gap-3 w-full">
      {statsItems.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  );
}

