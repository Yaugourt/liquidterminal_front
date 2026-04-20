"use client";

import { useMemo, useState, useId } from "react";
import { motion } from "framer-motion";
import { AuroraAreaChart } from "@/components/common/charts/AuroraAreaChart";
import { AuroraHistogramChart } from "@/components/common/charts/AuroraHistogramChart";
import { ChartLoading, ChartEmpty } from "@/components/common/charts";
import type { BuilderTopRow } from "@/services/indexer/builders/types";

const TABS = ["Volume", "Builder Fees", "Fills"] as const;
type Tab = (typeof TABS)[number];

const fmt = (v: number) =>
  v >= 1e9
    ? `$${(v / 1e9).toFixed(2)}B`
    : v >= 1e6
    ? `$${(v / 1e6).toFixed(1)}M`
    : v >= 1e3
    ? `$${(v / 1e3).toFixed(1)}K`
    : `$${v.toFixed(0)}`;

const fmtFills = (v: number) =>
  v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `${(v / 1e3).toFixed(1)}K` : String(Math.round(v));

interface BuildersOverviewChartProps {
  rows: BuilderTopRow[];
  isLoading: boolean;
}

export function BuildersOverviewChart({ rows, isLoading }: BuildersOverviewChartProps) {
  const [activeTab, setActiveTab] = useState<Tab>("Volume");
  const layoutId = useId().replace(/:/g, "");

  // Use top-25 builders sorted by the active metric as histogram bars (rank → time axis)
  const chartData = useMemo(() => {
    if (!rows.length) return [];
    const sorted = [...rows].sort((a, b) => {
      if (activeTab === "Volume") return (b.totalVolume ?? 0) - (a.totalVolume ?? 0);
      if (activeTab === "Builder Fees") return (b.totalBuilderFees ?? 0) - (a.totalBuilderFees ?? 0);
      return (b.fillCount ?? 0) - (a.fillCount ?? 0);
    });
    return sorted.slice(0, 25).map((r, i) => ({
      time: i + 1, // rank as x axis
      value:
        activeTab === "Volume"
          ? r.totalVolume ?? 0
          : activeTab === "Builder Fees"
          ? r.totalBuilderFees ?? 0
          : r.fillCount ?? 0,
    }));
  }, [rows, activeTab]);

  // Area chart: cumulative volume across all builders (sorted by volume desc)
  const areaData = useMemo(() => {
    if (!rows.length) return [];
    const sorted = [...rows].sort((a, b) => (b.totalVolume ?? 0) - (a.totalVolume ?? 0));
    let cumul = 0;
    return sorted.map((r, i) => {
      cumul +=
        activeTab === "Volume"
          ? r.totalVolume ?? 0
          : activeTab === "Builder Fees"
          ? r.totalBuilderFees ?? 0
          : r.fillCount ?? 0;
      return { time: i + 1, value: cumul };
    });
  }, [rows, activeTab]);

  const lineColor =
    activeTab === "Volume" ? "#83e9ff" : activeTab === "Builder Fees" ? "#f9e370" : "#a78bfa";

  const glowColor =
    activeTab === "Volume"
      ? "bg-brand-accent/10"
      : activeTab === "Builder Fees"
      ? "bg-brand-gold/10"
      : "bg-violet-400/10";

  const formatValue = activeTab === "Fills" ? fmtFills : fmt;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.35 }}
      className="glass-panel relative overflow-hidden p-4 space-y-4"
    >
      <div
        className={`pointer-events-none absolute -top-24 -right-16 h-56 w-56 rounded-full ${glowColor} blur-3xl transition-colors duration-500`}
      />
      <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-white/[0.02] blur-3xl" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-muted">
          <span className="h-1 w-1 rounded-full" style={{ background: lineColor }} />
          Builder distribution
        </div>
        <div className="flex items-center rounded-xl border border-border-subtle bg-black/30 p-1">
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
                    layoutId={`builders-chart-tab-${layoutId}`}
                    className="absolute inset-0 rounded-lg bg-white/[0.06] ring-1 ring-white/10"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                  />
                )}
                <span className={`relative z-10 ${isActive ? "text-white" : "text-text-secondary hover:text-white"}`}>
                  {tab}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Two charts side by side */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Histogram — top 25 bars */}
        <div className="space-y-1">
          <p className="text-[10px] text-text-muted font-medium uppercase tracking-wider">Top 25 by rank</p>
          <div className="h-52">
            {isLoading ? (
              <ChartLoading />
            ) : chartData.length === 0 ? (
              <ChartEmpty message="No data" />
            ) : (
              <AuroraHistogramChart
                data={chartData}
                defaultColor={lineColor}
                formatValue={formatValue}
                formatTime={(v) => `#${v}`}
                yAxisWidth={activeTab === "Fills" ? 48 : 64}
              />
            )}
          </div>
        </div>

        {/* Area — cumulative */}
        <div className="space-y-1">
          <p className="text-[10px] text-text-muted font-medium uppercase tracking-wider">Cumulative (all builders)</p>
          <div className="h-52">
            {isLoading ? (
              <ChartLoading />
            ) : areaData.length === 0 ? (
              <ChartEmpty message="No data" />
            ) : (
              <AuroraAreaChart
                data={areaData}
                height={208}
                lineColor={lineColor}
                formatValue={formatValue}
                formatTime={(v) => `#${v}`}
                yAxisWidth={activeTab === "Fills" ? 48 : 64}
              />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
