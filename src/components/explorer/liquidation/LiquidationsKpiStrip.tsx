"use client";

import { KpiRibbon, StackedShareBar, type KpiCell } from "@/components/common";
import { compactUsd, compactCount } from "@/lib/formatters/numberFormatting";
import { useLiquidationsContext } from "./LiquidationsContext";

/**
 * KPI ribbon for the Liquidations page (§7.b via <KpiRibbon>).
 *
 * Single 24h snapshot: the backend serves the same stats for every window it
 * advertises, so a period selector here would be cosmetic (see the context).
 * The long/short cell carries the real volume split as a <StackedShareBar>;
 * no sparkline anywhere — the stats endpoint exposes no per-metric history.
 */
export function LiquidationsKpiStrip() {
  const { stats, statsLoading, statsAvailable } = useLiquidationsContext();
  // "…" while the first fetch is in flight, "—" if the endpoint never answered
  // (no fake $0 snapshot — DS "no fake data").
  const ph = statsLoading ? "…" : "—";
  const pending = () => statsLoading || !statsAvailable;

  const totalVolume = stats.longVolume + stats.shortVolume;
  const longPct = totalVolume > 0 ? (stats.longVolume / totalVolume) * 100 : 0;
  const shortPct = totalVolume > 0 ? 100 - longPct : 0;

  const cells: KpiCell[] = [
    {
      label: "Volume · 24h",
      value: pending() ? ph : compactUsd(stats.totalVolume),
      sub: "forced closures",
    },
    {
      label: "Liquidations · 24h",
      value: pending() ? ph : compactCount(stats.liquidationsCount),
      sub: "events",
    },
    {
      label: "Long / Short",
      value: pending() ? (
        ph
      ) : (
        <>
          <span className="text-success">{compactCount(stats.longCount)}</span>
          <span className="text-text-tertiary mx-1.5">/</span>
          <span className="text-danger">{compactCount(stats.shortCount)}</span>
        </>
      ),
      sub: pending() || totalVolume === 0
        ? "volume split"
        : `${longPct.toFixed(0)}% / ${shortPct.toFixed(0)}% of volume`,
      sparkline:
        totalVolume > 0 ? (
          <StackedShareBar
            height={4}
            segments={[
              { value: stats.longVolume, colorClass: "bg-success", label: `Long ${compactUsd(stats.longVolume)}` },
              { value: stats.shortVolume, colorClass: "bg-danger", label: `Short ${compactUsd(stats.shortVolume)}` },
            ]}
          />
        ) : undefined,
    },
    {
      label: "Avg size",
      value: pending() ? ph : compactUsd(stats.avgSize),
      sub: "per liquidation",
    },
    {
      label: "Max liquidation",
      value: pending() ? ph : compactUsd(stats.maxLiq),
      tone: "danger",
      sub: "largest single event",
    },
    {
      label: "Top coin",
      value: pending() ? ph : stats.topCoin,
      sub: "by volume",
    },
  ];

  // 2 columns × 3 rows: the ribbon sits beside the history chart and fills its
  // height, so the cells stretch instead of leaving a gap under the strip.
  return (
    <KpiRibbon
      cells={cells}
      columns="grid-cols-2"
      className="flex-1 [&>div]:h-full"
    />
  );
}
