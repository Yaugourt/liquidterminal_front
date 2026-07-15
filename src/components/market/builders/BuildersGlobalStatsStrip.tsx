"use client";

import type { BuildersGlobalStatsPayload } from "@/services/indexer/builders/types";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { KpiRibbon } from "@/components/common";
import type { KpiCell } from "@/components/common";

interface BuildersGlobalStatsStripProps {
  stats: BuildersGlobalStatsPayload | null;
  isLoading: boolean;
  error: Error | null;
}

function deltaSub(change: number | null | undefined) {
  if (change === undefined || change === null || !Number.isFinite(change)) return undefined;
  const rounded = Number(change.toFixed(1));
  const positive = rounded >= 0;
  return (
    <span className={`mono text-[11px] font-medium ${positive ? "text-success" : "text-danger"}`}>
      {positive ? "+" : ""}
      {rounded}%
    </span>
  );
}

export function BuildersGlobalStatsStrip({ stats, isLoading, error }: BuildersGlobalStatsStripProps) {
  const { format } = useNumberFormat();

  if (error) {
    // Never surface the raw error payload (Zod dumps JSON in `message`).
    return (
      <div className="bg-surface border border-danger/30 rounded-lg p-3 text-center text-sm">
        <span className="text-danger font-medium">Builder stats unavailable.</span>{" "}
        <span className="text-text-tertiary">The indexer did not return usable data, it refreshes automatically.</span>
      </div>
    );
  }

  const placeholder = isLoading && !stats ? <span className="text-text-tertiary">…</span> : "—";

  const cells: KpiCell[] = [
    {
      key: "Volume",
      label: "Volume",
      value: stats
        ? formatNumber(stats.current.totalVolume, format, { maximumFractionDigits: 0, currency: "$", showCurrency: true })
        : placeholder,
      sub: deltaSub(stats?.variations?.totalVolumePct),
    },
    {
      key: "Builder Fees",
      label: "Builder Fees",
      value: stats
        ? formatNumber(stats.current.totalBuilderFees, format, { maximumFractionDigits: 0, currency: "$", showCurrency: true })
        : placeholder,
      sub: deltaSub(stats?.variations?.totalBuilderFeesPct),
    },
    {
      key: "Unique Users",
      label: "Unique Users",
      value: stats
        ? formatNumber(stats.current.uniqueUsers, format, { maximumFractionDigits: 0 })
        : placeholder,
      sub: deltaSub(stats?.variations?.uniqueUsersPct),
    },
    {
      key: "Fills",
      label: "Fills",
      value: stats
        ? formatNumber(stats.current.fillCount, format, { maximumFractionDigits: 0 })
        : placeholder,
      sub: deltaSub(stats?.variations?.fillCountPct),
    },
  ];

  return <KpiRibbon cells={cells} />;
}
