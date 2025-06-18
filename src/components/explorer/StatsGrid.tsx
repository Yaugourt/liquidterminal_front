import { StatsCard } from "./StatsCard";
import { useEffect, useState } from "react";
import { useNumberFormat } from "@/store/number-format.store";
import { formatNumber } from "@/lib/formatting";
import { ExplorerStat, ExplorerStatsCardProps } from "@/components/types/explorer.types";
import { useDashboardStats } from "@/services/dashboard/hooks/useDashboardStats";
import { useWebSocket } from "@/services/explorer/websocket.service";

export function StatsGrid() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<ExplorerStat[]>([]);
  const { format } = useNumberFormat();
  const { stats: dashboardStats, isLoading: isDashboardLoading } = useDashboardStats();
  const { lastBlock } = useWebSocket();

  // Fonction pour formater les nombres selon le type
  const formatValue = (value: number | string, type: ExplorerStatsCardProps['type']) => {
    if (type === 'blockTime') {
      return `${value}s`;
    }
    if (typeof value === 'string') return value;
    return formatNumber(value, format);
  };

  useEffect(() => {
    if (!isDashboardLoading) {
      setStats([
        {
          title: "Block",
          value: formatValue(lastBlock || 0, "block"),
          type: "block"
        },
        {
          title: "Block time",
          value: formatValue(0.07, "blockTime"),
          type: "blockTime"
        },
        {
          title: "Max TPS",
          value: formatValue(200000, "transactions"),
          type: "transactions"
        },
        {
          title: "Users",
          value: formatValue(dashboardStats?.numberOfUsers || 0, "users"),
          type: "users"
        }
      ]);
      setIsLoading(false);
    }
  }, [format, lastBlock, dashboardStats, isDashboardLoading]);

  if (isLoading) {
    return (
      <div className="w-full py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="p-4 bg-[#051728E5] w-full border border-[#83E9FF4D] rounded-xl shadow-sm animate-pulse">
              <div className="flex items-start">
                <div className="bg-[#083050] p-2 rounded-lg mr-3 w-8 h-8"></div>
                <div className="flex flex-col gap-2 w-full">
                  <div className="h-3 bg-[#FFFFFF20] rounded w-14"></div>
                  <div className="h-6 bg-[#FFFFFF30] rounded w-20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatsCard 
            key={index}
            title={stat.title}
            value={stat.value}
            type={stat.type}
          />
        ))}
      </div>
    </div>
  );
}
