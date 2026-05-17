"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, DollarSign } from "lucide-react";
import { ChartLoading, ChartEmpty, ChartWatermark } from "@/components/common";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import type { BuilderTopRow } from "@/services/indexer/builders/types";
import { formatBuilderDisplayNameOrAddress } from "./formatBuilderDisplayName";

interface BuildersFlowChartProps {
  rows: BuilderTopRow[];
  isLoading: boolean;
  timeframe: string;
}

export function BuildersFlowChart({ rows, isLoading, timeframe }: BuildersFlowChartProps) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const top = useMemo(
    () => [...rows].sort((a, b) => (b.totalVolume ?? 0) - (a.totalVolume ?? 0)).slice(0, 10),
    [rows]
  );

  const maxVol = Math.max(...top.map((r) => r.totalVolume ?? 0), 1);

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
      className="bg-surface border border-border-subtle rounded-lg overflow-hidden"
    >
      {/* CARD HEADER (V4 ref: px-3.5 py-3 border-b, title-row + small tabs) */}
      <div className="flex items-center justify-between px-3.5 py-3 border-b border-border-subtle gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="h-[5px] w-[5px] rounded-full bg-brand shrink-0" />
          <span className="text-[11px] uppercase tracking-wide font-medium text-text-tertiary truncate">
            Volume vs Builder Fees · Top 10 · {timeframe}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-medium uppercase tracking-wider shrink-0">
          <span className="flex items-center gap-1.5 text-brand">
            <BarChart3 className="h-3 w-3" />
            Volume
          </span>
          <span className="flex items-center gap-1.5 text-gold">
            <DollarSign className="h-3 w-3" />
            Fees
          </span>
        </div>
      </div>

      {/* CARD BODY */}
      <div className="relative p-3.5 min-h-[320px]">
        <ChartWatermark />
        {isLoading && top.length === 0 ? (
          <ChartLoading />
        ) : top.length === 0 ? (
          <ChartEmpty message="No builder data" />
        ) : (
          <div className="relative z-10 flex flex-col">
            {/* Total + sub */}
            <div className="flex items-baseline justify-between mb-3 px-1">
              <div className="mono text-[18px] font-semibold text-text-primary leading-none">
                {compactUsd(totals.vol)}
              </div>
              <div className="mono text-[10px] uppercase tracking-wider text-text-tertiary">
                {compactUsd(totals.fees)} fees · top 10
              </div>
            </div>

            {/* Column labels */}
            <div className="grid grid-cols-[20px_80px_1fr_70px_60px] gap-2.5 items-center pb-1.5 text-[10px] font-medium uppercase tracking-wider text-text-tertiary">
              <span>#</span>
              <span>Builder</span>
              <span>Volume</span>
              <span className="text-right">Fees</span>
              <span className="text-right">Efficiency</span>
            </div>

            {/* Rows */}
            <div className="flex flex-col gap-1.5" onMouseLeave={() => setHoverIdx(null)}>
              {top.map((row, i) => {
                const vol = row.totalVolume ?? 0;
                const fees = row.totalBuilderFees ?? 0;
                const volRatio = vol / maxVol;
                const name = formatBuilderDisplayNameOrAddress(row.builderName, row.builder);
                const bps = vol > 0 ? (fees / vol) * 10000 : 0;
                const isAnonymous = name.startsWith("0x");
                const isHovered = hoverIdx === i;
                const bpsClass =
                  bps >= 10 ? "text-gold" : bps >= 3 ? "text-text-secondary" : "text-text-tertiary";

                return (
                  <motion.div
                    key={row.builder}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.25 }}
                    onMouseEnter={() => setHoverIdx(i)}
                    className={`grid grid-cols-[20px_80px_1fr_70px_60px] gap-2.5 items-center text-[11px] cursor-default transition-colors ${
                      isHovered ? "bg-surface-2 -mx-1 px-1 rounded" : ""
                    }`}
                  >
                    {/* Rank */}
                    <span className="mono text-[10px] text-text-tertiary text-right">
                      {i + 1}
                    </span>

                    {/* Name */}
                    <span
                      className={`text-[11px] truncate ${
                        isAnonymous ? "mono text-text-secondary" : "font-medium text-text-primary"
                      }`}
                    >
                      {name}
                    </span>

                    {/* Volume bar — solid brand fill with value inside (V4 ref) */}
                    <div className="h-[18px] bg-surface-2 rounded-[3px] relative overflow-hidden">
                      <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: `${Math.max(volRatio * 100, 6)}%` }}
                        transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.03 }}
                        className="h-full bg-brand rounded-[3px] flex items-center px-1.5"
                      >
                        <span className="mono text-[10px] font-medium text-brand-text-on whitespace-nowrap">
                          {compactUsd(vol)}
                        </span>
                      </motion.div>
                    </div>

                    {/* Fees value */}
                    <span className="mono text-[11px] text-text-secondary text-right">
                      {compactUsd(fees)}
                    </span>

                    {/* Efficiency bps */}
                    <span className={`mono text-[10px] text-right ${bpsClass}`}>
                      {vol > 0 ? `${bps.toFixed(2)} bps` : "—"}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* CARD FOOTER — V4 pedagogical */}
      {top.length > 0 && (
        <div className="px-3.5 py-2.5 border-t border-border-subtle flex items-center justify-between text-[10px] text-text-tertiary">
          {hoverIdx !== null && top[hoverIdx] ? (
            <>
              <span>
                <span className="mono text-text-secondary">#{hoverIdx + 1}</span>{" "}
                <span className="text-text-primary">
                  {formatBuilderDisplayNameOrAddress(top[hoverIdx].builderName, top[hoverIdx].builder)}
                </span>
              </span>
              <span>
                <span className="text-brand">Vol <span className="mono">{compactUsd(top[hoverIdx].totalVolume ?? 0)}</span></span>
                <span className="mx-2 text-text-tertiary/50">·</span>
                <span className="text-gold">Fees <span className="mono">{compactUsd(top[hoverIdx].totalBuilderFees ?? 0)}</span></span>
              </span>
            </>
          ) : (
            <>
              <span>{top.length} builders shown · sorted by volume</span>
              <span className="mono">bps = basis points (fees / volume)</span>
            </>
          )}
        </div>
      )}
    </motion.div>
  );
}
