import { StatsCard } from "./StatsCard";
import { useEffect, useState, useCallback } from "react";
import { useNumberFormat } from "@/store/number-format.store";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { ExplorerStat } from "@/components/types/explorer.types";
import { useExplorerStore } from "@/services/explorer";
import { useDashboardStats } from "@/services/dashboard";
import { useVaults } from "@/services/explorer/vault/hooks/useVaults";
import { Loader2 } from "lucide-react";

export function StatsGrid() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<ExplorerStat[]>([]);
  const { format } = useNumberFormat();
  const { currentBlockHeight, connectBlocks, disconnectBlocks } = useExplorerStore();
  
  // Récupérer les données du dashboard
  const { stats: dashboardStats, isLoading: dashboardLoading } = useDashboardStats();
  
  // Récupérer les données des vaults
  const { totalTvl: vaultsTvl, isLoading: vaultsLoading } = useVaults();

  useEffect(() => {
    connectBlocks(); // Connecter seulement les blocks, pas les transactions
    return () => disconnectBlocks();
  }, [connectBlocks, disconnectBlocks]);

  // Fonction pour formater les nombres selon le format sélectionné
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
          type: "block",
          value: formatValue(currentBlockHeight, "blocks"),
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
          value: dashboardStats?.numberOfUsers 
            ? formatValue(dashboardStats.numberOfUsers, "users")
            : dashboardLoading ? "Loading..." : "N/A",
        },
        {
          title: "HYPE Staked",
          type: "hypeStaked",
          value: dashboardStats?.totalHypeStake 
            ? formatValue(dashboardStats.totalHypeStake, "hypeStaked")
            : dashboardLoading ? "Loading..." : "N/A",
        },
        {
          title: "Vaults TVL",
          type: "vaultsTvl",
          value: vaultsTvl > 0 
            ? formatValue(vaultsTvl, "vaultsTvl")
            : vaultsLoading ? "Loading..." : "N/A",
        },
      ]);
      setIsLoading(false);
    }
  }, [currentBlockHeight, formatValue, dashboardStats, dashboardLoading, vaultsTvl, vaultsLoading]);

  // Afficher un état de chargement
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1.5 sm:gap-2 md:gap-3 w-full">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-[#151A25]/60 backdrop-blur-md border border-white/5 rounded-2xl p-4 flex items-center justify-center shadow-xl shadow-black/20">
            <Loader2 className="w-4 h-4 text-white/20 animate-spin" />
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
