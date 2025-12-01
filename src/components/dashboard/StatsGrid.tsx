import { useDashboardStats, DashboardGlobalStats } from "@/services/dashboard";
import { StatsCard } from "./StatsCard";
import { Loader2 } from "lucide-react";
import { useNumberFormat } from "@/store/number-format.store";
import { formatNumber } from "@/lib/formatters/numberFormatting";

interface StatsGridProps {
  stats?: DashboardGlobalStats;
}

export function StatsGrid({ stats: initialData }: StatsGridProps) {
  const { stats, isLoading, error } = useDashboardStats(initialData);
  const { format } = useNumberFormat();

  // Fonction pour formater les statistiques
  const formatStat = (value: number | undefined | null, options?: { prefix?: string; decimals?: number }) => {
    const { prefix = '', decimals = 0 } = options || {};
    
    // Handle undefined or null values
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

  // Afficher un état de chargement
  if (isLoading && !initialData) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5 sm:gap-2 md:gap-3 w-full">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="bg-[#151A25]/60 backdrop-blur-md border border-white/5 rounded-2xl p-4 flex items-center justify-center shadow-xl shadow-black/20">
            <Loader2 className="w-4 h-4 text-white/20 animate-spin" />
          </div>
        ))}
      </div>
    );
  }

  // Afficher une erreur
  if (error) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5 sm:gap-2 md:gap-3 w-full">
        <div className="col-span-full bg-rose-500/5 border border-rose-500/20 rounded-2xl p-4 text-center text-rose-400 text-sm backdrop-blur-md">
          Error: {error.message}
        </div>
      </div>
    );
  }

  const currentStats = stats || initialData;

  // Afficher les données
  const statsItems = currentStats ? [
    {
      title: "Users",
      value: formatStat(currentStats.numberOfUsers),
    },
    {
      title: "Daily Volume",
      value: formatStat(currentStats.dailyVolume, { prefix: '$', decimals: 2 }),
    },
    {
      title: "Bridged USDC",
      value: formatStat(currentStats.bridgedUsdc, { prefix: '$', decimals: 1 }),
    },
    {
      title: "HYPE Staked",
      value: formatStat(currentStats.totalHypeStake, { decimals: 1 }),
    },
    {
      title: "Vaults TVL",
      value: formatStat(currentStats.vaultsTvl, { prefix: '$', decimals: 1 }),
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
