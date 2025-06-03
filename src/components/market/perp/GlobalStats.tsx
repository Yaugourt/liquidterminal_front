import { memo } from "react";
import { Card } from "@/components/ui/card";
import { Loader2, Scale, BarChart2, Clock, Wallet } from "lucide-react";
import { usePerpGlobalStats } from "@/services/market/perp/hooks/usePerpGlobalStats";
import { formatNumber } from "@/lib/format";

function GlobalStatsComponent() {
  const { stats: globalStats, isLoading, error } = usePerpGlobalStats();

  if (error) {
    return (
      <Card className="bg-[#0A1F32]/80 backdrop-blur-sm border border-[#1E3851] p-5 rounded-xl shadow-md hover:border-[#83E9FF40] transition-all">
        <div className="flex justify-center items-center h-24">
          <p className="text-red-500">Une erreur est survenue lors du chargement des statistiques</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-[#0A1F32]/80 backdrop-blur-sm border border-[#1E3851] p-5 rounded-xl shadow-md hover:border-[#83E9FF40] transition-all">
      <div className="flex justify-between items-start mb-5">
        <h3 className="text-[15px] text-white font-medium font-serif">Market Stats</h3>
        {isLoading && <Loader2 className="w-4 h-4 text-[#83E9FF] animate-spin" />}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center p-4">
          <Loader2 className="w-5 h-5 text-[#83E9FF] animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          <div>
            <div className="text-[#FFFFFF80] text-xs mb-1 tracking-wide flex items-center">
              <Scale className="h-3.5 w-3.5 text-[#83E9FF80] mr-1.5" />
              Total Open Interest
            </div>
            <div className="text-white text-sm font-medium">
              ${formatNumber(globalStats?.totalOpenInterest || 0)}
            </div>
          </div>

          <div>
            <div className="text-[#FFFFFF80] text-xs mb-1 tracking-wide flex items-center">
              <BarChart2 className="h-3.5 w-3.5 text-[#83E9FF80] mr-1.5" />
              24h Volume
            </div>
            <div className="text-white text-sm font-medium">
              ${formatNumber(globalStats?.totalVolume24h || 0)}
            </div>
          </div>

          <div>
            <div className="text-[#FFFFFF80] text-xs mb-1 tracking-wide flex items-center">
              <Clock className="h-3.5 w-3.5 text-[#83E9FF80] mr-1.5" />
              Total liquidations 24h
            </div>
            <div className="text-white text-sm font-medium">
              {globalStats?.totalTrades24h ? `$${formatNumber(globalStats?.totalTrades24h)}` : "Coming soon"}
            </div>
          </div>

          <div>
            <div className="text-[#FFFFFF80] text-xs mb-1 tracking-wide flex items-center">
              <Wallet className="h-3.5 w-3.5 text-[#83E9FF80] mr-1.5" />
              HLP TVL
            </div>
            <div className="text-white text-sm font-medium">
              ${formatNumber(globalStats?.hlpTvl || 0)}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

export const GlobalStats = memo(GlobalStatsComponent); 