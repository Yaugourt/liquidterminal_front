"use client";

import { memo } from "react";
import { Card } from "@/components/ui/card";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { usePerpDexGlobalStats } from "@/services/market/perpDex/hooks";
import { Loader2, BarChart3, Layers, Building2, TrendingUp } from "lucide-react";
import { useNumberFormat } from "@/store/number-format.store";

/**
 * Carte affichant les statistiques globales des PerpDexs (HIP-3)
 */
export const PerpDexStatsCard = memo(function PerpDexStatsCard() {
  const { stats, isLoading, error } = usePerpDexGlobalStats();
  const { format } = useNumberFormat();

  if (error) {
    return (
      <Card className="p-3 bg-[#051728E5] border border-[#83E9FF4D] shadow-sm backdrop-blur-sm hover:border-[#83E9FF66] transition-all rounded-md h-full">
        <div className="flex justify-center items-center h-full">
          <p className="text-red-500 text-sm">Failed to load stats</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-3 bg-[#051728E5] border border-[#83E9FF4D] shadow-sm backdrop-blur-sm hover:border-[#83E9FF66] transition-all rounded-md h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <BarChart3 size={18} className="text-[#f9e370]" />
          <h3 className="text-sm text-[#FFFFFF] font-medium tracking-wide">HIP-3 OVERVIEW</h3>
        </div>
        <span className="text-[10px] px-2 py-0.5 bg-[#f9e37020] text-[#f9e370] rounded-full font-medium">
          BUILDER PERPS
        </span>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="flex justify-center items-center flex-1">
          <Loader2 className="w-4 h-4 text-[#83E9FF] animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-8 gap-y-6 text-sm flex-1 content-center">
          {/* Total Dexs */}
          <div>
            <div className="text-white mb-2 flex items-center font-medium">
              <Building2 className="h-3.5 w-3.5 text-[#f9e370] mr-1.5" />
              Active DEXs
            </div>
            <div className="text-white font-medium text-xs pl-5">
              {stats?.totalDexs || 0}
            </div>
          </div>

          {/* Total Assets */}
          <div>
            <div className="text-white mb-2 flex items-center font-medium">
              <Layers className="h-3.5 w-3.5 text-[#f9e370] mr-1.5" />
              Total Markets
            </div>
            <div className="text-white font-medium text-xs pl-5">
              {stats?.totalAssets || 0}
            </div>
          </div>

          {/* Total OI Cap */}
          <div>
            <div className="text-white mb-2 flex items-center font-medium">
              <TrendingUp className="h-3.5 w-3.5 text-[#f9e370] mr-1.5" />
              Total OI Cap
            </div>
            <div className="text-white font-medium text-xs pl-5">
              {stats ? formatNumber(stats.totalOiCap, format, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 1,
                currency: '$',
                showCurrency: true
              }) : '$0'}
            </div>
          </div>

          {/* Avg Assets per DEX */}
          <div>
            <div className="text-white mb-2 flex items-center font-medium">
              <BarChart3 className="h-3.5 w-3.5 text-[#f9e370] mr-1.5" />
              Avg Markets/DEX
            </div>
            <div className="text-white font-medium text-xs pl-5">
              {stats?.avgAssetsPerDex?.toFixed(1) || 0}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
});

