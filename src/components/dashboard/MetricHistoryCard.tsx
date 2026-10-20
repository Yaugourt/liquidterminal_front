"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import {
  CardHead,
  KpiRibbon,
  AuroraAreaChart,
  ShareTile,
  chartPalette,
  type KpiCell,
} from "@/components/common";
import type { MetricHistoryPoint } from "@/services/market/metrics";

interface MetricHistoryCardProps {
  title: string;
  subtitle: string;
  /** Formats a value for the KPI and the y-axis (e.g. compactUsd, compactCount). */
  format: (v: number) => string;
  /** Label for the latest-value KPI cell. */
  latestLabel: string;
  /** Stored hourly history for this metric (owned by the parent section). */
  history: MetricHistoryPoint[];
  /** Tile endpoint for the "copy as image" button. Omitted = no share button. */
  shareSrc?: string;
  /** Basename used by the share button's download fallback. */
  shareFilename?: string;
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
  format,
  latestLabel,
  history,
  shareSrc,
  shareFilename,
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
      <CardHead
        title={title}
        subtitle={subtitle}
        tag="7d · hourly"
        actions={
          shareSrc ? (
            <ShareTile src={shareSrc} filename={shareFilename ?? "metric"} />
          ) : undefined
        }
      />
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
