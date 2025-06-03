import { StatsCard } from "./StatsCard";
import { useEffect, useState } from "react";
import { useNumberFormat } from "@/store/number-format.store";
import { formatNumber } from "@/lib/formatting";

export function StatsGrid() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<Array<{
    title: string;
    value: string;
    type: 'block' | 'blockTime' | 'transactions' | 'users';
  }>>([]);
  const { format } = useNumberFormat();

  // Fonction pour formater les nombres selon le type
  const formatValue = (value: number, type: 'block' | 'blockTime' | 'transactions' | 'users') => {
    if (type === 'blockTime') {
      return `${value}s`;
    }
    return formatNumber(value, format);
  };

  // Simulation d'un chargement de données
  useEffect(() => {
    const timer = setTimeout(() => {
      setStats([
        {
          title: "Block",
          value: formatValue(652365195, "block"),
          type: "block"
        },
        {
          title: "Block time",
          value: formatValue(13.5, "blockTime"),
          type: "blockTime"
        },
        {
          title: "Transactions",
          value: formatValue(2856947, "transactions"),
          type: "transactions"
        },
        {
          title: "Users",
          value: formatValue(8254103, "users"),
          type: "users"
        }
      ]);
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [format]); // Ajouter format comme dépendance pour mettre à jour quand le format change

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
