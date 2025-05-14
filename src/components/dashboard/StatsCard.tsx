import { Card } from "@/components/ui/card";
import { StatsCardProps } from "@/components/types/dashboard.types";
import { Users, BarChart3, CreditCard, Coins, Wallet } from "lucide-react";

export function StatsCard({ title, value, change, isLoading }: StatsCardProps) {
  // Fonction pour déterminer quelle icône afficher selon le titre
  const getIcon = () => {
    switch (title) {
      case "Users":
        return <Users size={20} className="text-[#83E9FF]" />;
      case "Daily Volume":
        return <BarChart3 size={20} className="text-[#83E9FF]" />;
      case "Bridged USDC":
        return <CreditCard size={20} className="text-[#83E9FF]" />;
      case "HYPE Staked":
        return <Coins size={20} className="text-[#83E9FF]" />;
      case "Vaults TVL":
        return <Wallet size={20} className="text-[#83E9FF]" />;
      default:
        return null;
    }
  };

  return (
    <Card className="p-4 bg-[#051728E5] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm hover:border-[#83E9FF66] transition-all">
      <div className="flex items-center gap-2 mb-2">
        {getIcon()}
        <h3 className="text-xs sm:text-sm text-[#FFFFFF99] font-serif">{title}</h3>
      </div>
      
      {isLoading ? (
        <div className="h-8 bg-[#1692AD22] animate-pulse rounded" />
      ) : (
        <div className="flex items-baseline gap-2">
          <span className="text-base sm:text-lg text-white ">
            {value}
          </span>
          {change && (
            <span
              className={`text-xs ${
                change >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {change >= 0 ? "+" : ""}
              {change}%
            </span>
          )}
        </div>
      )}
    </Card>
  );
}
