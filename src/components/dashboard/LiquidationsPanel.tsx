"use client";

import { memo, useMemo, useState } from "react";
import { Flame } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  useLiquidationsData,
  useRecentLiquidations,
} from "@/services/explorer/liquidation";
import type { Liquidation } from "@/services/explorer/liquidation";
import { compactUsd, truncateAddress } from "@/lib/formatters/numberFormatting";
import { timeAgo } from "@/lib/formatters/dateFormatting";
import { chartPalette, TokenAvatar } from "@/components/common";

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
 * Real data only; the cumulative arrays + the standouts are derived client-side
 * from `/liquidations/recent`. Note `time_ms` corruption — we always parse the
 * ISO `time` field (see `getLiqTimeMs`).
 */

/** Histogram config: 48 buckets × 30 min covering 24h. */
const HIST_BUCKET_MS = 30 * 60 * 1000;
const HIST_BUCKET_COUNT = 48;
const HIST_WINDOW_HOURS = 24;
const HIST_FETCH_LIMIT = 1000;

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
 * Build 48 cumulative buckets aligned on `now`: the last bucket ends at `now`,
 * the first starts at `now - 24h`. Each bucket carries the cumulative long /
 * short $ liquidated up to and including its window.
 */
function buildCumulative(liquidations: Liquidation[]): CumulativeBucket[] {
  const now = Date.now();
  const startMs = now - HIST_BUCKET_COUNT * HIST_BUCKET_MS;

  const longInc = new Array<number>(HIST_BUCKET_COUNT).fill(0);
  const shortInc = new Array<number>(HIST_BUCKET_COUNT).fill(0);

  for (const liq of liquidations) {
    const ms = getLiqTimeMs(liq);
    const idx = Math.floor((ms - startMs) / HIST_BUCKET_MS);
    if (idx < 0 || idx >= HIST_BUCKET_COUNT) continue;
    if (liq.liq_dir === "Long") longInc[idx] += liq.notional_total;
    else shortInc[idx] += liq.notional_total;
  }

  const out: CumulativeBucket[] = [];
  let lc = 0;
  let sc = 0;
  for (let i = 0; i < HIST_BUCKET_COUNT; i++) {
    lc += longInc[i];
    sc += shortInc[i];
    out.push({
      timestampMs: startMs + i * HIST_BUCKET_MS,
      longCum: lc,
      shortCum: sc,
      longInc: longInc[i],
      shortInc: shortInc[i],
    });
  }
  return out;
}

/** Return a reliable ms timestamp for a liquidation row.
 *
 *  The `/liquidations/recent` endpoint returns corrupted `time_ms` for ~20% of
 *  rows (values ~3.5e12 → year 2082) while the ISO `time` field stays correct.
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
  // 24h aggregated stats (totals, long/short split, top coin).
  const { stats } = useLiquidationsData("24h", 30000);

  // Recent feed — used for both the cumulative chart and the standouts list.
  const {
    liquidations: feed,
    isLoading: feedLoading,
  } = useRecentLiquidations({
    limit: HIST_FETCH_LIMIT,
    hours: HIST_WINDOW_HOURS,
    refreshInterval: 30000,
  });

  const longTotal = stats.longVolume ?? 0;
  const shortTotal = stats.shortVolume ?? 0;
  const longPct = stats.totalVolume > 0 ? (longTotal / stats.totalVolume) * 100 : 0;
  const shortPct = 100 - longPct;

  /** Raw 48 × 30min cumulative buckets covering 24h. */
  const rawCumulative = useMemo(() => buildCumulative(feed), [feed]);

  /**
   * Trim leading empty buckets — with `/recent` capped at 1000 rows the real
   * coverage is often only 4-8h. Leading empty buckets would render flat lines
   * over wasted space; trimming fills the card width with actual data.
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

  /** Top N standouts: liquidations ≥ $100K, sorted by notional desc. */
  const standouts = useMemo(() => {
    return [...feed]
      .filter((l) => l.notional_total >= STANDOUT_THRESHOLD_USD)
      .sort((a, b) => b.notional_total - a.notional_total)
      .slice(0, STANDOUT_LIMIT);
  }, [feed]);

  return (
    <Card className="overflow-hidden flex flex-col">
      {/* V4 card-head */}
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle">
        <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
          <Flame size={13} className="text-brand" />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">Liquidations</h3>
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle">
          24h
        </span>
        <span className="ml-auto flex items-center gap-1.5 text-[10px] text-text-tertiary mono">
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
      </div>

      {/* Hero — 3-col strip (Total / Long / Short) */}
      <div className="grid grid-cols-[1.2fr_1fr_1fr] gap-px bg-border-subtle border-b border-border-subtle">
        <div className="bg-surface px-4 py-3">
          <div className="text-[9.5px] uppercase tracking-[0.06em] text-text-tertiary font-semibold">
            Total liquidated 24h
          </div>
          <div className="mono text-[22px] font-semibold tracking-[-0.02em] text-text-primary mt-1 leading-none">
            {compactUsd(stats.totalVolume)}
          </div>
          <div className="text-[10px] text-text-tertiary mt-1.5 mono">
            {stats.liquidationsCount.toLocaleString()} events · avg{" "}
            {compactUsd(stats.avgSize)}
          </div>
        </div>
        <div className="bg-surface px-4 py-3">
          <div className="text-[9.5px] uppercase tracking-[0.06em] text-text-tertiary font-semibold">
            Long ↗
          </div>
          <div className="mono text-[22px] font-semibold tracking-[-0.02em] text-success mt-1 leading-none">
            {compactUsd(longTotal)}
          </div>
          <div className="text-[10px] text-text-tertiary mt-1.5 mono">
            {Math.round(longPct)}% · {stats.longCount.toLocaleString()} events
          </div>
        </div>
        <div className="bg-surface px-4 py-3">
          <div className="text-[9.5px] uppercase tracking-[0.06em] text-text-tertiary font-semibold">
            Short ↘
          </div>
          <div className="mono text-[22px] font-semibold tracking-[-0.02em] text-danger mt-1 leading-none">
            {compactUsd(shortTotal)}
          </div>
          <div className="text-[10px] text-text-tertiary mt-1.5 mono">
            {Math.round(shortPct)}% · {stats.shortCount.toLocaleString()} events
          </div>
        </div>
      </div>

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
            {feedLoading ? "Loading…" : "No liquidations in the last 24h"}
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
            {feedLoading
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
                  <span className="font-semibold text-text-primary truncate">
                    {l.coin}
                  </span>
                  <span className="mono text-text-tertiary text-[10px] truncate">
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
