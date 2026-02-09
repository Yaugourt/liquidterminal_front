import { useDashboardStats, DashboardGlobalStats } from "@/services/dashboard";
import { StatsCard, StatsCardSkeleton } from "@/components/common/StatsCard";
import { useNumberFormat } from "@/store/number-format.store";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { Users, Activity, Wallet, Shield, Database } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Liquidations24hCard } from "./Liquidations24hCard";

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
      <div className="flex flex-col md:flex-row gap-2 sm:gap-3 w-full">
        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
          {[...Array(6)].map((_, index) => (
            <StatsCardSkeleton key={index} />
          ))}
        </div>
        <div className="w-full md:w-64 lg:w-72">
          <Card className="p-4 h-full flex items-center justify-center min-h-[180px]">
            <div className="h-32 w-full bg-white/5 animate-pulse rounded" />
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 w-full">
        <Card className="col-span-full p-4 text-center text-rose-400 text-sm">
          Error: {error.message}
        </Card>
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
    <div className="flex flex-col md:flex-row gap-2 sm:gap-3 w-full">
      {/* Stats cards à gauche - grille 2 cols mobile, 3 cols desktop */}
      <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
        {statsItems.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>
      
      {/* Liquidations24hCard à droite */}
      <div className="w-full md:w-64 lg:w-72">
        <Liquidations24hCard className="h-full" />
      </div>
    </div>
  );
}

