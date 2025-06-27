import { Card } from "@/components/ui/card";
import { Users, Timer, Zap, Activity, Coins } from "lucide-react";
import { ExplorerStatsCardProps } from "@/components/types/explorer.types";

export function StatsCard({ title, value, type }: ExplorerStatsCardProps) {
  // Fonction pour déterminer quelle icône afficher selon le type
  const getIcon = () => {
    switch (type) {
      case "block":
        return <Activity size={16} className="text-[#f9e370]" />;
      case "blockTime":
        return <Timer size={16} className="text-[#f9e370]" />;
      case "transactions":
        return <Zap size={16} className="text-[#f9e370]" />;
      case "users":
        return <Users size={16} className="text-[#f9e370]" />;
      case "hypeStaked":
        return <Coins size={16} className="text-[#f9e370]" />;
      default:
        return <Activity size={16} className="text-[#f9e370]" />;
    }
  };

  return (
    <Card className="p-3 bg-[#051728E5] border border-[#83E9FF4D] shadow-sm backdrop-blur-sm hover:border-[#83E9FF66] transition-all">
      <div className="flex items-center gap-1.5 mb-1.5">
        {getIcon()}
        <h3 className="text-[11px] text-[#FFFFFF] font-medium tracking-wide">{title}</h3>
      </div>
      
      <div className="flex items-baseline gap-1.5 ml-[24px]">
        <span className="text-sm text-white font-medium">
          {value}
        </span>
      </div>
    </Card>
  );
}
