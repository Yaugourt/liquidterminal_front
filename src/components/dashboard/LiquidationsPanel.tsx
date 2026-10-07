"use client";

import { memo, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  useLiquidationsData,
  useTopLiquidations,
} from "@/services/explorer/liquidation";
import type { ChartDataBucket, Liquidation } from "@/services/explorer/liquidation";
import { compactUsd, truncateAddress } from "@/lib/formatters/numberFormatting";
import { timeAgo } from "@/lib/formatters/dateFormatting";
import { CardHead, chartPalette, KpiRibbon, TokenAvatar } from "@/components/common";

/**
 * LiquidationsPanel — Dashboard liquidations card (V4 · variant D "cumulative").
 *
 * Layout:
 *  1. 3-col hero strip — total / long / short, each with $ volume + count + %.
 *  2. Cumulative chart — two area+line series (long $ cumulative green,
 *     short $ cumulative red) over the last 24h. Each burst reads as a slope
 *     change. Pure SVG, hover crosshair + floating tooltip.
 *  3. Footer — top 3 individual liquidations ≥ $100K (the day's standouts).
 *
 * Real data only, all from the local liquidations DB: the hero strip and the
 * cumulative chart from `/liquidations/data` (24h stats + 30 min buckets), the
 * standouts from `/liquidations/historical/top`. The chart used to be rebuilt
 * from a 1 000-row HypeDexer page, which covered only the last 4-8 h on busy
 * days and cost ~100 credits every 30 s.
 */

/** Chart buckets: 30 min, as served for the 24h period. */
const HIST_BUCKET_MS = 30 * 60 * 1000;

/** USD threshold below which individual liquidations are filtered out of the standouts list. */
const STANDOUT_THRESHOLD_USD = 100_000;
const STANDOUT_LIMIT = 3;

interface CumulativeBucket {
  timestampMs: number;
  longCum: number;
  shortCum: number;
  /** Per-bucket increments — used by the hover tooltip. */
  longInc: number;
  shortInc: number;
}

/**
 * Running long / short totals over the 24h buckets (oldest first, zero-filled
 * by the backend). Each bucket carries the cumulative $ liquidated up to and
 * including its window.
 */
function buildCumulative(buckets: ChartDataBucket[]): CumulativeBucket[] {
  const out: CumulativeBucket[] = [];
  let lc = 0;
  let sc = 0;
  for (const b of [...buckets].sort((a, b) => a.timestampMs - b.timestampMs)) {
    lc += b.longVolume;
    sc += b.shortVolume;
    out.push({
      timestampMs: b.timestampMs,
      longCum: lc,
      shortCum: sc,
      longInc: b.longVolume,
      shortInc: b.shortVolume,
    });
  }
  return out;
}

/** Return a reliable ms timestamp for a liquidation row.
 *
 *  HypeDexer rows used to carry a corrupted `time_ms` for ~20% of rows
 *  (values ~3.5e12 → year 2082) while the ISO `time` field stayed correct.
 *  Always parse the ISO field; fall back to `time_ms` only if ISO is unparseable.
 */
function getLiqTimeMs(liq: Liquidation): number {
  const iso = liq.time.endsWith("Z") ? liq.time : `${liq.time}Z`;
  const ms = Date.parse(iso);
  return Number.isFinite(ms) ? ms : liq.time_ms;
}

/** Short "HH:mm" label for a bucket timestamp. */
function bucketHour(ms: number): string {
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

/** SVG cumulative curve — two area+line series, hover crosshair + tooltip. */
function CumulativeChart({ buckets }: { buckets: CumulativeBucket[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const last = buckets[buckets.length - 1];
  const maxY = Math.max(last?.longCum ?? 0, last?.shortCum ?? 0, 1);

  // SVG geometry — viewBox 540×170, leave 2px padding so lines don't clip.
  const W = 540;
  const H = 170;
  const PAD_T = 4;
  const PAD_B = 2;
  const usableH = H - PAD_T - PAD_B;

  const xOf = (i: number) => (i / Math.max(1, buckets.length - 1)) * W;
  const yOf = (v: number) => PAD_T + (1 - v / maxY) * usableH;

  const longPath = useMemo(() => {
    return buckets
      .map((b, i) => `${i === 0 ? "M" : "L"} ${xOf(i).toFixed(1)} ${yOf(b.longCum).toFixed(1)}`)
      .join(" ");
  }, [buckets, maxY]); // eslint-disable-line react-hooks/exhaustive-deps

  const shortPath = useMemo(() => {
    return buckets
      .map((b, i) => `${i === 0 ? "M" : "L"} ${xOf(i).toFixed(1)} ${yOf(b.shortCum).toFixed(1)}`)
      .join(" ");
  }, [buckets, maxY]); // eslint-disable-line react-hooks/exhaustive-deps

  const longArea = useMemo(() => `${longPath} L ${W} ${H} L 0 ${H} Z`, [longPath]);
  const shortArea = useMemo(() => `${shortPath} L ${W} ${H} L 0 ${H} Z`, [shortPath]);

  const hovered = hoveredIdx != null ? buckets[hoveredIdx] : null;
  const tooltipLeftPct = hovered ? (hoveredIdx! / Math.max(1, buckets.length - 1)) * 100 : 50;

  return (
    <div
      className="relative w-full"
      onMouseLeave={() => setHoveredIdx(null)}
    >
      {/* Floating tooltip */}
      <div
        className={`pointer-events-none absolute -top-1 z-20 transition-opacity duration-150 ${
          hovered ? "opacity-100" : "opacity-0"
        }`}
        style={{
          left: `${tooltipLeftPct}%`,
          transform: "translateX(-50%) translateY(-100%)",
        }}
      >
        {hovered && (
          <div className="bg-surface-2 border border-border-default rounded px-2.5 py-1.5 min-w-[160px] shadow-xl">
            <div className="mono text-[9px] text-text-tertiary">
              {bucketHour(hovered.timestampMs)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              <span className="text-success mono font-semibold">Long</span>
              <span className="ml-auto mono text-text-primary">
                {compactUsd(hovered.longCum)}
              </span>
              <span className="mono text-text-tertiary text-[9px]">
                {hovered.longInc > 0 ? `· +${compactUsd(hovered.longInc)}` : ""}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-danger" />
              <span className="text-danger mono font-semibold">Short</span>
              <span className="ml-auto mono text-text-primary">
                {compactUsd(hovered.shortCum)}
              </span>
              <span className="mono text-text-tertiary text-[9px]">
                {hovered.shortInc > 0 ? `· +${compactUsd(hovered.shortInc)}` : ""}
              </span>
            </div>
          </div>
        )}
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="w-full h-[170px] block cursor-crosshair"
      >
        <defs>
          <linearGradient id="liqGradLong" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={chartPalette.success} stopOpacity="0.22" />
            <stop offset="100%" stopColor={chartPalette.success} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="liqGradShort" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={chartPalette.danger} stopOpacity="0.18" />
            <stop offset="100%" stopColor={chartPalette.danger} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid */}
        {[0, 0.25, 0.5, 0.75].map((p) => (
          <line
            key={p}
            x1="0"
            x2={W}
            y1={PAD_T + p * usableH}
            y2={PAD_T + p * usableH}
            stroke="rgb(var(--border-subtle))"
            strokeDasharray="3 4"
          />
        ))}
        <line
          x1="0"
          x2={W}
          y1={H - PAD_B}
          y2={H - PAD_B}
          stroke="rgb(var(--border-subtle))"
        />

        {/* Long area + line */}
        <path d={longArea} fill="url(#liqGradLong)" />
        <path d={longPath} fill="none" stroke={chartPalette.success} strokeWidth="2" />

        {/* Short area + line */}
        <path d={shortArea} fill="url(#liqGradShort)" />
        <path d={shortPath} fill="none" stroke={chartPalette.danger} strokeWidth="2" />

        {/* Hover crosshair */}
        {hovered && (
          <line
            x1={xOf(hoveredIdx!)}
            x2={xOf(hoveredIdx!)}
            y1="0"
            y2={H}
            stroke={chartPalette.accent}
            strokeWidth="1"
            strokeDasharray="2 3"
            opacity="0.6"
          />
        )}

        {/* Mouse capture — invisible per-column rects */}
        {buckets.map((_, i) => {
          const w = W / buckets.length;
          return (
            <rect
              key={i}
              x={i * w}
              y={0}
              width={w}
              height={H}
              fill="transparent"
              onMouseEnter={() => setHoveredIdx(i)}
            />
          );
        })}
      </svg>
    </div>
  );
}

export const LiquidationsPanel = memo(function LiquidationsPanel() {
  // 24h aggregated stats (totals, long/short split, top coin) and the 30 min
  // buckets the cumulative chart is built from.
  const { stats, buckets, isLoading: dataLoading } = useLiquidationsData("24h", 30000);

  // The day's largest liquidations, for the standouts footer.
  const { liquidations: standouts, isLoading: standoutsLoading } = useTopLiquidations(
    "24h",
    STANDOUT_THRESHOLD_USD,
    STANDOUT_LIMIT,
  );

  const longTotal = stats.longVolume ?? 0;
  const shortTotal = stats.shortVolume ?? 0;
  const longPct = stats.totalVolume > 0 ? (longTotal / stats.totalVolume) * 100 : 0;
  const shortPct = 100 - longPct;

  /** Raw 30min cumulative buckets covering 24h. */
  const rawCumulative = useMemo(() => buildCumulative(buckets), [buckets]);

  /**
   * Trim leading empty buckets — on a quiet start of window they would render
   * flat lines over wasted space; trimming fills the card width with actual
   * data.
   */
  const cumBuckets = useMemo(() => {
    let start = 0;
    while (
      start < rawCumulative.length &&
      rawCumulative[start].longCum === 0 &&
      rawCumulative[start].shortCum === 0
    ) {
      start++;
    }
    if (start >= rawCumulative.length) return rawCumulative;
    return rawCumulative.slice(start);
  }, [rawCumulative]);

  /** Hours actually covered by the trimmed chart. */
  const visibleHours = useMemo(() => {
    if (cumBuckets.length === 0) return 0;
    const spanMs =
      cumBuckets[cumBuckets.length - 1].timestampMs -
      cumBuckets[0].timestampMs +
      HIST_BUCKET_MS;
    return Math.max(1, Math.round(spanMs / (60 * 60 * 1000)));
  }, [cumBuckets]);

  /** Time axis labels (start / mid / end of the trimmed window). */
  const timeAxis = useMemo(() => {
    if (cumBuckets.length === 0) return null;
    return {
      start: bucketHour(cumBuckets[0].timestampMs),
      mid: bucketHour(cumBuckets[Math.floor(cumBuckets.length / 2)].timestampMs),
      end: bucketHour(cumBuckets[cumBuckets.length - 1].timestampMs),
    };
  }, [cumBuckets]);

  const hasChart = cumBuckets.length > 0 && (cumBuckets[cumBuckets.length - 1].longCum > 0 || cumBuckets[cumBuckets.length - 1].shortCum > 0);

  return (
    <Card className="overflow-hidden flex flex-col">
      <CardHead
        title="Liquidations"
        tag="24h"
        actions={
          <span className="flex items-center gap-1.5 text-[10px] text-text-tertiary mono">
            Top ·
            {stats.topCoin ? (
              <>
                <TokenAvatar assetName={stats.topCoin} size="sm" />
                <span className="text-text-secondary font-semibold">
                  {stats.topCoin}
                </span>
              </>
            ) : (
              <span>—</span>
            )}
          </span>
        }
      />

      {/* Hero — 3-col strip (Total / Long / Short) */}
      <KpiRibbon
        bordered={false}
        columns="grid-cols-[1.2fr_1fr_1fr]"
        className="border-b border-border-subtle"
        cells={[
          {
            label: "Liquidated",
            value: compactUsd(stats.totalVolume),
            sub: (
              <>
                {stats.liquidationsCount.toLocaleString()} events · avg{" "}
                {compactUsd(stats.avgSize)}
              </>
            ),
          },
          {
            label: "Long ↗",
            value: compactUsd(longTotal),
            tone: "success",
            sub: `${Math.round(longPct)}% · ${stats.longCount.toLocaleString()} events`,
          },
          {
            label: "Short ↘",
            value: compactUsd(shortTotal),
            tone: "danger",
            sub: `${Math.round(shortPct)}% · ${stats.shortCount.toLocaleString()} events`,
          },
        ]}
      />

      {/* Cumulative chart */}
      <div className="flex-1 flex flex-col px-3.5 pt-2.5 pb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary font-semibold">
            Cumulative volume liquidated
          </span>
          <div className="flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-[2px] rounded bg-success" />
              <span className="text-text-secondary">Long</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-[2px] rounded bg-danger" />
              <span className="text-text-secondary">Short</span>
            </span>
          </div>
        </div>

        {!hasChart ? (
          <div className="flex-1 grid place-items-center py-5 text-[11px] text-text-tertiary">
            {dataLoading ? "Loading…" : "No liquidations in the last 24h"}
          </div>
        ) : (
          <>
            <CumulativeChart buckets={cumBuckets} />
            {timeAxis && (
              <div className="flex justify-between mt-1.5 text-[9px] text-text-tertiary mono">
                <span>{timeAxis.start}</span>
                <span>{timeAxis.mid}</span>
                <span>{timeAxis.end}</span>
              </div>
            )}
            <div className="mt-1 text-[9.5px] text-text-tertiary text-right">
              {visibleHours > 0 ? `last ${visibleHours}h · 30m buckets` : ""}
            </div>
          </>
        )}
      </div>

      {/* Footer — top 3 standouts (≥ $100K) */}
      <div className="border-t border-border-subtle px-3.5 py-2.5">
        <div className="text-[9.5px] uppercase tracking-[0.06em] text-text-tertiary font-semibold mb-1.5">
          Notable liquidations · ≥ $100K
        </div>
        {standouts.length === 0 ? (
          <div className="text-[11px] text-text-tertiary py-1">
            {standoutsLoading
              ? "Loading…"
              : "No liquidation ≥ $100K in the last 24h"}
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {standouts.map((l) => {
              const isLong = l.liq_dir === "Long";
              return (
                <div
                  key={l.tid}
                  className="flex items-center gap-2.5 text-[11px] py-1"
                >
                  <span className="mono w-9 shrink-0 text-text-tertiary text-[10px]">
                    {timeAgo(getLiqTimeMs(l))}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                      isLong
                        ? "bg-success/10 text-success"
                        : "bg-danger/10 text-danger"
                    }`}
                  >
                    {isLong ? "LONG" : "SHORT"}
                  </span>
                  <TokenAvatar assetName={l.coin} size="sm" />
                  <span className="font-semibold text-text-primary shrink-0">
                    {l.coin}
                  </span>
                  <span className="mono text-text-tertiary text-[10px] truncate hidden sm:inline" title={l.liquidated_user}>
                    {truncateAddress(l.liquidated_user)}
                  </span>
                  <span className="mono font-semibold text-gold ml-auto whitespace-nowrap">
                    {compactUsd(l.notional_total)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
});
