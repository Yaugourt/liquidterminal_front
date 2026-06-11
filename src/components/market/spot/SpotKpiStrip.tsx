"use client";

import { useMemo } from "react";
import { KpiRibbon, Sparkline, chartPalette, type KpiCell } from "@/components/common";
import { compactUsd, compactCount, formatPrice } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { useSpotGlobalStats } from "@/services/market/spot/hooks/useSpotGlobalStats";
import { useFeesStats } from "@/services/market/fees/hooks/useFeesStats";
import type { UseSpotDirectoryResult } from "@/services/market/spot/hooks/useSpotDirectory";
import type { UseSpotStablecoinsResult } from "@/services/market/stablecoins/types";
import type { UseFeesHistoryResult } from "@/services/market/fees/types";
import type { TokenCandle } from "@/services/market/token/types";
import { dailySpotFeeDeltas, candleCloses } from "./spotSeries";

interface SpotKpiStripProps {
  directory: UseSpotDirectoryResult;
  stables: UseSpotStablecoinsResult;
  feesHistory: UseFeesHistoryResult;
  hypeCandles: TokenCandle[];
}

/**
 * KPI ribbon for /market/spot (§7.b via <KpiRibbon>).
 *
 * Honest-data choices:
 *  - The global "Market Cap" KPI is deliberately gone — bridged assets report
 *    full underlying supply, inflating the sum to absurd values ($3,171T).
 *    Stablecoin depth replaces it as the capital-side headline.
 *  - Fees cell uses `dailySpotFees`, never protocol-wide `dailyFees`.
 *  - Sparklines only where a real series exists (fees deltas, stablecoin
 *    supply, HYPE candles) — HIP-2 and volume have no exposed history.
 */
export function SpotKpiStrip({
  directory,
  stables,
  feesHistory,
  hypeCandles,
}: SpotKpiStripProps) {
  const { format } = useNumberFormat();
  const { stats, isLoading: statsLoading } = useSpotGlobalStats();
  const { feesStats } = useFeesStats();

  const feeDeltas = useMemo(
    () => dailySpotFeeDeltas(feesHistory.feesHistory).map((p) => p.value),
    [feesHistory.feesHistory]
  );
  const hypeSeries = useMemo(
    () => candleCloses(hypeCandles).map((p) => p.value),
    [hypeCandles]
  );

  const totalStables = useMemo(
    () => stables.stablecoins.reduce((a, s) => a + s.supply, 0),
    [stables.stablecoins]
  );
  const usdc = stables.stablecoins.find((s) => s.symbol === "USDC");
  const usdcShare = usdc && totalStables ? (usdc.supply / totalStables) * 100 : 0;

  const ph = statsLoading ? "…" : "—";
  const hype = directory.hype;
  const feeShare =
    feesStats && feesStats.dailyFees > 0
      ? (feesStats.dailySpotFees / feesStats.dailyFees) * 100
      : null;

  const cells: KpiCell[] = [
    {
      label: "Spot volume · 24h",
      value: stats ? compactUsd(stats.totalVolume24h) : ph,
      sub: stats ? `across ${stats.totalPairs} pairs` : "…",
    },
    {
      label: "Spot fees · 24h",
      value: feesStats ? compactUsd(feesStats.dailySpotFees) : ph,
      tone: "gold",
      sub: feeShare !== null ? `${feeShare.toFixed(1)}% of protocol fees` : "share unknown",
      sparkline:
        feeDeltas.length >= 2 ? (
          <Sparkline data={feeDeltas} color={chartPalette.gold} height={18} />
        ) : undefined,
    },
    {
      label: "Stablecoins on spot",
      value: totalStables ? compactUsd(totalStables) : ph,
      sub: usdc
        ? `USDC ${usdcShare.toFixed(1)}% · ${stables.stablecoins.length} stables`
        : "…",
      sparkline:
        stables.supplyHistory.length >= 2 ? (
          <Sparkline data={stables.supplyHistory} height={18} />
        ) : undefined,
    },
    {
      label: "Tokens listed",
      value: directory.totalCount ? compactCount(directory.totalCount) : ph,
      sub: "via HIP-1 auctions",
    },
    {
      label: "HIP-2 liquidity",
      value: stats ? compactUsd(stats.totalHIP2) : ph,
      sub: "protocol-owned USDC",
    },
    {
      label: "HYPE spot",
      value: hype ? formatPrice(hype.price, format) : ph,
      sub: hype ? (
        <>
          <span className={`mono ${hype.change24h >= 0 ? "text-success" : "text-danger"}`}>
            {hype.change24h >= 0 ? "+" : ""}
            {hype.change24h.toFixed(2)}%
          </span>{" "}
          · 24h
        </>
      ) : (
        "…"
      ),
      sparkline:
        hypeSeries.length >= 2 ? <Sparkline data={hypeSeries} height={18} /> : undefined,
    },
  ];

  return <KpiRibbon cells={cells} columns="grid-cols-2 sm:grid-cols-3 xl:grid-cols-6" />;
}
