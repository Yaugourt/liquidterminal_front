"use client";
import { Card } from "@/components/ui/card";
import { formatNumber } from "@/lib/numberFormatting";
import { BarChart2, FolderOpen } from "lucide-react";
import { useVaults } from "@/services/explorer/vault/hooks/useVaults";
import { useNumberFormat } from "@/store/number-format.store";

export function VaultStatsCard() {
  const { totalTvl, totalCount, isLoading } = useVaults();
  const { format } = useNumberFormat();

  return (
    <div className="flex flex-col gap-4">
      {/* Total TVL Card */}
      <Card className="p-4 bg-[#051728E5] border border-[#83E9FF4D] shadow-sm backdrop-blur-sm hover:border-[#83E9FF66] transition-all rounded-md">
        <div className="flex flex-col">
          <div className="text-white mb-3 flex items-center font-medium">
            <BarChart2 className="h-4 w-4 text-[#f9e370] mr-2" />
            <span className="text-sm">Total TVL</span>
          </div>
          <div className="text-white font-medium text-base pl-6">
            {isLoading ? (
              <span className="animate-pulse">--</span>
            ) : (
              <>${formatNumber(totalTvl, format, { maximumFractionDigits: 2 })}</>
            )}
          </div>
        </div>
      </Card>

      {/* Number of Vaults Card */}
      <Card className="p-4 bg-[#051728E5] border border-[#83E9FF4D] shadow-sm backdrop-blur-sm hover:border-[#83E9FF66] transition-all rounded-md">
        <div className="flex flex-col">
          <div className="text-white mb-3 flex items-center font-medium">
            <FolderOpen className="h-4 w-4 text-[#f9e370] mr-2" />
            <span className="text-sm">Open Vaults</span>
          </div>
          <div className="text-white font-medium text-base pl-6">
            {isLoading ? (
              <span className="animate-pulse">--</span>
            ) : (
              totalCount
            )}
          </div>
        </div>
      </Card>
    </div>
  );
} 