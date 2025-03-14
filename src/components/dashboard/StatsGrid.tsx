import { useEffect, useState } from "react";
import { StatsCard } from "./StatsCard";
import { Database } from "lucide-react";

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

  // Afficher l'état de chargement
  if (loading) return <div className="text-center py-4 text-white">Chargement des statistiques...</div>;
  
  // Si erreur ou pas de données, afficher un message élégant
  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center bg-[#051728E5] border-2 border-[#83E9FF4D] rounded-lg shadow-[0_4px_24px_0_rgba(0,0,0,0.25)]">
        <Database className="w-10 h-10 mb-4 text-[#83E9FF4D]" />
        <p className="text-white text-lg">Données non disponibles</p>
        <p className="text-[#FFFFFF80] text-sm mt-2">Consultez à nouveau ultérieurement pour les informations mises à jour</p>
      </div>
    );
  }

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
      value: formatNumber(stats.numberOfUsers),
    },
    {
      title: "Daily volume",
      value: `$${formatNumber(stats.dailyVolume)}`,
    },
    {
      title: "Bridged USDC",
      value: `${formatNumber(stats.bridgedUsdc)}M`,
    },
    {
      title: "HYPE Staked",
      value: formatNumber(stats.totalHypeStake),
    },
    { title: "Total vault TVL", value: "$557.19M" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 md:gap-4 w-full">
      {statsItems.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  );
}
