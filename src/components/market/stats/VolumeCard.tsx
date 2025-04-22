import { memo, useEffect, useState } from "react";
import { MarketStatsCard } from "../MarketStatsCard";
import { fetchGlobalStats, GlobalStats } from "@/services/markets/api";
import { formatNumberWithoutDecimals } from "./utils";

/**
 * Carte affichant le volume sur 24h et d'autres statistiques du marché
 */
export const VolumeCard = memo(function VolumeCard() {
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true);
        const data = await fetchGlobalStats();
        setStats(data);
      } catch (err) {
        console.error("Erreur lors du chargement des statistiques:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <MarketStatsCard 
      title="24h Volume"
      headerRight={
        <p className="text-[#83E9FF] text-lg font-semibold">
          {isLoading ? "--" : `$${formatNumberWithoutDecimals(stats?.totalVolume24h || 0)}`}
        </p>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
        <div>
          <p className="text-[#FFFFFF99] text-xs sm:text-sm">Total Market Cap:</p>
          <p className="text-white text-sm sm:text-base">
            {isLoading ? "--" : `$${formatNumberWithoutDecimals(stats?.totalMarketCap || 0)}`}
          </p>
        </div>
        <div>
          <p className="text-[#FFFFFF99] text-xs sm:text-sm">Total Pairs:</p>
          <p className="text-white text-sm sm:text-base">
            {isLoading ? "--" : stats?.totalPairs || 0}
          </p>
        </div>
        <div>
          <p className="text-[#FFFFFF99] text-xs sm:text-sm">Total USDC:</p>
          <p className="text-white text-sm sm:text-base">
            {isLoading ? "--" : `$${formatNumberWithoutDecimals(stats?.totalSpotUSDC || 0)}`}
          </p>
        </div>
        <div>
          <p className="text-[#FFFFFF99] text-xs sm:text-sm">Total HIP2:</p>
          <p className="text-white text-sm sm:text-base">
            {isLoading ? "--" : `$${formatNumberWithoutDecimals(stats?.totalHIP2 || 0)}`}
          </p>
        </div>
      </div>
    </MarketStatsCard>
  );
}); 