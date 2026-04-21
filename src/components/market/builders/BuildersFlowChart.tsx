"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, DollarSign } from "lucide-react";
import { ChartLoading, ChartEmpty } from "@/components/common/charts";
import type { BuilderTopRow } from "@/services/indexer/builders/types";
import { formatBuilderDisplayNameOrAddress } from "./formatBuilderDisplayName";

interface BuildersFlowChartProps {
  rows: BuilderTopRow[];
  isLoading: boolean;
  timeframe: string;
}

function compactUsd(n: number) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

export function BuildersFlowChart({ rows, isLoading, timeframe }: BuildersFlowChartProps) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const top = useMemo(
    () => [...rows].sort((a, b) => (b.totalVolume ?? 0) - (a.totalVolume ?? 0)).slice(0, 10),
    [rows]
  );

  const maxVol = Math.max(...top.map((r) => r.totalVolume ?? 0), 1);
  const maxFees = Math.max(...top.map((r) => r.totalBuilderFees ?? 0), 1);

  const totals = useMemo(() => {
    const vol = top.reduce((s, r) => s + (r.totalVolume ?? 0), 0);
    const fees = top.reduce((s, r) => s + (r.totalBuilderFees ?? 0), 0);
    return { vol, fees };
  }, [top]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.35 }}
      className="glass-panel relative overflow-hidden p-6 flex flex-col"
    >
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -top-24 left-1/4 h-64 w-64 rounded-full bg-brand-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-1/4 h-64 w-64 rounded-full bg-brand-gold/10 blur-3xl" />

      {/* HEADER */}
      <div className="relative z-10 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-muted">
            <span className="h-1 w-1 rounded-full bg-brand-accent" />
            Volume vs Builder Fees
            <span className="text-text-muted/60">·</span>
            <span>Top 10 · {timeframe}</span>
          </div>
          <div className="mt-1 flex items-baseline gap-3">
            <span className="text-[22px] font-bold text-white tabular-nums tracking-tight">
              {compactUsd(totals.vol)}
            </span>
            <span className="text-sm text-brand-gold tabular-nums">
              {compactUsd(totals.fees)} fees
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-wider">
          <span className="flex items-center gap-1.5 text-brand-accent">
            <BarChart3 className="h-3 w-3" />
            Volume
          </span>
          <span className="flex items-center gap-1.5 text-brand-gold">
            <DollarSign className="h-3 w-3" />
            Fees
          </span>
        </div>
      </div>

      {/* BODY */}
      {isLoading && top.length === 0 ? (
        <div className="mt-4 min-h-[320px]">
          <ChartLoading />
        </div>
      ) : top.length === 0 ? (
        <div className="mt-4 min-h-[320px]">
          <ChartEmpty message="No builder data" />
        </div>
      ) : (
        <div className="relative z-10 mt-5 flex-1 min-h-0 flex flex-col">
          {/* column labels */}
          <div className="grid grid-cols-[34px_120px_1fr_90px_1fr] items-center pb-2 text-[9px] font-semibold uppercase tracking-wider text-text-muted">
            <span>#</span>
            <span>Builder</span>
            <span className="text-right pr-2">Volume</span>
            <span className="text-center text-text-secondary">Fees</span>
            <span className="pl-2 text-left">Fee Efficiency</span>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent" onMouseLeave={() => setHoverIdx(null)}>
            {top.map((row, i) => {
              const vol = row.totalVolume ?? 0;
              const fees = row.totalBuilderFees ?? 0;
              const volRatio = vol / maxVol;
              const feesRatio = fees / maxFees;
              const name = formatBuilderDisplayNameOrAddress(row.builderName, row.builder);
              const isHovered = hoverIdx === i;
              const rankColor =
                i === 0 ? "text-brand-gold" : i === 1 ? "text-zinc-300" : i === 2 ? "text-amber-600" : "text-text-muted";

              return (
                <motion.div
                  key={row.builder}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.25 }}
                  onMouseEnter={() => setHoverIdx(i)}
                  className={`grid grid-cols-[34px_120px_1fr_90px_1fr] items-center py-1.5 rounded-md cursor-default transition-colors ${
                    isHovered ? "bg-white/[0.04]" : ""
                  }`}
                >
                  {/* Rank */}
                  <span className={`text-sm font-bold tabular-nums ${rankColor}`}>
                    {i + 1}
                  </span>

                  {/* Name */}
                  <span className="text-xs font-semibold text-white truncate pr-2">
                    {name}
                  </span>

                  {/* Volume: label always readable (not clipped inside narrow bar) */}
                  <div className="relative flex h-6 min-w-0 items-center justify-end pr-2">
                    <span
                      className="pointer-events-none absolute right-2 top-1/2 z-10 -translate-y-1/2 text-[10px] font-semibold tabular-nums text-white whitespace-nowrap drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
                      title={compactUsd(vol)}
                    >
                      {compactUsd(vol)}
                    </span>
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: volRatio }}
                      transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.03 }}
                      style={{
                        transformOrigin: "right center",
                        background: `linear-gradient(90deg, rgba(131,233,255,${0.15 + volRatio * 0.5}), rgba(131,233,255,${0.35 + volRatio * 0.55}))`,
                        boxShadow: volRatio > 0.6 ? "inset 0 0 12px rgba(131,233,255,0.35)" : "none",
                      }}
                      className="h-full w-full rounded-l-md"
                      aria-hidden
                    />
                  </div>

                  {/* Center — fees amount */}
                  <div className="text-center">
                    <span className="tabular-nums text-[11px] font-semibold text-brand-gold">
                      {compactUsd(fees)}
                    </span>
                  </div>

                  {/* Fee efficiency: bar grows from the left (layout unchanged); bps at the *start* of the fill — same idea as volume (label at the bar origin). */}
                  <div className="flex h-6 min-w-0 items-center pl-2 pr-1">
                    <div className="relative min-h-[24px] min-w-0 flex-1">
                      <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: `${feesRatio * 100}%` }}
                        transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.03 + 0.1 }}
                        style={{
                          background: `linear-gradient(90deg, rgba(249,227,112,${0.35 + feesRatio * 0.55}), rgba(249,227,112,${0.15 + feesRatio * 0.5}))`,
                          boxShadow: feesRatio > 0.6 ? "inset 0 0 12px rgba(249,227,112,0.35)" : "none",
                        }}
                        className="relative h-6 min-w-0 max-w-full overflow-visible rounded-r-md"
                      >
                        <span
                          className="pointer-events-none absolute left-1.5 top-1/2 z-10 -translate-y-1/2 text-[10px] font-semibold tabular-nums text-white whitespace-nowrap [text-shadow:0_0_1px_rgba(0,0,0,0.95),0_1px_3px_rgba(0,0,0,0.9),0_0_8px_rgba(0,0,0,0.45)]"
                          title={vol > 0 ? `${((fees / vol) * 10000).toFixed(4)} bps` : undefined}
                        >
                          {vol > 0 ? `${((fees / vol) * 10000).toFixed(2)} bps` : "—"}
                        </span>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-3 flex items-center justify-between border-t border-border-subtle pt-3 text-[11px] text-text-muted tabular-nums">
            {hoverIdx !== null && top[hoverIdx] ? (
              <>
                <span>
                  <span className="text-text-secondary">#{hoverIdx + 1}</span>{" "}
                  <span className="font-semibold text-white">
                    {formatBuilderDisplayNameOrAddress(top[hoverIdx].builderName, top[hoverIdx].builder)}
                  </span>
                </span>
                <span>
                  <span className="text-brand-accent">Vol {compactUsd(top[hoverIdx].totalVolume ?? 0)}</span>
                  <span className="mx-2 text-text-muted/50">·</span>
                  <span className="text-brand-gold">Fees {compactUsd(top[hoverIdx].totalBuilderFees ?? 0)}</span>
                  <span className="mx-2 text-text-muted/50">·</span>
                  <span className="text-white">{top[hoverIdx].uniqueUsers} users</span>
                </span>
              </>
            ) : (
              <>
                <span>{top.length} builders shown</span>
                <span className="text-text-muted/70">Hover a row for detail · bps = basis points of fees over volume</span>
              </>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
