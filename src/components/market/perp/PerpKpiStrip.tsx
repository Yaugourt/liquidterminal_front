"use client";

import { useMemo } from "react";
import { KpiRibbon, Sparkline, chartPalette, type KpiCell } from "@/components/common";
import { compactUsd, compactCount, formatPrice } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { usePerpGlobalStats } from "@/services/market/perp/hooks/usePerpGlobalStats";
import { useFeesStats } from "@/services/market/fees/hooks/useFeesStats";
import type { UsePerpDirectoryResult } from "@/services/market/perp/hooks/usePerpDirectory";
import { FLAGSHIP_PERP } from "@/services/market/perp/hooks/usePerpDirectory";
import type { UseFeesHistoryResult } from "@/services/market/fees/types";
import type { TokenCandle } from "@/services/market/token/types";
import { dailyPerpFeeDeltas, candleCloses } from "./perpSeries";

interface PerpKpiStripProps {
  directory: UsePerpDirectoryResult;
  feesHistory: UseFeesHistoryResult;
  flagshipCandles: TokenCandle[];
}

/**
 * KPI ribbon for /market/perp (§7.b via <KpiRibbon>).
 *
 * Honest-data choices:
 *  - "Perp fees" is derived as `dailyFees − dailySpotFees`; the API has no
 *    dedicated perp-fees field, and protocol-wide `dailyFees` would double-count
 *    the spot share.
 *  - Open interest has no exposed history, so its cell carries no sparkline —
 *    only fees (real deltas) and the flagship perp (real candles) get one.
 *  - "Perps listed" counts markets with non-zero 24h volume (the backend floor).
 */
export function PerpKpiStrip({ directory, feesHistory, flagshipCandles }: PerpKpiStripProps) {
  const { format } = useNumberFormat();
  const { stats, isLoading: statsLoading } = usePerpGlobalStats();
  const { feesStats } = useFeesStats();

  const feeDeltas = useMemo(
    () => dailyPerpFeeDeltas(feesHistory.feesHistory).map((p) => p.value),
    [feesHistory.feesHistory]
  );
  const flagshipSeries = useMemo(
    () => candleCloses(flagshipCandles).map((p) => p.value),
    [flagshipCandles]
  );

  const ph = statsLoading ? "…" : "—";
  const flagship = directory.flagship;
  const perpFees = feesStats ? Math.max(0, feesStats.dailyFees - feesStats.dailySpotFees) : null;
  const feeShare =
    feesStats && perpFees !== null && feesStats.dailyFees > 0
      ? (perpFees / feesStats.dailyFees) * 100
      : null;
  const pairs = stats?.totalPairs ?? directory.totalCount;

  const cells: KpiCell[] = [
    {
      label: "Perp volume · 24h",
      value: stats ? compactUsd(stats.totalVolume24h) : ph,
      sub: pairs ? `across ${pairs} perps` : "…",
    },
    {
      label: "Perp fees · 24h",
      value: perpFees !== null ? compactUsd(perpFees) : ph,
      tone: "gold",
      sub: feeShare !== null ? `${feeShare.toFixed(1)}% of protocol fees` : "share unknown",
      sparkline:
        feeDeltas.length >= 2 ? (
          <Sparkline data={feeDeltas} color={chartPalette.gold} height={18} />
        ) : undefined,
    },
    {
      label: "Open interest",
      value: stats ? compactUsd(stats.totalOpenInterest) : ph,
      sub: pairs ? `across ${pairs} markets` : "…",
    },
    {
      label: "HLP TVL",
      value: stats ? compactUsd(stats.hlpTvl) : ph,
      sub: "protocol market-maker vault",
    },
    {
      label: "Perps listed",
      value: pairs ? compactCount(pairs) : ph,
      sub: "with 24h volume",
    },
    {
      label: `${FLAGSHIP_PERP} perp`,
      value: flagship ? formatPrice(flagship.price, format) : ph,
      sub: flagship ? (
        <>
          <span className={`mono ${flagship.change24h >= 0 ? "text-success" : "text-danger"}`}>
            {flagship.change24h >= 0 ? "+" : ""}
            {flagship.change24h.toFixed(2)}%
          </span>{" "}
          · 24h
        </>
      ) : (
        "…"
      ),
      sparkline:
        flagshipSeries.length >= 2 ? (
          <Sparkline data={flagshipSeries} height={18} />
        ) : undefined,
    },
  ];

  return <KpiRibbon cells={cells} columns="grid-cols-2 sm:grid-cols-3 xl:grid-cols-6" />;
}
