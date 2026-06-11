"use client";

import { useMemo, useState } from "react";
import {
  OverviewModule,
  FlowGrid,
  FlowBar,
  AuroraAreaChart,
  AuroraHistogramChart,
  StackedShareBar,
  chartPalette,
} from "@/components/common";
import { MultiSeriesAreaChart } from "@/components/dashboard/chart";
import type { MultiSeries } from "@/components/dashboard/chart/MultiSeriesAreaChart";
import { PillTabs } from "@/components/ui/pill-tabs";
import { compactUsd, compactCount } from "@/lib/formatters/numberFormatting";
import type { UseSpotDirectoryResult } from "@/services/market/spot/hooks/useSpotDirectory";
import type { UseSpotStablecoinsResult } from "@/services/market/stablecoins/types";
import type { UseFeesHistoryResult } from "@/services/market/fees/types";
import type { TokenCandle } from "@/services/market/token/types";
import { dailySpotFeeDeltas, candleCloses } from "./spotSeries";

type StableRange = "90d" | "1y" | "all";
const RANGE_MS: Record<Exclude<StableRange, "all">, number> = {
  "90d": 90 * 86_400_000,
  "1y": 365 * 86_400_000,
};

/** Share-bar tint per stablecoin — semantic tokens only. */
const STABLE_BAR: Record<string, string> = {
  USDC: "bg-brand",
  USDT0: "bg-success",
  USDH: "bg-gold",
  USDE: "bg-border-strong",
};

const fmtDay = (ms: number) =>
  new Date(ms).toLocaleDateString("en-US", { month: "short", day: "numeric" });

interface SpotMarketShapeProps {
  directory: UseSpotDirectoryResult;
  stables: UseSpotStablecoinsResult;
  feesHistory: UseFeesHistoryResult;
  hypeCandles: TokenCandle[];
  hypeCandlesLoading?: boolean;
}

/**
 * "Market shape" band for /market/spot — four chart modules, real series only:
 *  - Stablecoin liquidity : dual-axis USDC vs other stables (hypurrscan /spotUSDC).
 *  - Volume concentration : top token summary + next-5 ranked bars (capital-map pattern).
 *  - Spot fees · daily    : deltas of the cumulative total_spot_fees series
 *                           (~10d API window — labelled with the actual span).
 *  - HYPE spot price      : 90d of 1d candles from the HL candleSnapshot API.
 */
export function SpotMarketShape({
  directory,
  stables,
  feesHistory,
  hypeCandles,
  hypeCandlesLoading = false,
}: SpotMarketShapeProps) {
  const [range, setRange] = useState<StableRange>("1y");
  // Stable across renders — a per-render Date.now() would loop useMemo deps.
  const [now] = useState(() => Date.now());

  // 1 · Stablecoins — USDC dwarfs the rest (~98%), so the other stables go on
  // the right axis; a single axis would flatline them (dual-axis standard).
  const stableSeries = useMemo<MultiSeries[]>(() => {
    const cutoff = range === "all" ? 0 : now - RANGE_MS[range];
    const pts = stables.supplyByCoinChart.filter((p) => p.time >= cutoff);
    if (pts.length < 2) return [];
    return [
      {
        id: "usdc",
        name: "USDC",
        color: chartPalette.accent,
        axis: "left",
        formatValue: (v) => compactUsd(v),
        data: pts.map((p) => ({ time: p.time, value: p.USDC })),
      },
      {
        id: "others",
        name: "USDT0 + USDH + USDE",
        color: chartPalette.gold,
        axis: "right",
        formatValue: (v) => compactUsd(v),
        data: pts.map((p) => ({ time: p.time, value: p.USDT0 + p.USDH + p.USDE })),
      },
    ];
  }, [stables.supplyByCoinChart, range, now]);

  const usdc = stables.stablecoins.find((s) => s.symbol === "USDC");

  // 2 · Fees — one bar per day, real window only.
  const feePoints = useMemo(
    () => dailySpotFeeDeltas(feesHistory.feesHistory),
    [feesHistory.feesHistory]
  );
  const feeWindowSum = useMemo(
    () => feePoints.reduce((a, p) => a + p.value, 0),
    [feePoints]
  );
  const feeAllTime = useMemo(() => {
    const h = feesHistory.feesHistory;
    return h && h.length ? h[h.length - 1].total_spot_fees : null;
  }, [feesHistory.feesHistory]);

  // 3 · HYPE price.
  const hypeSeries = useMemo(() => candleCloses(hypeCandles), [hypeCandles]);
  const hypeRange = useMemo(() => {
    if (!hypeSeries.length) return null;
    const values = hypeSeries.map((p) => p.value);
    return { min: Math.min(...values), max: Math.max(...values) };
  }, [hypeSeries]);
  const hype = directory.hype;

  const { concentration } = directory;

  return (
    <div className="space-y-4">
      {/* Row 1 — big dual-axis stablecoin chart + volume concentration */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-4 items-stretch">
        <OverviewModule
          title="Stablecoin liquidity"
          tag="hypurrscan · /spotUSDC"
          tagVariant="plain"
          className="min-w-0"
        >
          <div className="px-4 pt-3 flex items-center justify-end">
            <PillTabs
              variant="text"
              tabs={[
                { value: "90d", label: "90d" },
                { value: "1y", label: "1y" },
                { value: "all", label: "all" },
              ]}
              activeTab={range}
              onTabChange={(v) => setRange(v as StableRange)}
            />
          </div>
          <div className="px-4 pb-3.5 pt-1 flex-1 flex flex-col gap-3">
            {stableSeries.length ? (
              <MultiSeriesAreaChart series={stableSeries} height={230} showGrid={false} />
            ) : (
              <div className="h-[230px] grid place-items-center text-xs text-text-tertiary">
                {stables.isLoading ? "Loading…" : "No supply history available"}
              </div>
            )}
            <div className="space-y-1.5 mt-auto">
              <StackedShareBar
                height={6}
                segments={stables.stablecoins.map((s) => ({
                  key: s.symbol,
                  value: s.supply,
                  colorClass: STABLE_BAR[s.symbol] ?? "bg-border-strong",
                  label: `${s.symbol} ${compactUsd(s.supply)}`,
                }))}
              />
              <div className="text-[10.5px] text-text-tertiary">
                {stables.stablecoins.map((s, i) => (
                  <span key={s.symbol}>
                    {i > 0 && " · "}
                    {s.symbol}{" "}
                    <span className="mono text-text-secondary">{compactUsd(s.supply)}</span>
                  </span>
                ))}
                {usdc && usdc.holders > 0 && (
                  <>
                    {" · "}
                    <span className="mono text-text-secondary">
                      {compactCount(usdc.holders)}
                    </span>{" "}
                    USDC holders
                  </>
                )}
              </div>
            </div>
          </div>
        </OverviewModule>

        <OverviewModule title="Volume concentration" tag="24h" tagVariant="plain">
          <div className="px-4 py-3.5 flex flex-col gap-2.5 flex-1">
            <div className="flex items-baseline gap-2 pb-2.5 border-b border-border-subtle">
              <span className="text-[11px] text-text-tertiary">
                {concentration.top?.name ?? "…"}
              </span>
              <span className="mono text-[12px] text-text-secondary ml-auto">
                {concentration.top
                  ? `${compactUsd(concentration.top.volume)} · ${concentration.topShare.toFixed(0)}%`
                  : "—"}
              </span>
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <FlowGrid
                rows={concentration.next}
                rowKey={(t) => String(t.marketIndex)}
                showHeaders={false}
                columns={[
                  {
                    header: "",
                    width: "1fr",
                    align: "left",
                    render: (t) => (
                      <span className="block truncate text-[11px] text-text-secondary">
                        {t.name}
                      </span>
                    ),
                  },
                  {
                    header: "",
                    width: "110px",
                    render: (t, i) => (
                      <FlowBar
                        ratio={concentration.nextMax ? t.volume / concentration.nextMax : 0}
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
                    render: (t) => (
                      <span className="mono text-[11px] text-text-tertiary">
                        {compactUsd(t.volume)}
                      </span>
                    ),
                  },
                ]}
              />
            </div>
            <div className="text-[10.5px] text-text-tertiary mt-auto pt-1">
              share of the{" "}
              <span className="mono text-text-secondary">
                {compactUsd(concentration.nonTopVolume)}
              </span>{" "}
              non-{concentration.top?.name ?? "top"} volume · top 6 ={" "}
              <span className="mono text-text-secondary">
                {concentration.top6Share.toFixed(0)}%
              </span>
            </div>
          </div>
        </OverviewModule>
      </div>

      {/* Row 2 — daily fees histogram + HYPE price */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
        <OverviewModule
          title="Spot fees · daily"
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

        <OverviewModule title="HYPE spot price" tag="90d · 1d candles" tagVariant="plain">
          <div className="px-4 py-3.5 flex flex-col gap-3 flex-1">
            {hypeSeries.length >= 2 ? (
              <AuroraAreaChart
                data={hypeSeries}
                height={180}
                showGrid={false}
                yAxisWidth={44}
                formatValue={(v) => compactUsd(v)}
                formatTime={fmtDay}
              />
            ) : (
              <div className="h-[180px] grid place-items-center text-xs text-text-tertiary">
                {hypeCandlesLoading || directory.isLoading
                  ? "Loading…"
                  : "No candle history available"}
              </div>
            )}
            <div className="text-[10.5px] text-text-tertiary mt-auto">
              {hype && (
                <>
                  now <span className="mono text-text-secondary">{compactUsd(hype.price)}</span>{" "}
                  ·{" "}
                  <span
                    className={`mono ${hype.change24h >= 0 ? "text-success" : "text-danger"}`}
                  >
                    {hype.change24h >= 0 ? "+" : ""}
                    {hype.change24h.toFixed(2)}%
                  </span>{" "}
                  24h
                </>
              )}
              {hypeRange && (
                <>
                  {" · 90d range "}
                  <span className="mono text-text-secondary">
                    {compactUsd(hypeRange.min)} – {compactUsd(hypeRange.max)}
                  </span>
                </>
              )}
            </div>
          </div>
        </OverviewModule>
      </div>
    </div>
  );
}
