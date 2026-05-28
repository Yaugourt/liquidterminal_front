"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { LoadingState } from "@/components/ui/loading-state";
import { PillTabs } from "@/components/ui/pill-tabs";
import {
  AuroraAreaChart,
  AuroraHistogramChart,
  chartPalette,
  type HistogramDataPoint,
} from "@/components/common";
import { compactUsd, compactCount } from "@/lib/formatters/numberFormatting";
import { useVaultEquitySnapshots } from "@/services/explorer/vault/hooks/useVaultEquitySnapshots";
import { useVaultLedger } from "@/services/explorer/vault/hooks/useVaultLedger";

const TABS = [
  { value: "equity", label: "Equity" },
  { value: "pnl", label: "PnL" },
  { value: "flow", label: "Net Flow" },
  { value: "followers", label: "Followers" },
] as const;
type TabId = (typeof TABS)[number]["value"];

const DAY_MS = 86_400_000;

interface VaultDetailChartsProps {
  vaultAddress: string;
}

export function VaultDetailCharts({ vaultAddress }: VaultDetailChartsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("equity");

  const { snapshots, isLoading: snapsLoading, error: snapsError } = useVaultEquitySnapshots({
    vaultAddress,
    limit: 500,
  });

  const { entries: ledger, isLoading: ledgerLoading, error: ledgerError } = useVaultLedger({
    vaultAddress,
    limit: 2000,
  });

  // Snapshots come newest-first; reverse for chronological charting.
  const equityData = useMemo(
    () => [...snapshots].reverse().map((s) => ({ time: s.time, value: s.accountValue })),
    [snapshots]
  );

  const pnlData = useMemo(
    () => [...snapshots].reverse().map((s) => ({ time: s.time, value: s.totalRawPnl })),
    [snapshots]
  );

  const followersData = useMemo(
    () => [...snapshots].reverse().map((s) => ({ time: s.time, value: s.followerCount })),
    [snapshots]
  );

  // Daily net flow: bucket ledger by day, sign +deposit / -withdraw.
  const flowData = useMemo<HistogramDataPoint[]>(() => {
    if (!ledger.length) return [];
    const vaultLower = vaultAddress.toLowerCase();
    const buckets = new Map<number, number>();
    for (const e of ledger) {
      const day = Math.floor(e.time / DAY_MS) * DAY_MS;
      const signed = e.userTo.toLowerCase() === vaultLower ? e.amount : -e.amount;
      buckets.set(day, (buckets.get(day) ?? 0) + signed);
    }
    return Array.from(buckets.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([time, value]) => ({
        time,
        value,
        color: value >= 0 ? chartPalette.success : chartPalette.danger,
      }));
  }, [ledger, vaultAddress]);

  const isLoading =
    activeTab === "flow" ? ledgerLoading : snapsLoading;
  const error = activeTab === "flow" ? ledgerError : snapsError;

  const renderChart = () => {
    if (isLoading) {
      return <LoadingState message="Loading chart…" size="sm" withCard={false} />;
    }
    if (error) {
      return (
        <div className="bg-danger/5 border border-danger/20 rounded-lg p-4 text-center text-danger text-sm h-full flex items-center justify-center">
          Failed to load chart data.
        </div>
      );
    }
    switch (activeTab) {
      case "equity":
        return equityData.length ? (
          <AuroraAreaChart
            data={equityData}
            height={240}
            lineColor={chartPalette.accent}
            formatValue={(v) => compactUsd(v)}
          />
        ) : (
          <EmptyState />
        );
      case "pnl":
        return pnlData.length ? (
          <AuroraAreaChart
            data={pnlData}
            height={240}
            lineColor={
              pnlData[pnlData.length - 1].value >= 0
                ? chartPalette.success
                : chartPalette.danger
            }
            formatValue={(v) => compactUsd(v)}
          />
        ) : (
          <EmptyState />
        );
      case "flow":
        return flowData.length ? (
          <AuroraHistogramChart
            data={flowData}
            defaultColor={chartPalette.accent}
            formatValue={(v) => compactUsd(v)}
          />
        ) : (
          <EmptyState />
        );
      case "followers":
        return followersData.length ? (
          <AuroraAreaChart
            data={followersData}
            height={240}
            lineColor={chartPalette.gold}
            formatValue={(v) => compactCount(v)}
          />
        ) : (
          <EmptyState />
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.35 }}
      className="bg-surface border border-border-subtle rounded-lg p-4"
    >
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-tertiary">
          <span className="h-1 w-1 rounded-full bg-brand" />
          Performance
        </div>
        <PillTabs
          activeTab={activeTab}
          onTabChange={(v) => setActiveTab(v as TabId)}
          tabs={TABS.map((t) => ({ value: t.value, label: t.label }))}
        />
      </div>

      <div className="h-60">{renderChart()}</div>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-text-tertiary text-sm">No data available for this period.</p>
    </div>
  );
}
