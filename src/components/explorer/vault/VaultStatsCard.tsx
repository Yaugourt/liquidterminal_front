"use client";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { BarChart2, FolderOpen, Database } from "lucide-react";
import { useVaults } from "@/services/explorer/vault/hooks/useVaults";
import { useNumberFormat } from "@/store/number-format.store";

export function VaultStatsCard() {
  const { totalTvl, totalCount, isLoading } = useVaults();
  const { format } = useNumberFormat();

  return (
    <div className="p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-xl bg-[#83e9ff]/10 flex items-center justify-center">
          <Database size={16} className="text-[#83e9ff]" />
        </div>
        <h3 className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">
          Vault Stats
        </h3>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 flex-1 content-center">
        {/* Total TVL */}
        <div>
          <div className="text-zinc-400 mb-1 flex items-center text-xs font-medium">
            <BarChart2 className="h-3.5 w-3.5 text-[#83e9ff] mr-1.5" />
            Total TVL
          </div>
          <div className="text-white font-bold text-xl pl-5">
            {isLoading ? (
              <span className="animate-pulse text-zinc-600">--</span>
            ) : (
              <>${formatNumber(totalTvl, format, { maximumFractionDigits: 2 })}</>
            )}
          </div>
        </div>

        {/* Open Vaults */}
        <div>
          <div className="text-zinc-400 mb-1 flex items-center text-xs font-medium">
            <FolderOpen className="h-3.5 w-3.5 text-[#83e9ff] mr-1.5" />
            Open Vaults
          </div>
          <div className="text-white font-bold text-xl pl-5">
            {isLoading ? (
              <span className="animate-pulse text-zinc-600">--</span>
            ) : (
              totalCount
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 