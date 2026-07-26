"use client";

import { memo, useMemo, useState } from "react";
import { PieChart } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  ChartEmpty,
  ChartError,
  ChartLoading,
  StackedShareBar,
  TimeframeTabs,
  chartPalette,
} from "@/components/common";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import type { Timeframe } from "@/lib/timeframe";
import { useRevenueBreakdown, type RevenueWindow } from "@/services/market/revenue";

/**
 * Revenue by segment.
 *
 * The aggregate everyone quotes is a single line. This is the same money split
 * by where it came from, which is the question an analyst asks next: how much
 * of the business is one product, and is that share moving. Six sources, from
 * our own endpoint — the public aggregates do not carry this breakdown.
 *
 * HIP-1 and HIP-3 stay separate here, unlike the dashboard chart which merges
 * them into one "Auctions" band: at segment level the distinction between spot
 * listings and perp-DEX slots is the interesting part.
 */

interface Segment {
  key: "perp" | "spot" | "hip1" | "hip3" | "hip4" | "priority";
  label: string;
  hint: string;
  color: string;
}

const SEGMENTS: Segment[] = [
  { key: "perp", label: "Perpetuals", hint: "Taker and maker fees on perp markets", color: chartPalette.multiSeries[0] },
  { key: "spot", label: "Spot", hint: "Spot trading fees, gross of the deployer share", color: chartPalette.multiSeries[2] },
  { key: "hip1", label: "HIP-1 auctions", hint: "Spot ticker deploy auctions", color: chartPalette.multiSeries[3] },
  { key: "hip3", label: "HIP-3 auctions", hint: "Perp DEX deploy auctions", color: chartPalette.multiSeries[7] },
  { key: "priority", label: "Priority fees", hint: "Paid for write priority, burned", color: chartPalette.multiSeries[4] },
  { key: "hip4", label: "HIP-4", hint: "Outcome markets", color: chartPalette.multiSeries[6] },
];

/** The revenue endpoint and the timeframe selector do not use the same words. */
const WINDOWS: { tf: Timeframe; window: RevenueWindow }[] = [
  { tf: "7d", window: "7d" },
  { tf: "30d", window: "30d" },
  { tf: "90d", window: "90d" },
  { tf: "1y", window: "1y" },
  { tf: "all", window: "all" },
];

export const RevenueSegmentsCard = memo(function RevenueSegmentsCard() {
  const [tf, setTf] = useState<Timeframe>("30d");
  const window = WINDOWS.find((w) => w.tf === tf)?.window ?? "30d";
  const { breakdown, isLoading, error } = useRevenueBreakdown(window);

  const rows = useMemo(() => {
    const days = breakdown?.days ?? [];
    if (!days.length) return [];
    const totals = SEGMENTS.map((s) => ({
      ...s,
      value: days.reduce((sum, d) => sum + (d[s.key] ?? 0), 0),
    }));
    const grand = totals.reduce((sum, t) => sum + t.value, 0);
    return totals
      .map((t) => ({ ...t, share: grand > 0 ? t.value / grand : 0 }))
      .sort((a, b) => b.value - a.value);
  }, [breakdown]);

  const total = rows.reduce((sum, r) => sum + r.value, 0);
  // A segment can be legitimately absent (not live, or no auction in the
  // window). Showing it at 0.0% adds a row and no information.
  const live = rows.filter((r) => r.value > 0);

  return (
    <Card className="overflow-hidden flex flex-col">
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle min-h-[44px]">
        <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
          <PieChart size={13} className="text-brand" />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">Revenue by Segment</h3>
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle mono">
          {total > 0 ? compactUsd(total) : "—"}
        </span>
        <TimeframeTabs
          className="ml-auto"
          options={WINDOWS.map((w) => w.tf)}
          value={tf}
          onChange={setTf}
        />
      </div>

      <div className="flex-1 px-4 py-3">
        {error ? (
          <ChartError />
        ) : isLoading && !breakdown ? (
          <ChartLoading />
        ) : !live.length ? (
          <ChartEmpty suggestion="Try a wider window" />
        ) : (
          <>
            <StackedShareBar
              height={22}
              minPct={0.5}
              segments={live.map((r) => ({
                key: r.key,
                value: r.value,
                color: r.color,
                label: `${r.label} · ${(r.share * 100).toFixed(1)}%`,
              }))}
            />

            <div className="mt-3">
              {live.map((r) => (
                <div
                  key={r.key}
                  className="flex items-baseline gap-3 py-2 border-b border-border-subtle last:border-0"
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0 self-center"
                    style={{ background: r.color }}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[13px] text-text-primary">{r.label}</span>
                    <span className="text-[10.5px] text-text-tertiary/80">{r.hint}</span>
                  </div>
                  <span className="ml-auto mono tabular-nums text-[14px] text-text-secondary">
                    {compactUsd(r.value)}
                  </span>
                  <span className="mono tabular-nums text-[13px] text-text-tertiary w-[52px] text-right">
                    {(r.share * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 px-3.5 py-1.5 border-t border-border-subtle text-[10px] text-text-tertiary">
        <span>Sources: Hypurrscan · HypeDexer · Hyperliquid</span>
        {breakdown?.meta?.spotMultiplier ? (
          <>
            <span className="opacity-50">·</span>
            <span>Spot ×{breakdown.meta.spotMultiplier} to approximate gross-user</span>
          </>
        ) : null}
      </div>
    </Card>
  );
});
