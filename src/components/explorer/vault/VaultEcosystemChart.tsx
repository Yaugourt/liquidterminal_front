"use client";

import { useMemo, useState, useId } from "react";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { AuroraAreaChart } from "@/components/common/charts/AuroraAreaChart";
import { useVaultDetails } from "@/services/explorer/vault/hooks/useVaultDetails";
import { useVaults } from "@/services/explorer/vault/hooks/useVaults";

const HLP_ADDRESS = "0xdfc24b077bc1425ad1dea75bcb6f8158e10df303";
const TABS = ["TVL Trend", "Top 5 Vaults"] as const;
type Tab = (typeof TABS)[number];

const formatValue = (v: number) => {
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `$${(v / 1e3).toFixed(1)}K`;
  return `$${v.toFixed(0)}`;
};

export function VaultEcosystemChart() {
  const [activeTab, setActiveTab] = useState<Tab>("TVL Trend");
  const layoutId = useId().replace(/:/g, "");

  // Use the proven HL API path for account value / TVL trend
  const { chartData, isLoading: chartLoading, error: chartError } = useVaultDetails(
    HLP_ADDRESS,
    "allTime"
  );

  const { vaults, isLoading: vaultsLoading } = useVaults({ limit: 100, sortBy: "tvl" });

  // Chart data: accountValue history for HLP all-time
  const tvlChartData = useMemo(
    () =>
      chartData.map((d) => ({
        time: d.timestamp,
        value: d.accountValue,
      })),
    [chartData]
  );

  const top5 = useMemo(
    () =>
      [...vaults]
        .filter((v) => parseFloat(v.summary.tvl) > 0)
        .sort((a, b) => parseFloat(b.summary.tvl) - parseFloat(a.summary.tvl))
        .slice(0, 5),
    [vaults]
  );

  const maxTvl = useMemo(
    () => Math.max(...top5.map((v) => parseFloat(v.summary.tvl)), 1),
    [top5]
  );

  const isLoading = activeTab === "TVL Trend" ? chartLoading : vaultsLoading;

  return (
    <div className="glass-panel relative overflow-hidden p-4 flex flex-col">
      {/* Ambient glow blobs — Aurora aesthetic */}
      <div className="pointer-events-none absolute -top-24 -right-16 h-56 w-56 rounded-full bg-brand-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-brand-gold/[0.06] blur-3xl" />

      {/* Tab header */}
      <div className="relative z-10 flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-muted">
          <span className="h-1 w-1 rounded-full bg-brand-accent" />
          Ecosystem Overview
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
                    layoutId={`vault-eco-tab-${layoutId}`}
                    className="absolute inset-0 rounded-lg bg-white/[0.06] ring-1 ring-white/10"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                  />
                )}
                <span
                  className={`relative z-10 ${
                    isActive ? "text-white" : "text-text-secondary hover:text-white"
                  }`}
                >
                  {tab}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart area */}
      <div className="relative z-10 min-h-[220px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[220px]">
            <Loader2 className="h-6 w-6 animate-spin text-brand-accent mb-2" />
            <span className="text-text-muted text-sm">Loading chart data…</span>
          </div>
        ) : activeTab === "TVL Trend" ? (
          chartError ? (
            <div className="flex items-center justify-center h-[220px]">
              <p className="text-rose-400 text-sm">Failed to load TVL data.</p>
            </div>
          ) : tvlChartData.length === 0 ? (
            <div className="flex items-center justify-center h-[220px]">
              <p className="text-text-muted text-sm">No TVL data available.</p>
            </div>
          ) : (
            <div className="h-[220px]">
              <AuroraAreaChart
                data={tvlChartData}
                lineColor="#83e9ff"
                formatValue={formatValue}
              />
            </div>
          )
        ) : (
          /* Top 5 bars */
          <div className="flex flex-col gap-3 py-2">
            {top5.length === 0 ? (
              <p className="text-text-muted text-sm text-center">No vault data.</p>
            ) : (
              top5.map((vault, i) => {
                const tvl = parseFloat(vault.summary.tvl);
                const pct = (tvl / maxTvl) * 100;
                const colors = [
                  "bg-brand-accent",
                  "bg-brand-gold",
                  "bg-emerald-400",
                  "bg-violet-400",
                  "bg-orange-400",
                ];
                return (
                  <div key={vault.summary.vaultAddress} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-white font-medium truncate max-w-[180px] tabular-nums">
                        {i + 1}. {vault.summary.name}
                      </span>
                      <span className="text-xs text-text-secondary ml-2 shrink-0 tabular-nums">
                        {formatValue(tvl)}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${colors[i]} transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
