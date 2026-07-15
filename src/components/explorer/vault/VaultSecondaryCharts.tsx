"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  AuroraHistogramChart,
  chartPalette,
  Skeleton,
  type HistogramDataPoint,
} from "@/components/common";
import { useVaultDailySnapshots } from "@/services/explorer/vault/hooks/useVaultDailySnapshots";
import { useVaultLedger } from "@/services/explorer/vault/hooks/useVaultLedger";
import { compactUsd } from "@/lib/formatters/numberFormatting";

interface VaultSecondaryChartsProps {
  vaultAddress: string;
}

const DAY_MS = 86_400_000;
const WINDOW_DAYS = 30;

/**
 * Two compact histograms always visible below the main 4-tab chart:
 * - Daily PnL · 30D — derived from dailySnapshots.totalRawPnl deltas.
 * - Net flows · 30D — derived from vaultLedger bucketed per day, signed.
 */
export function VaultSecondaryCharts({ vaultAddress }: VaultSecondaryChartsProps) {
  const { snapshots, isLoading: snapsLoading } = useVaultDailySnapshots({
    vaultAddress,
    limit: 60,
  });

  const { entries: ledger, isLoading: ledgerLoading } = useVaultLedger({
    vaultAddress,
    limit: 5000,
  });

  // dailySnapshots come newest-first — reverse to chronological for delta math.
  const dailyPnl = useMemo<HistogramDataPoint[]>(() => {
    if (snapshots.length < 2) return [];
    const chronological = [...snapshots].reverse();
    const cutoffTime = Date.now() - WINDOW_DAYS * DAY_MS;
    const pts: HistogramDataPoint[] = [];
    for (let i = 1; i < chronological.length; i++) {
      const prev = chronological[i - 1];
      const curr = chronological[i];
      if (curr.time < cutoffTime) continue;
      const delta = curr.totalRawPnl - prev.totalRawPnl;
      pts.push({
        time: curr.time,
        value: delta,
        color: delta >= 0 ? chartPalette.success : chartPalette.danger,
      });
    }
    return pts;
  }, [snapshots]);

  const netFlows = useMemo<HistogramDataPoint[]>(() => {
    if (!ledger.length) return [];
    const vaultLower = vaultAddress.toLowerCase();
    const cutoffTime = Date.now() - WINDOW_DAYS * DAY_MS;
    const buckets = new Map<number, number>();
    for (const e of ledger) {
      if (e.time < cutoffTime) continue;
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

  const pnlSum = useMemo(() => dailyPnl.reduce((acc, p) => acc + p.value, 0), [dailyPnl]);
  const flowSum = useMemo(() => netFlows.reduce((acc, p) => acc + p.value, 0), [netFlows]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.35 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-3"
    >
      <SecondaryChartCard
        title="Daily PnL"
        icon={<TrendingUp size={13} className="text-brand" />}
        tag="30D"
        summary={pnlSum}
        summaryLabel="net over window"
        data={dailyPnl}
        isLoading={snapsLoading}
      />
      <SecondaryChartCard
        title="Net flows"
        icon={<Activity size={13} className="text-brand" />}
        tag="30D"
        summary={flowSum}
        summaryLabel="deposits − withdrawals"
        data={netFlows}
        isLoading={ledgerLoading}
        // The indexer ledger returns nothing at all for some vaults (e.g. HLP);
        // say so explicitly instead of implying a quiet window.
        emptyMessage={
          ledger.length === 0
            ? "Ledger data unavailable for this vault."
            : "No flows in this window."
        }
      />
    </motion.div>
  );
}

interface SecondaryChartCardProps {
  title: string;
  icon: React.ReactNode;
  tag: string;
  summary: number;
  summaryLabel: string;
  data: HistogramDataPoint[];
  isLoading: boolean;
  /** Shown when there is no data to chart. */
  emptyMessage?: string;
}

function SecondaryChartCard({
  title,
  icon,
  tag,
  summary,
  summaryLabel,
  data,
  isLoading,
  emptyMessage = "No data for this window.",
}: SecondaryChartCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle">
        <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
          {icon}
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">{title}</h3>
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle">
          {tag}
        </span>
        {!isLoading && data.length > 0 && (
          <div className="ml-auto flex items-baseline gap-2">
            <span
              className={`mono text-sm font-semibold ${
                summary >= 0 ? "text-success" : "text-danger"
              }`}
            >
              {summary >= 0 ? "+" : "-"}
              {compactUsd(Math.abs(summary))}
            </span>
            <span className="text-[10px] text-text-tertiary">{summaryLabel}</span>
          </div>
        )}
      </div>
      <div className="px-3 py-3 h-[160px]">
        {isLoading ? (
          <Skeleton className="h-full rounded" />
        ) : data.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-text-tertiary text-xs">{emptyMessage}</p>
          </div>
        ) : (
          <AuroraHistogramChart
            data={data}
            defaultColor={chartPalette.accent}
            formatValue={(v) => compactUsd(v)}
          />
        )}
      </div>
    </Card>
  );
}
