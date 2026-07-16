"use client";

import { useMemo } from "react";
import { KpiRibbon, Sparkline, chartPalette, HypeMark, type KpiCell } from "@/components/common";
import { compactUsd, compactHype, compactCount } from "@/lib/formatters/numberFormatting";
import { useAuctionTiming } from "@/services/market/auction/hooks/useAuctionTiming";
import type { UseAuctionHistoryResult } from "@/services/market/auction/hooks/useAuctionHistory";

const fmtMonthYear = (ms: number) =>
  new Date(ms).toLocaleDateString("en-US", { month: "short", year: "numeric" });

interface AuctionKpiStripProps {
  history: UseAuctionHistoryResult;
}

/**
 * KPI ribbon for /market/spot/auction (§7.b) — live dutch-auction state plus
 * the all-time record split by era (USDC-paid until May 2025, HYPE since).
 * Era sums are never merged: the units differ. Sparklines are the actual
 * winning-bid sequences (oldest → newest), a real per-event series.
 */
export function AuctionKpiStrip({ history }: AuctionKpiStripProps) {
  const { auctionState, isLoading: timingLoading } = useAuctionTiming();
  const { stats, splitTimestamp, isLoading } = history;

  // Winning bids, chronological — for the per-era sparklines.
  const hypeBids = useMemo(
    () => [...history.hypeAuctions].reverse().map((a) => parseFloat(a.deployGas)),
    [history.hypeAuctions]
  );
  const usdcBids = useMemo(
    () => [...history.usdcAuctions].reverse().map((a) => parseFloat(a.deployGas)),
    [history.usdcAuctions]
  );

  const ph = isLoading ? "…" : "—";

  const cells: KpiCell[] = [
    {
      label: "Current auction",
      value: timingLoading ? (
        "…"
      ) : (
        <>
          {compactHype(auctionState.currentPrice)}{" "}
          <HypeMark size="xs" className="text-[12px] text-text-tertiary" />
        </>
      ),
      sub: timingLoading ? (
        "…"
      ) : auctionState.isActive ? (
        <>
          ≈ <span className="mono">{compactUsd(auctionState.currentPriceUSD)}</span> ·{" "}
          <span className="text-success">live</span> · ends in {auctionState.timeRemaining}
        </>
      ) : (
        <>next start gas · in {auctionState.nextAuctionStart}</>
      ),
    },
    {
      label: "Deploys · 7d",
      value: isLoading ? "…" : compactCount(stats.deploys7d),
      sub:
        stats.deploys7d > 0 ? (
          <>
            avg <span className="mono">{compactHype(stats.avg7d)} HYPE</span> winning bid
          </>
        ) : (
          "31h dutch cadence"
        ),
    },
    {
      label: "Tickers auctioned",
      value: stats.totalCount ? compactCount(stats.totalCount) : ph,
      sub: stats.firstTime ? `since ${fmtMonthYear(stats.firstTime)}` : "…",
    },
    {
      label: "Gas paid · HYPE era",
      value: stats.hypeCount ? (
        <>
          {compactHype(stats.hypeGasSum)}{" "}
          <HypeMark size="xs" className="text-[12px] text-text-tertiary" />
        </>
      ) : (
        ph
      ),
      tone: "gold",
      sub: splitTimestamp
        ? `${stats.hypeCount} deploys · since ${fmtMonthYear(splitTimestamp)}`
        : `${stats.hypeCount} deploys`,
      sparkline:
        hypeBids.length >= 2 ? (
          <Sparkline data={hypeBids} color={chartPalette.gold} height={18} />
        ) : undefined,
    },
    {
      label: "Gas paid · USDC era",
      value: stats.usdcCount ? compactUsd(stats.usdcGasSum) : ph,
      sub:
        stats.firstTime && splitTimestamp
          ? `${stats.usdcCount} deploys · ${fmtMonthYear(stats.firstTime)} → ${fmtMonthYear(splitTimestamp)}`
          : `${stats.usdcCount} deploys`,
      sparkline:
        usdcBids.length >= 2 ? <Sparkline data={usdcBids} height={18} /> : undefined,
    },
    {
      label: "Record gas · all-time",
      value: stats.peakUsdc ? compactUsd(parseFloat(stats.peakUsdc.deployGas)) : ph,
      sub: stats.peakUsdc
        ? `${stats.peakUsdc.name} · ${fmtMonthYear(stats.peakUsdc.time)}`
        : "…",
    },
  ];

  return <KpiRibbon cells={cells} columns="grid-cols-2 sm:grid-cols-3 xl:grid-cols-6" />;
}
