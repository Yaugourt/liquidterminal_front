import { StatsCardProps } from "@/components/types/dashboard.types";
import { Users, Wallet, Database, Activity, Shield } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";

export function StatsCard({ title, value, change, isLoading }: StatsCardProps) {
  // Fonction pour déterminer quelle icône afficher selon le titre
  const getIcon = () => {
    switch (title) {
      case "Users":
        return <Users size={16} className="text-brand-accent" />;
      case "Daily Volume":
        return <Activity size={16} className="text-brand-accent" />;
      case "Bridged USDC":
        return <Wallet size={16} className="text-brand-accent" />;
      case "HYPE Staked":
        return <Shield size={16} className="text-brand-accent" />;
      case "Vaults TVL":
        return <Database size={16} className="text-brand-accent" />;
      default:
        return null;
    }
  };

  const getIconBg = () => {
    return "bg-brand-accent/10";
  };

  return (
    <GlassPanel className="p-4 hover:border-white/10 transition-all group">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-8 h-8 rounded-xl ${getIconBg()} flex items-center justify-center transition-transform group-hover:scale-110`}>
          {getIcon()}
        </div>
        <h3 className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">{title}</h3>
      </div>

      {isLoading ? (
        <div className="h-7 bg-white/5 animate-pulse rounded w-24" />
      ) : (
        <div className="flex items-baseline gap-2">
          <span className="text-xl text-white font-bold tracking-tight">
            {value}
          </span>
          {change && (
            <span
              className={`text-xs font-medium px-1.5 py-0.5 rounded-md ${change >= 0 ? "bg-brand-accent/10 text-brand-accent" : "bg-rose-500/20 text-rose-400"
                }`}
            >
              {change >= 0 ? "+" : ""}
              {change}%
            </span>
          )}
        </div>
      )}
    </GlassPanel>
  );
}
