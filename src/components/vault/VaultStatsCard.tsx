"use client";
import { Card } from "@/components/ui/card";
import { formatNumber } from "@/lib/formatting";
import { BarChart2, FolderOpen } from "lucide-react";
import { useVaults } from "@/services/vault/hooks/useVaults";
import { useNumberFormat } from "@/store/number-format.store";

export function VaultStatsCard() {
  const { totalTvl, totalCount, isLoading } = useVaults();
  const { format } = useNumberFormat();



  return (
    <Card className="p-3 bg-[#051728E5] border border-[#83E9FF4D] shadow-sm backdrop-blur-sm hover:border-[#83E9FF66] transition-all rounded-md w-fit">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-6 text-sm">
        {/* Total TVL */}
        <div>
          <div className="text-white mb-2 flex items-center font-medium">
            <BarChart2 className="h-3.5 w-3.5 text-[#f9e370] mr-1.5" />
            Total TVL
          </div>
          <div className="text-white font-medium text-xs pl-5">
            {isLoading ? (
              <span className="animate-pulse">--</span>
            ) : (
              <>${formatNumber(totalTvl, format, { maximumFractionDigits: 2 })}</>
            )}
          </div>
        </div>

        {/* Number of Vaults */}
        <div>
          <div className="text-white mb-2 flex items-center font-medium">
            <FolderOpen className="h-3.5 w-3.5 text-[#f9e370] mr-1.5" />
            Open Vaults
          </div>
          <div className="text-white font-medium text-xs pl-5">
            {isLoading ? (
              <span className="animate-pulse">--</span>
            ) : (
              totalCount
            )}
          </div>
        </div>
      </div>
    </Card>
  );
} 