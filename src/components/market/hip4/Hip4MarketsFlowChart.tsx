"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChartLoading, ChartEmpty } from "@/components/common";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import type { Hip4MarketEnrichedRow } from "@/services/indexer/hip4";

function pctColor(px: number | null) {
  if (px === null) return "text-text-tertiary";
  if (px >= 0.7) return "text-emerald-400";
  if (px >= 0.5) return "text-gold";
  return "text-rose-400";
}

interface Hip4MarketsFlowChartProps {
  markets: Hip4MarketEnrichedRow[];
  isLoading: boolean;
}

export function Hip4MarketsFlowChart({ markets, isLoading }: Hip4MarketsFlowChartProps) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const top = useMemo(
    () => [...(Array.isArray(markets) ? markets : [])].sort((a, b) => (b.total_volume ?? 0) - (a.total_volume ?? 0)).slice(0, 10),
    [markets]
  );

  const maxVol = Math.max(...top.map((r) => r.total_volume ?? 0), 1);
  const maxOI = Math.max(...top.map((r) => r.open_interest ?? 0), 1);

  const totals = useMemo(() => ({
    vol: top.reduce((s, r) => s + (r.total_volume ?? 0), 0),
    oi: top.reduce((s, r) => s + (r.open_interest ?? 0), 0),
  }), [top]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.35 }}
      className="bg-surface border border-border-subtle rounded-lg relative overflow-hidden p-6 flex flex-col"
    >
      <div className="pointer-events-none absolute -top-24 left-1/4 h-64 w-64 rounded-full bg-brand/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-1/4 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative z-10 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-tertiary">
            <span className="h-1 w-1 rounded-full bg-brand" />
            Volume vs Open Interest · Top 10
          </div>
          <div className="mt-1 flex items-baseline gap-3">
            <span className="text-[22px] font-bold text-text-primary tabular-nums tracking-tight">{compactUsd(totals.vol)}</span>
            <span className="text-sm text-violet-400 tabular-nums">{compactUsd(totals.oi)} OI</span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-wider">
          <span className="flex items-center gap-1.5 text-brand">
            <span className="h-2 w-2 rounded-sm bg-brand/60" />Volume
          </span>
          <span className="flex items-center gap-1.5 text-violet-400">
            <span className="h-2 w-2 rounded-sm bg-violet-400/60" />Open Interest
          </span>
        </div>
      </div>

      {isLoading && top.length === 0 ? (
        <div className="mt-4 min-h-[320px]"><ChartLoading /></div>
      ) : top.length === 0 ? (
        <div className="mt-4 min-h-[320px]"><ChartEmpty message="No market data" /></div>
      ) : (
        <div className="relative z-10 mt-5 flex-1 min-h-0 flex flex-col">
          <div className="grid grid-cols-[28px_140px_1fr_80px_1fr] items-center pb-2 text-[9px] font-semibold uppercase tracking-wider text-text-tertiary">
            <span>#</span>
            <span>Market</span>
            <span className="text-right pr-2">Volume</span>
            <span className="text-center">Prob</span>
            <span className="pl-2">Open Interest</span>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 scrollbar-brand" onMouseLeave={() => setHoverIdx(null)}>
            {top.map((row, i) => {
              const vol = row.total_volume ?? 0;
              const oi = row.open_interest ?? 0;
              const volRatio = vol / maxVol;
              const oiRatio = oi / maxOI;
              const isHovered = hoverIdx === i;
              const rankColor = i === 0 ? "text-gold" : i === 1 ? "text-text-primary" : i === 2 ? "text-amber-600" : "text-text-tertiary";
              const label = row.display_name || row.coin || `#${row.outcome_id}`;

              return (
                <motion.div
                  key={row.outcome_id}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.25 }}
                  onMouseEnter={() => setHoverIdx(i)}
                  className={`grid grid-cols-[28px_140px_1fr_80px_1fr] items-center py-1.5 rounded-md cursor-default transition-colors ${isHovered ? "bg-white/[0.04]" : ""}`}
                >
                  <span className={`text-sm font-bold tabular-nums ${rankColor}`}>{i + 1}</span>

                  <div className="min-w-0 pr-2">
                    <span className="block text-xs font-semibold text-text-primary truncate">{label}</span>
                    {row.is_settled && (
                      <span className="text-[9px] text-emerald-400 font-medium">Settled</span>
                    )}
                  </div>

                  <div className="relative flex h-6 min-w-0 items-center justify-end pr-2">
                    <span className="pointer-events-none absolute right-2 top-1/2 z-10 -translate-y-1/2 text-[10px] font-semibold tabular-nums text-text-primary whitespace-nowrap drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                      {compactUsd(vol)}
                    </span>
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: volRatio }}
                      transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.03 }}
                      style={{
                        transformOrigin: "right center",
                        background: `linear-gradient(90deg, rgba(131,233,255,${0.15 + volRatio * 0.5}), rgba(131,233,255,${0.35 + volRatio * 0.55}))`,
                      }}
                      className="h-full w-full rounded-l-md"
                      aria-hidden
                    />
                  </div>

                  <div className="text-center">
                    <span className={`tabular-nums text-[11px] font-semibold ${pctColor(row.mid_price)}`}>
                      {row.mid_price != null ? `${(row.mid_price * 100).toFixed(1)}%` : "—"}
                    </span>
                  </div>

                  <div className="flex h-6 min-w-0 items-center pl-2 pr-1">
                    <div className="relative min-h-[24px] min-w-0 flex-1">
                      <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: `${oiRatio * 100}%` }}
                        transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.03 + 0.1 }}
                        style={{
                          background: `linear-gradient(90deg, rgba(167,139,250,${0.35 + oiRatio * 0.55}), rgba(167,139,250,${0.15 + oiRatio * 0.5}))`,
                        }}
                        className="relative h-6 min-w-0 max-w-full overflow-visible rounded-r-md"
                      >
                        <span className="pointer-events-none absolute left-1.5 top-1/2 z-10 -translate-y-1/2 text-[10px] font-semibold tabular-nums text-text-primary whitespace-nowrap [text-shadow:0_0_1px_rgba(0,0,0,0.95),0_1px_3px_rgba(0,0,0,0.9)]">
                          {compactUsd(oi)}
                        </span>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-border-subtle pt-3 text-[11px] text-text-tertiary tabular-nums">
            {hoverIdx !== null && top[hoverIdx] ? (
              <>
                <span className="font-semibold text-text-primary truncate max-w-[200px]">{top[hoverIdx].display_name || top[hoverIdx].coin || `#${top[hoverIdx].outcome_id}`}</span>
                <span>
                  <span className="text-brand">Vol {compactUsd(top[hoverIdx].total_volume ?? 0)}</span>
                  <span className="mx-2 text-text-tertiary/50">·</span>
                  <span className="text-violet-400">OI {compactUsd(top[hoverIdx].open_interest ?? 0)}</span>
                  <span className="mx-2 text-text-tertiary/50">·</span>
                  <span className={pctColor(top[hoverIdx].mid_price)}>
                    {top[hoverIdx].mid_price !== null ? `${(top[hoverIdx].mid_price! * 100).toFixed(1)}%` : "—"}
                  </span>
                </span>
              </>
            ) : (
              <>
                <span>{top.length} markets shown</span>
                <span className="text-text-tertiary/70">Hover a row · Prob = mid price probability</span>
              </>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
