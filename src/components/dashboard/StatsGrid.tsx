import { useDashboardStats } from "@/services/dashboard/hooks/useDashboardStats";
import { StatsCard } from "./StatsCard";
import { Loader2 } from "lucide-react";
import { formatFullNumber } from "@/lib/formatting";

export function StatsGrid() {
  const { stats, isLoading, error } = useDashboardStats();

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
      value: formatFullNumber(stats.numberOfUsers),
    },
    {
      title: "Daily Volume",
      value: formatFullNumber(stats.dailyVolume, { prefix: '$' }),
    },
    {
      title: "Bridged USDC",
      value: formatFullNumber(stats.bridgedUsdc, { prefix: '$' }),
    },
    {
      title: "HYPE Staked",
      value: formatFullNumber(stats.totalHypeStake),
    },
    {
      title: "Vaults TVL",
      value: formatFullNumber(stats.vaultsTvl, { prefix: '$' }),
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
