import { StatsCard } from "./StatsCard";
import { useEffect, useState } from "react";
import { useNumberFormat } from "@/store/number-format.store";
import { formatNumber } from "@/lib/numberFormatting";
import { ExplorerStat, ExplorerStatsCardProps } from "@/components/types/explorer.types";
import { useDashboardStats } from "@/services/dashboard";
import { useExplorerStore } from "@/services/explorer";
import { Loader2 } from "lucide-react";

export function StatsGrid() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<ExplorerStat[]>([]);
  const { format } = useNumberFormat();
  const { stats: dashboardStats, isLoading: isDashboardLoading } = useDashboardStats();
  const { blocks, connectBlocks, disconnectBlocks } = useExplorerStore();

  useEffect(() => {
    connectBlocks(); // Connecter seulement les blocks, pas les transactions
    return () => disconnectBlocks();
  }, [connectBlocks, disconnectBlocks]);

  // Fonction pour formater les nombres selon le format sélectionné
  const formatValue = (value: number, type: string) => {
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
  };

  useEffect(() => {
    if (!isDashboardLoading && blocks.length > 0) {
      const latestBlock = blocks[0];
      setStats([
        {
          title: "Blocks",
          type: "block",
          value: formatValue(latestBlock.height, "blocks"),
        },
        {
          title: "Block Time",
          type: "blockTime",
          value: "0.07s",
        },
        {
          title: "Max TPS",
          type: "transactions",
          value: "200,000",
        },
        {
          title: "Users",
          type: "users",
          value: formatValue(dashboardStats?.numberOfUsers || 0, "users"),
        },
        {
          title: "HYPE Staked",
          type: "hypeStaked",
          value: formatValue(dashboardStats?.totalHypeStake || 0, "hypeStaked"),
        },
        {
          title: "Vaults TVL",
          type: "vaultsTvl",
          value: formatValue(dashboardStats?.vaultsTvl || 0, "vaultsTvl"),
        },
      ]);
      setIsLoading(false);
    }
  }, [blocks, dashboardStats, format, isDashboardLoading]);

  // Afficher un état de chargement
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1.5 sm:gap-2 md:gap-3 w-full">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-[#051728] border border-[#83E9FF4D] rounded-lg p-3 flex items-center justify-center">
            <Loader2 className="w-4 h-4 text-[#83E9FF4D] animate-spin" />
          </div>
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
