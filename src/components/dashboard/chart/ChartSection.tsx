"use client";

import { useCallback, useMemo, useState } from "react";
import {
  PeriodSelector,
  ChartLoading,
  ChartEmpty,
  ChartError,
  chartPalette,
  useChartPeriod,
  type ChartPeriod,
} from "@/components/common";
import { useChartTimeSeriesData, useFeesChartData } from "@/services/dashboard";
import { useLiquidationsHistoricalChart } from "@/services/explorer/liquidation";
import { useSpotStablecoins } from "@/services/market/stablecoins";
import { formatLargeNumber } from "@/lib/formatters/numberFormatting";
import { MultiSeriesAreaChart, MultiSeries } from "./MultiSeriesAreaChart";

/**
 * Dashboard ecosystem chart — superpose 3 séries macro de l'écosystème
 * Hyperliquid sur un graphe à double axe Y :
 *  - Bridge TVL          → axe gauche (milliards $) — DefiLlama
 *  - Stablecoins supply  → axe gauche (milliards $) — Hypurrscan `/spotUSDC`
 *  - Liquidations        → axe droit  (millions $)  — DB locale `/liquidations/historical/chart`
 *  - Total Fees          → axe droit  (millions $)  — Hypurrscan
 *
 * Les 4 sources sont robustes (aucune ne dépend de l'API hypedexer instable —
 * actuellement en 402 sur tous ses endpoints).
 * Bridge TVL est en milliards alors que Liquidations / Fees sont en millions :
 * on les sépare donc sur deux échelles Y pour éviter l'écrasement.
 */

const AVAILABLE_PERIODS: ChartPeriod[] = ["7d", "30d", "90d"];

export const ChartSection = () => {
  const [selectedCurrency] = useState<"HYPE" | "USDC">("USDC");
  const { selectedPeriod, handlePeriodChange, availablePeriods } =
    useChartPeriod({
      defaultPeriod: "30d",
      availablePeriods: AVAILABLE_PERIODS,
    });

  // Sources réelles — toutes en `{time, value}[]`.
  const bridge = useChartTimeSeriesData("bridge", selectedPeriod, selectedCurrency);
  const liquidations = useLiquidationsHistoricalChart(selectedPeriod);
  const totalFees = useFeesChartData(selectedPeriod, "all");
  const stables = useSpotStablecoins();

  /** Stablecoins : la série Hypurrscan n'est pas paramétrée — on filtre côté client. */
  const stablesData = useMemo(() => {
    const days = selectedPeriod === "7d" ? 7 : selectedPeriod === "30d" ? 30 : 90;
    const cutoff = Date.now() - days * 24 * 3600 * 1000;
    return stables.supplyChart.filter((p) => p.time >= cutoff);
  }, [stables.supplyChart, selectedPeriod]);

  const isLoading =
    bridge.isLoading ||
    liquidations.isLoading ||
    totalFees.isLoading ||
    stables.isLoading;
  const error =
    bridge.error ?? liquidations.error ?? totalFees.error ?? stables.error ?? null;

  // Hovered timestamp drives the legend values (crosshair). Null = show latest.
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const handleCrosshairMove = useCallback((time: number | null) => {
    setHoverTime(time);
  }, []);

  const formatUsd = useCallback(
    (value: number) => formatLargeNumber(value, { prefix: "$", decimals: 2 }),
    []
  );

  const series = useMemo<MultiSeries[]>(
    () => [
      {
        id: "bridgeTvl",
        name: "Bridge TVL",
        color: chartPalette.accent,
        axis: "left",
        data: bridge.data,
        formatValue: formatUsd,
      },
      {
        id: "stablecoins",
        name: "Stablecoins",
        color: chartPalette.violet,
        axis: "left",
        data: stablesData,
        formatValue: formatUsd,
      },
      {
        id: "liquidations",
        name: "Liquidations",
        color: chartPalette.down,
        axis: "right",
        data: liquidations.data,
        formatValue: formatUsd,
      },
      {
        id: "totalFees",
        name: "Fees",
        color: chartPalette.gold,
        axis: "right",
        data: totalFees.data,
        formatValue: formatUsd,
      },
    ],
    [bridge.data, stablesData, liquidations.data, totalFees.data, formatUsd]
  );

  const hasData = series.some((s) => s.data.length > 0);

  // Legend value per series: the point at the hovered timestamp, else latest.
  const getSeriesValue = useCallback(
    (s: MultiSeries): number | null => {
      if (s.data.length === 0) return null;
      if (hoverTime != null) {
        const match = s.data.find((p) => p.time === hoverTime);
        if (match) return match.value;
        return null;
      }
      return s.data[s.data.length - 1].value;
    },
    [hoverTime]
  );

  return (
    <div className="flex flex-col h-full">
      {/* card-head — title + tag + period segmented control */}
      <div className="flex items-center gap-2.5 px-3.5 py-2.5">
        <h3 className="text-[13px] font-semibold text-text-primary">
          Ecosystem Volume &amp; Flows
        </h3>
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle">
          USD
        </span>
        <div className="ml-auto">
          <PeriodSelector
            selected={selectedPeriod}
            onChange={handlePeriodChange}
            options={availablePeriods}
            variant="aurora"
          />
        </div>
      </div>

      {/* chart-legend — one entry per series: swatch + name + current value */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-3.5 pb-2">
        {series.map((s) => {
          const value = getSeriesValue(s);
          return (
            <div key={s.id} className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-sm"
                style={{ background: s.color }}
              />
              <span className="text-[11px] font-medium text-text-secondary">
                {s.name}
              </span>
              <span className="mono text-[11px] font-semibold text-text-primary ml-0.5">
                {value !== null ? s.formatValue(value) : "—"}
              </span>
            </div>
          );
        })}
      </div>

      {/* plot area */}
      <div className="flex-1 min-h-[280px] px-2 pb-2">
        {error ? (
          <ChartError />
        ) : isLoading ? (
          <ChartLoading />
        ) : !hasData ? (
          <ChartEmpty suggestion="Try selecting a different time period" />
        ) : (
          <MultiSeriesAreaChart
            series={series}
            height={280}
            onCrosshairMove={handleCrosshairMove}
          />
        )}
      </div>
    </div>
  );
};
