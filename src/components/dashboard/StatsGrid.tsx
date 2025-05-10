import { useDashboardStats } from "@/services/dashboard/hooks/useDashboardStats";
import { StatsCard } from "./StatsCard";
import { Loader2 } from "lucide-react";

export function StatsGrid() {
  const { stats, isLoading, error } = useDashboardStats();

  // Fonction pour formater les nombres avec plus de lisibilité
  const formatStat = (value: number, options?: { prefix?: string; decimals?: number }) => {
    const { prefix = '', decimals = 0 } = options || {};
    
    // Pour les grands nombres (millions+), formater avec K, M, B
    if (value >= 1000000000) {
      return `${prefix}${(value / 1000000000).toFixed(decimals)}B`;
    } else if (value >= 1000000) {
      return `${prefix}${(value / 1000000).toFixed(decimals)}M`;
    } else if (value >= 1000) {
      return `${prefix}${(value / 1000).toFixed(decimals)}K`;
    }
    
    // Formater les petits nombres normalement
    return `${prefix}${value.toLocaleString('en-US', { maximumFractionDigits: decimals })}`;
  };

  // Afficher un état de chargement
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 md:gap-4 w-full">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="bg-[#051728] border-2 border-[#83E9FF4D] rounded-lg p-4 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-[#83E9FF4D] animate-spin" />
          </div>
        ))}
      </div>
    );
  }

  // Afficher une erreur
  if (error) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 md:gap-4 w-full">
        <div className="col-span-full bg-[#051728] border-2 border-red-500 rounded-lg p-4 text-center text-red-500">
          Error: {error.message}
        </div>
      </div>
    );
  }

  // Afficher les données
  const statsItems = stats ? [
    {
      title: "Users",
      value: formatStat(stats.numberOfUsers),
    },
    {
      title: "Daily Volume",
      value: formatStat(stats.dailyVolume, { prefix: '$', decimals: 2 }),
    },
    {
      title: "Bridged USDC",
      value: formatStat(stats.bridgedUsdc, { prefix: '$', decimals: 1 }),
    },
    {
      title: "HYPE Staked",
      value: formatStat(stats.totalHypeStake, { decimals: 1 }),
    },
    {
      title: "Vaults TVL",
      value: formatStat(stats.vaultsTvl, { prefix: '$', decimals: 1 }),
    },
  ] : [];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 md:gap-4 w-full">
      {statsItems.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  );
}
