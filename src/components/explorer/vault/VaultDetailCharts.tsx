"use client";

import { useState, useMemo, useId } from "react";
import { LoadingState } from "@/components/ui/loading-state";
import { motion } from "framer-motion";
import { AuroraAreaChart, chartPalette } from "@/components/common";
import { useVaultDailySnapshots } from "@/services/explorer/vault/hooks/useVaultDailySnapshots";
import { useVaultEquitySnapshots } from "@/services/explorer/vault/hooks/useVaultEquitySnapshots";

const TABS = ["Account Value", "TVL History"] as const;
type Tab = (typeof TABS)[number];

const formatTvl = (v: number) =>
  v >= 1e6
    ? `$${(v / 1e6).toFixed(2)}M`
    : v >= 1e3
    ? `$${(v / 1e3).toFixed(1)}K`
    : `$${v.toFixed(2)}`;

interface VaultDetailChartsProps {
  vaultAddress: string;
}

export function VaultDetailCharts({ vaultAddress }: VaultDetailChartsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("Account Value");
  const layoutId = useId().replace(/:/g, "");

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
  const lineColor = activeTab === "Account Value" ? chartPalette.accent : chartPalette.gold;
  const glowColor =
    activeTab === "Account Value" ? "bg-brand/10" : "bg-gold/10";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.35 }}
      className="bg-surface border border-border-subtle rounded-lg relative overflow-hidden p-4"
    >
      {/* Ambient color glow tied to active tab */}
      <div
        className={`pointer-events-none absolute -top-24 -right-16 h-56 w-56 rounded-full ${glowColor} blur-3xl transition-colors`}
      />
      <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-white/[0.03] blur-3xl" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-tertiary">
          <span
            className="h-1 w-1 rounded-full"
            style={{ background: lineColor }}
          />
          Charts
        </div>
        <div className="flex items-center rounded-lg border border-border-subtle bg-black/30 p-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="relative rounded-lg px-3 py-1 text-[11px] font-semibold whitespace-nowrap"
              >
                {isActive && (
                  <motion.span
                    layoutId={`vault-detail-tab-${layoutId}`}
                    className="absolute inset-0 rounded-lg bg-white/[0.06] ring-1 ring-white/10"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                  />
                )}
                <span
                  className={`relative z-10 ${
                    isActive ? "text-text-primary" : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {tab}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart */}
      <div className="relative z-10 h-56">
        {isLoading ? (
          <LoadingState message="Loading chart…" size="sm" withCard={false} />
        ) : error ? (
          <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-4 text-center text-rose-400 text-sm h-full flex items-center justify-center">
            Failed to load chart data.
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-text-tertiary text-sm">No data available for this period.</p>
          </div>
        ) : (
          <AuroraAreaChart
            data={chartData}
            height={224}
            lineColor={lineColor}
            formatValue={formatTvl}
          />
        )}
      </div>
    </motion.div>
  );
}
