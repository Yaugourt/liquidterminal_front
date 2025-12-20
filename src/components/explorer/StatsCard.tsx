import { Users, Timer, Zap, Activity, Wallet } from "lucide-react";
import { ExplorerStatsCardProps } from "@/components/types/explorer.types";
import Image from "next/image";

export function StatsCard({ title, value, type }: ExplorerStatsCardProps) {
  // Fonction pour déterminer quelle icône afficher selon le type
  const getIcon = () => {
    switch (type) {
      case "block":
        return <Activity size={16} className="text-brand-accent" />;
      case "blockTime":
        return <Timer size={16} className="text-brand-accent" />;
      case "transactions":
        return <Zap size={16} className="text-brand-accent" />;
      case "users":
        return <Users size={16} className="text-brand-accent" />;
      case "hypeStaked":
        return <Image
          src="https://app.hyperliquid.xyz/coins/HYPE_USDC.svg"
          alt="HYPE Logo"
          width={16}
          height={16}
        />;
      case "vaultsTvl":
        return <Wallet size={16} className="text-brand-accent" />;
      default:
        return <Activity size={16} className="text-brand-accent" />;
    }
  };

  return (
    <div className="bg-brand-secondary/60 backdrop-blur-md border border-border-subtle rounded-2xl p-4 hover:border-border-hover transition-all shadow-xl shadow-black/20 group">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-xl bg-brand-accent/10 flex items-center justify-center transition-transform group-hover:scale-110">
          {getIcon()}
        </div>
        <h3 className="text-[11px] text-text-secondary font-semibold uppercase tracking-wider">{title}</h3>
      </div>

      <span className="text-xl text-white font-bold tracking-tight">
        {value}
      </span>
    </div>
  );
}
