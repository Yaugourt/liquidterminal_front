import { StatsCard } from "./StatsCard";
import { useEffect, useState } from "react";

export function StatsGrid() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<Array<{
    title: string;
    value: string;
    type: 'block' | 'blockTime' | 'transactions' | 'users';
  }>>([]);

  // Simulation d'un chargement de données
  useEffect(() => {
    const timer = setTimeout(() => {
      setStats([
        {
          title: "Block",
          value: "652,365,195",
          type: "block"
        },
        {
          title: "Block time",
          value: "13.5s",
          type: "blockTime"
        },
        {
          title: "Transactions",
          value: "2,856,947",
          type: "transactions"
        },
        {
          title: "Users",
          value: "8,254,103",
          type: "users"
        }
      ]);
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

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
