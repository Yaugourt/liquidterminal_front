"use client";

import { useMemo, type ReactNode } from "react";
import { Card } from "@/components/ui/card";
import {
  KpiRibbon,
  AuroraAreaChart,
  chartPalette,
  type KpiCell,
} from "@/components/common";
import type { MetricHistoryPoint } from "@/services/market/metrics";

interface MetricHistoryCardProps {
  title: string;
  subtitle: string;
  icon: ReactNode;
  /** Formats a value for the KPI and the y-axis (e.g. compactUsd, compactCount). */
  format: (v: number) => string;
  /** Label for the latest-value KPI cell. */
  latestLabel: string;
  /** Stored hourly history for this metric (owned by the parent section). */
  history: MetricHistoryPoint[];
}

/**
 * Trend of a self-sampled headline metric (total OI, active users) over the
 * trailing week. Presentational: the parent section owns the fetch and only
 * mounts this once history exists, so the card never shows a fake or empty
 * chart (there is no upstream backfill; the series accrues going forward).
 */
export function MetricHistoryCard({
  title,
  subtitle,
  icon,
  format,
  latestLabel,
  history,
}: MetricHistoryCardProps) {
  const model = useMemo(() => {
    const chartData = history
      .map((h) => ({ time: h.time, value: h.value }))
      .filter((p) => Number.isFinite(p.time) && Number.isFinite(p.value));
    if (chartData.length < 2) return null;

    const first = chartData[0].value;
    const latest = chartData[chartData.length - 1].value;
    const changePct = first > 0 ? ((latest - first) / first) * 100 : 0;

    return { chartData, latest, changePct };
  }, [history]);

  // Self-gate: nothing to chart yet (fresh table, still accruing).
  if (!model) return null;

  const cells: KpiCell[] = [
    { key: "latest", label: latestLabel, value: format(model.latest) },
    {
      key: "change",
      label: "7d change",
      value: `${model.changePct >= 0 ? "+" : ""}${model.changePct.toFixed(1)}%`,
      tone: model.changePct >= 0 ? "success" : "danger",
    },
  ];

  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle min-h-[44px]">
        {icon}
        <div className="flex flex-col leading-tight">
          <h3 className="text-[13px] font-semibold text-text-primary">{title}</h3>
          <span className="text-[10px] text-text-tertiary">{subtitle}</span>
        </div>
        <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle">
          7d · hourly
        </span>
      </div>
      <div className="p-3 space-y-3">
        <KpiRibbon cells={cells} />
        <div className="h-[160px]">
          <AuroraAreaChart
            data={model.chartData}
            height={150}
            lineColor={chartPalette.accent}
            formatValue={format}
          />
        </div>
      </div>
    </Card>
  );
}
