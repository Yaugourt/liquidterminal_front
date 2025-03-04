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
        const response = await fetch(
          "http://localhost:3001/pages/dashboard/globalstats"
        );

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
    {
      title: "User",
      value: stats ? formatNumber(stats.numberOfUsers) : "460 000",
    },
    {
      title: "Daily volume",
      value: stats ? `$${formatNumber(stats.dailyVolume)}` : "$4.7B",
    },
    {
      title: "Bridged USDC",
      value: stats ? `${formatNumber(stats.bridgedUsdc)}M` : "1.7M",
    },
    {
      title: "HYPE Staked",
      value: stats ? formatNumber(stats.totalHypeStake) : "427,19M",
    },
    { title: "Total vault TVL", value: "$557.19M" },
  ];

  return (
    <div className="flex gap-4 w-full justify-between items-center">
      {statsItems.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  );
}
