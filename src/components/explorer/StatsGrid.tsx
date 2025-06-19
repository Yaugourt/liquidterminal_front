import { StatsCard } from "./StatsCard";
import { useEffect, useState } from "react";
import { useNumberFormat } from "@/store/number-format.store";
import { formatNumber } from "@/lib/formatting";
import { ExplorerStat, ExplorerStatsCardProps } from "@/components/types/explorer.types";
import { useDashboardStats } from "@/services/dashboard/hooks/useDashboardStats";
import { useExplorerStore } from "@/services/explorer/websocket.service";

export function StatsGrid() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<ExplorerStat[]>([]);
  const { format } = useNumberFormat();
  const { stats: dashboardStats, isLoading: isDashboardLoading } = useDashboardStats();
  const { blocks, connect, disconnect } = useExplorerStore();

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  // Fonction pour formater les nombres selon le format sélectionné
  const formatValue = (value: number, type: string) => {
    if (type === "users") {
      return formatNumber(value, format, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
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
      ]);
      setIsLoading(false);
    }
  }, [blocks, dashboardStats, format, isDashboardLoading]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-1.5 sm:gap-2 md:gap-3 w-full">
      {stats.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  );
}
