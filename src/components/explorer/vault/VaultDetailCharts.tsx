"use client";

import { useState, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { LightweightChart } from "@/components/common/charts/LightweightChart";
import { useVaultDailySnapshots } from "@/services/explorer/vault/hooks/useVaultDailySnapshots";
import { useVaultEquitySnapshots } from "@/services/explorer/vault/hooks/useVaultEquitySnapshots";

const TABS = ["Account Value", "TVL History"] as const;
type Tab = (typeof TABS)[number];

interface VaultDetailChartsProps {
  vaultAddress: string;
}

export function VaultDetailCharts({ vaultAddress }: VaultDetailChartsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("Account Value");

  const { snapshots: equitySnaps, isLoading: equityLoading, error: equityError } =
    useVaultEquitySnapshots({ vaultAddress, limit: 500 });

  const { snapshots: dailySnaps, isLoading: dailyLoading, error: dailyError } =
    useVaultDailySnapshots({ vaultAddress, limit: 500 });

  // equitySnaps sorted newest-first → reverse for chronological chart display
  const accountValueData = useMemo(
    () =>
      [...equitySnaps].reverse().map((s) => ({
        time: s.time,
        value: s.accountValue,
      })),
    [equitySnaps]
  );

  // dailySnaps also newest-first → reverse for chart
  const tvlData = useMemo(
    () =>
      [...dailySnaps].reverse().map((s) => ({
        time: s.time,
        value: s.accountValue,
      })),
    [dailySnaps]
  );

  const isLoading = activeTab === "Account Value" ? equityLoading : dailyLoading;
  const error = activeTab === "Account Value" ? equityError : dailyError;
  const chartData = activeTab === "Account Value" ? accountValueData : tvlData;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.35 }}
      className="glass-panel p-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Charts</h3>
        <div className="flex gap-1 bg-brand-primary/60 rounded-lg p-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-[11px] font-medium px-3 py-1.5 rounded-md transition-all ${
                activeTab === tab
                  ? "bg-brand-accent/15 text-brand-accent"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-56">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-brand-accent mb-2" />
            <span className="text-text-muted text-sm">Loading chart…</span>
          </div>
        ) : error ? (
          <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-4 text-center text-rose-400 text-sm h-full flex items-center justify-center">
            Failed to load chart data.
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-text-muted text-sm">No data available for this period.</p>
          </div>
        ) : (
          <LightweightChart
            data={chartData}
            height={224}
            lineColor={activeTab === "Account Value" ? "#83e9ff" : "#f9e370"}
            formatValue={(v) =>
              v >= 1e6
                ? `$${(v / 1e6).toFixed(2)}M`
                : v >= 1e3
                ? `$${(v / 1e3).toFixed(1)}K`
                : `$${v.toFixed(2)}`
            }
          />
        )}
      </div>
    </motion.div>
  );
}
