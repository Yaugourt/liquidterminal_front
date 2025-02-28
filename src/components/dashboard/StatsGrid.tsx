import { useEffect, useState } from "react";
import { StatsCard } from "./StatsCard";

interface DashboardStats {
  numberOfUsers: number;
  dailyVolume: number;
  bridgedUsdc: number;
  totalHypeStake: number;
}

export function StatsGrid() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:3001/pages/dashboard/globalstats");

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error("Erreur lors de la récupération des statistiques:", err);
        setError("Impossible de charger les statistiques");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Fonction pour formater les grands nombres
  const formatNumber = (num: number): string => {
    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(2)}B`;
    } else if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(2)}K`;
    } else {
      return num.toString();
    }
  };

  const statsItems = [
    { title: "Users", value: stats ? formatNumber(stats.numberOfUsers) : "..." },
    { title: "Daily Volume", value: stats ? formatNumber(stats.dailyVolume) : "..." },
    { title: "Bridged USDC", value: stats ? formatNumber(stats.bridgedUsdc) : "..." },
    { title: "HYPE Staked", value: stats ? formatNumber(stats.totalHypeStake) : "..." },
    { title: "Total Vault TVL", value: "Coming soon" },
  ];

  return (
    <div className="grid grid-cols-5 gap-2 lg:gap-4">
      {statsItems.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  );
}
