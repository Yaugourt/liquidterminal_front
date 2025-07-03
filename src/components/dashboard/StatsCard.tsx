import { Card } from "@/components/ui/card";
import { StatsCardProps } from "@/components/types/dashboard.types";
import { Users, BarChart3, CreditCard, Coins, Wallet } from "lucide-react";
import Image from "next/image";

export function StatsCard({ title, value, change, isLoading }: StatsCardProps) {
  // Fonction pour déterminer quelle icône afficher selon le titre
  const getIcon = () => {
    switch (title) {
      case "Users":
        return <Users size={16} className="text-[#f9e370]" />;
      case "Daily Volume":
        return <BarChart3 size={16} className="text-[#f9e370]" />;
      case "Bridged USDC":
        return <CreditCard size={16} className="text-[#f9e370]" />;
      case "HYPE Staked":
        return <Image 
          src="https://app.hyperliquid.xyz/coins/HYPE_USDC.svg" 
          alt="HYPE Logo" 
          width={16} 
          height={16}
        />;
      case "Vaults TVL":
        return <Wallet size={16} className="text-[#f9e370]" />;
      default:
        return null;
    }
  };

  return (
    <Card className="p-3 bg-[#051728E5] border border-[#83E9FF4D] shadow-sm backdrop-blur-sm hover:border-[#83E9FF66] transition-all rounded-md">
      <div className="flex items-center gap-1.5 mb-1.5">
        {getIcon()}
        <h3 className="text-[11px] text-[#FFFFFF] font-medium tracking-wide">{title}</h3>
      </div>
      
      {isLoading ? (
        <div className="h-6 bg-[#1692AD22] animate-pulse rounded ml-[24px]" />
      ) : (
        <div className="flex items-baseline gap-1.5 ml-[24px]">
          <span className="text-sm text-white font-medium">
            {value}
          </span>
          {change && (
            <span
              className={`text-[10px] ${
                change >= 0 ? "text-[#4ADE80]" : "text-[#FF5757]"
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
