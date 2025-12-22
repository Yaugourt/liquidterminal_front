import { StatsCard, StatsCardSkeleton } from "@/components/common/StatsCard";
import { useEffect, useState, useCallback } from "react";
import { useNumberFormat } from "@/store/number-format.store";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useExplorerStore } from "@/services/explorer";
import { useDashboardStats } from "@/services/dashboard";
import { useVaults } from "@/services/explorer/vault/hooks/useVaults";
import { Users, Timer, Zap, Activity, Wallet } from "lucide-react";
import Image from "next/image";

interface StatItem {
  title: string;
  value: string;
  icon: React.ReactNode;
}

export function StatsGrid() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<StatItem[]>([]);
  const { format } = useNumberFormat();
  const { currentBlockHeight, connectBlocks, disconnectBlocks } = useExplorerStore();

  const { stats: dashboardStats, isLoading: dashboardLoading } = useDashboardStats();
  const { totalTvl: vaultsTvl, isLoading: vaultsLoading } = useVaults();

  useEffect(() => {
    connectBlocks();
    return () => disconnectBlocks();
  }, [connectBlocks, disconnectBlocks]);

  const formatValue = useCallback((value: number, type: string) => {
    if (type === "users") {
      return formatNumber(value, format, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
    }
    if (type === "hypeStaked") {
      return formatNumber(value, format, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
      });
    }
    if (type === "vaultsTvl") {
      return formatNumber(value, format, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
        currency: '$',
        showCurrency: true
      });
    }
    return formatNumber(value, format, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }, [format]);

  useEffect(() => {
    if (currentBlockHeight > 0) {
      setStats([
        {
          title: "Blocks",
          value: formatValue(currentBlockHeight, "blocks"),
          icon: <Activity size={16} className="text-brand-accent" />,
        },
        {
          title: "Block Time",
          value: "0.07s",
          icon: <Timer size={16} className="text-brand-accent" />,
        },
        {
          title: "Max TPS",
          value: "200,000",
          icon: <Zap size={16} className="text-brand-accent" />,
        },
        {
          title: "Users",
          value: dashboardStats?.numberOfUsers
            ? formatValue(dashboardStats.numberOfUsers, "users")
            : dashboardLoading ? "Loading..." : "N/A",
          icon: <Users size={16} className="text-brand-accent" />,
        },
        {
          title: "HYPE Staked",
          value: dashboardStats?.totalHypeStake
            ? formatValue(dashboardStats.totalHypeStake, "hypeStaked")
            : dashboardLoading ? "Loading..." : "N/A",
          icon: <Image src="https://app.hyperliquid.xyz/coins/HYPE_USDC.svg" alt="HYPE Logo" width={16} height={16} />,
        },
        {
          title: "Vaults TVL",
          value: vaultsTvl > 0
            ? formatValue(vaultsTvl, "vaultsTvl")
            : vaultsLoading ? "Loading..." : "N/A",
          icon: <Wallet size={16} className="text-brand-accent" />,
        },
      ]);
      setIsLoading(false);
    }
  }, [currentBlockHeight, formatValue, dashboardStats, dashboardLoading, vaultsTvl, vaultsLoading]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1.5 sm:gap-2 md:gap-3 w-full">
        {[...Array(6)].map((_, index) => (
          <StatsCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1.5 sm:gap-2 md:gap-3 w-full">
      {stats.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  );
}

