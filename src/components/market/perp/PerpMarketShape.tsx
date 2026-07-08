"use client";

import { useMemo, useState } from "react";
import {
  OverviewModule,
  FlowGrid,
  FlowBar,
  AuroraHistogramChart,
  chartPalette,
} from "@/components/common";
import { MultiSeriesAreaChart } from "@/components/dashboard/chart";
import type { MultiSeries } from "@/components/dashboard/chart/MultiSeriesAreaChart";
import { PillTabs } from "@/components/ui/pill-tabs";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import type { UsePerpDirectoryResult } from "@/services/market/perp/hooks/usePerpDirectory";
import type { UseFeesHistoryResult } from "@/services/market/fees/types";
import type { TokenCandle } from "@/services/market/token/types";
import type { PerpMarketData } from "@/services/market/perp/types";
import { dailyPerpFeeDeltas, perpFeesAllTime, candleCloses } from "./perpSeries";

type PriceRange = "90d" | "1y";
const RANGE_MS: Record<PriceRange, number> = {
  "90d": 90 * 86_400_000,
  "1y": 365 * 86_400_000,
};

const fmtDay = (ms: number) =>
  new Date(ms).toLocaleDateString("en-US", { month: "short", day: "numeric" });

/** Raw HL funding (an hourly fraction) → a signed hourly-percentage string. */
const fmtFundingPct = (f: number) => `${f >= 0 ? "+" : ""}${(f * 100).toFixed(4)}%`;

interface PerpMarketShapeProps {
  directory: UsePerpDirectoryResult;
  feesHistory: UseFeesHistoryResult;
  btcCandles: TokenCandle[];
  ethCandles: TokenCandle[];
  candlesLoading?: boolean;
}

/**
 * "Market shape" band for /market/perp — four chart modules, real series only:
 *  - Flagship prices : dual-axis BTC vs ETH 1d candles (HL candleSnapshot).
 *  - Open interest    : top market summary + next-5 ranked OI bars.
 *  - Perp fees · daily: deltas of `total_fees − total_spot_fees`
 *                       (~10d API window — labelled with the actual span).
 *  - Funding rates    : current most-positive / most-negative hourly funding.
 */
export function PerpMarketShape({
  directory,
  feesHistory,
  btcCandles,
  ethCandles,
  candlesLoading = false,
}: PerpMarketShapeProps) {
  const [range, setRange] = useState<PriceRange>("90d");
  // Stable across renders — a per-render Date.now() would loop useMemo deps.
  const [now] = useState(() => Date.now());

  // 1 · Flagship prices — BTC and ETH live on different scales (~$70k vs ~$3k),
  // so ETH goes on the right axis; a single axis would flatten it (dual-axis std).
  const priceSeries = useMemo<MultiSeries[]>(() => {
    const cutoff = now - RANGE_MS[range];
    const btc = candleCloses(btcCandles).filter((p) => p.time >= cutoff);
    const eth = candleCloses(ethCandles).filter((p) => p.time >= cutoff);
    const out: MultiSeries[] = [];
    if (btc.length >= 2) {
      out.push({
        id: "btc",
        name: "BTC",
        color: chartPalette.accent,
        axis: "left",
        formatValue: (v) => compactUsd(v),
        data: btc,
      });
    }
    if (eth.length >= 2) {
      out.push({
        id: "eth",
        name: "ETH",
        color: chartPalette.gold,
        axis: "right",
        formatValue: (v) => compactUsd(v),
        data: eth,
      });
    }
    return out;
  }, [btcCandles, ethCandles, range, now]);

  // 2 · Open interest concentration.
  const { oiConcentration: oi, totalOpenInterest } = directory;

  // 3 · Perp fees — one bar per day, real window only.
  const feePoints = useMemo(
    () => dailyPerpFeeDeltas(feesHistory.feesHistory),
    [feesHistory.feesHistory]
  );
  const feeWindowSum = useMemo(
    () => feePoints.reduce((a, p) => a + p.value, 0),
    [feePoints]
  );
  const feeAllTime = useMemo(
    () => perpFeesAllTime(feesHistory.feesHistory),
    [feesHistory.feesHistory]
  );

  // 4 · Funding extremes.
  const { fundingPositive, fundingNegative } = directory;

  const renderFunding = (rows: PerpMarketData[], positive: boolean) => (
    <div className="space-y-1.5">
      <div className="text-[10px] uppercase tracking-[0.08em] text-text-tertiary">
        {positive ? "Longs pay" : "Shorts pay"}
      </div>
      {rows.length ? (
        rows.map((m) => (
          <div key={m.index} className="flex items-baseline justify-between gap-2">
            <span className="truncate text-[11.5px] text-text-secondary">{m.name}</span>
            <span
              className={`mono text-[11px] ${positive ? "text-success" : "text-danger"}`}
            >
              {fmtFundingPct(m.funding)}
            </span>
          </div>
        ))
      ) : (
        <div className="text-[11px] text-text-tertiary">—</div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Row 1 — flagship dual-axis prices + OI concentration */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-4 items-stretch">
        <OverviewModule
          title="Flagship prices"
          tag="HL · 1d candles"
          tagVariant="plain"
          className="min-w-0"
        >
          <div className="px-4 pt-3 flex items-center justify-end">
            <PillTabs
              variant="text"
              tabs={[
                { value: "90d", label: "90d" },
                { value: "1y", label: "1y" },
              ]}
              activeTab={range}
              onTabChange={(v) => setRange(v as PriceRange)}
            />
          </div>
          <div className="px-4 pb-3.5 pt-1 flex-1 flex flex-col gap-3">
            {priceSeries.length ? (
              <MultiSeriesAreaChart series={priceSeries} height={230} showGrid={false} />
            ) : (
              <div className="h-[230px] grid place-items-center text-xs text-text-tertiary">
                {candlesLoading ? "Loading…" : "No candle history available"}
              </div>
            )}
            <div className="text-[10.5px] text-text-tertiary mt-auto">
              {directory.flagship && (
                <>
                  BTC{" "}
                  <span className="mono text-text-secondary">
                    {compactUsd(directory.flagship.price)}
                  </span>{" "}
                  ·{" "}
                  <span
                    className={`mono ${
                      directory.flagship.change24h >= 0 ? "text-success" : "text-danger"
                    }`}
                  >
                    {directory.flagship.change24h >= 0 ? "+" : ""}
                    {directory.flagship.change24h.toFixed(2)}%
                  </span>{" "}
                  24h · left axis BTC · right axis ETH
                </>
              )}
            </div>
          </div>
        </OverviewModule>

        <OverviewModule title="Open interest" tag="live" tagVariant="plain">
          <div className="px-4 py-3.5 flex flex-col gap-2.5 flex-1">
            <div className="flex items-baseline gap-2 pb-2.5 border-b border-border-subtle">
              <span className="text-[11px] text-text-tertiary">{oi.top?.name ?? "…"}</span>
              <span className="mono text-[12px] text-text-secondary ml-auto">
                {oi.top
                  ? `${compactUsd(oi.top.openInterest)} · ${oi.topShare.toFixed(0)}%`
                  : "—"}
              </span>
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <FlowGrid
                rows={oi.next}
                rowKey={(m) => String(m.index)}
                showHeaders={false}
                columns={[
                  {
                    header: "",
                    width: "1fr",
                    align: "left",
                    render: (m) => (
                      <span className="block truncate text-[11px] text-text-secondary">
                        {m.name}
                      </span>
                    ),
                  },
                  {
                    header: "",
                    width: "110px",
                    render: (m, i) => (
                      <FlowBar
                        ratio={oi.nextMax ? m.openInterest / oi.nextMax : 0}
                        height={6}
                        delay={i * 0.03}
                        minVisiblePct={6}
                      />
                    ),
                  },
                  {
                    header: "",
                    width: "56px",
                    align: "right",
                    render: (m) => (
                      <span className="mono text-[11px] text-text-tertiary">
                        {compactUsd(m.openInterest)}
                      </span>
                    ),
                  },
                ]}
              />
            </div>
            <div className="text-[10.5px] text-text-tertiary mt-auto pt-1">
              Σ OI{" "}
              <span className="mono text-text-secondary">{compactUsd(totalOpenInterest)}</span> ·
              top 6 ={" "}
              <span className="mono text-text-secondary">{oi.top6Share.toFixed(0)}%</span>
            </div>
          </div>
        </OverviewModule>
      </div>

      {/* Row 2 — daily fees histogram + funding extremes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
        <OverviewModule
          title="Perp fees · daily"
          tag={feePoints.length ? `${feePoints.length}d · API window` : "API window"}
          tagVariant="plain"
        >
          <div className="px-4 py-3.5 flex flex-col gap-3 flex-1">
            {feePoints.length >= 2 ? (
              <div className="h-[180px]">
                <AuroraHistogramChart
                  data={feePoints}
                  defaultColor={chartPalette.gold}
                  formatValue={(v) => compactUsd(v)}
                  formatTime={fmtDay}
                />
              </div>
            ) : (
              <div className="h-[180px] grid place-items-center text-xs text-text-tertiary">
                {feesHistory.isLoading ? "Loading…" : "No fee history available"}
              </div>
            )}
            <div className="text-[10.5px] text-text-tertiary mt-auto">
              {feePoints.length > 0 && (
                <>
                  <span className="mono text-text-secondary">
                    {compactUsd(feePoints[feePoints.length - 1].value)}
                  </span>{" "}
                  yesterday · Σ{" "}
                  <span className="mono text-text-secondary">{compactUsd(feeWindowSum)}</span> /{" "}
                  {feePoints.length}d
                </>
              )}
              {feeAllTime !== null && (
                <>
                  {" · "}
                  <span className="mono text-gold">{compactUsd(feeAllTime)}</span> all-time
                </>
              )}
            </div>
          </div>
        </OverviewModule>

        <OverviewModule title="Funding rates" tag="hourly · live" tagVariant="plain">
          <div className="px-4 py-3.5 flex flex-col gap-3 flex-1">
            <div className="grid grid-cols-2 gap-x-5 gap-y-2 flex-1">
              {renderFunding(fundingPositive, true)}
              {renderFunding(fundingNegative, false)}
            </div>
            <div className="text-[10.5px] text-text-tertiary mt-auto pt-1 border-t border-border-subtle">
              positive = longs pay shorts · rate per hour · ≥ $1M 24h volume
            </div>
          </div>
        </OverviewModule>
      </div>
    </div>
  );
}
