"use client";

import { useState, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { LightweightChart } from "@/components/common/charts/LightweightChart";
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
    <div className="glass-panel p-4 flex flex-col">
      {/* Tab header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h3 className="text-sm font-semibold text-white">Ecosystem Overview</h3>
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

      {/* Chart area */}
      <div className="min-h-[220px]">
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
            <LightweightChart
              data={tvlChartData}
              height={220}
              lineColor="#83e9ff"
              formatValue={formatValue}
            />
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
                      <span className="text-xs text-white font-medium truncate max-w-[180px]">
                        {i + 1}. {vault.summary.name}
                      </span>
                      <span className="text-xs text-text-secondary ml-2 shrink-0">
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
