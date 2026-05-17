"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Skull } from "lucide-react";
import { buildLiquidations, LiquidationBucket } from "./mockData";

function formatUsd(n: number) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

export function LiquidationFlowChart() {
  const buckets: LiquidationBucket[] = useMemo(() => buildLiquidations(), []);
  const [hover, setHover] = useState<LiquidationBucket | null>(null);

  const maxSide = useMemo(
    () => Math.max(...buckets.flatMap((b) => [b.longs, b.shorts])),
    [buckets]
  );
  const totalLongs = buckets.reduce((s, b) => s + b.longs, 0);
  const totalShorts = buckets.reduce((s, b) => s + b.shorts, 0);

  const maxPainLong = [...buckets].sort((a, b) => b.longs - a.longs)[0];
  const maxPainShort = [...buckets].sort((a, b) => b.shorts - a.shorts)[0];

  // Order buckets from highest price to lowest (top → bottom)
  const ordered = [...buckets].sort((a, b) => b.price - a.price);
  const lastPrice = 3847;

  return (
    <div className="bg-surface border border-border-subtle rounded-lg relative overflow-hidden h-[460px] flex flex-col p-6">
      {/* Bg glow */}
      <div className="pointer-events-none absolute -top-24 left-1/4 h-64 w-64 rounded-full bg-rose-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-1/4 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

      {/* HEADER */}
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-muted">
            <span className="h-1 w-1 rounded-full bg-rose-400" />
            Liquidation Heatmap
            <span className="text-text-muted/60">·</span>
            <span>HYPE-PERP · 24h</span>
          </div>
          <div className="mt-1 text-[28px] font-bold text-text-primary tabular-nums tracking-tight">
            {formatUsd(totalLongs + totalShorts)}
          </div>
          <div className="text-[11px] text-text-muted">
            Total liquidated across {buckets.length} price levels
          </div>
        </div>

        {/* Long/short split bar */}
        <div className="flex flex-col items-end gap-2 min-w-[220px]">
          <div className="flex items-center justify-between w-full text-[10px] font-semibold uppercase tracking-wider">
            <span className="flex items-center gap-1 text-rose-400">
              <Skull className="h-3 w-3" /> Longs {formatUsd(totalLongs)}
            </span>
            <span className="flex items-center gap-1 text-emerald-400">
              Shorts {formatUsd(totalShorts)} <Flame className="h-3 w-3" />
            </span>
          </div>
          <div className="flex h-2 w-full overflow-hidden rounded-full bg-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${(totalLongs / (totalLongs + totalShorts)) * 100}%`,
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="bg-gradient-to-r from-rose-500 to-rose-400"
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${(totalShorts / (totalLongs + totalShorts)) * 100}%`,
              }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
              className="bg-gradient-to-r from-emerald-400 to-emerald-500"
            />
          </div>
          <div className="flex w-full justify-between text-[10px] text-text-muted tabular-nums">
            <span>Max pain ${maxPainLong.price.toLocaleString()}</span>
            <span>Max pain ${maxPainShort.price.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* CHART BODY */}
      <div className="relative z-10 mt-5 flex-1 min-h-0 flex flex-col">
        {/* column labels */}
        <div className="grid grid-cols-[70px_1fr_60px_1fr_70px] items-center pb-2 text-[9px] font-semibold uppercase tracking-wider text-text-muted">
          <span>Longs</span>
          <span className="text-right pr-2">Size</span>
          <span className="text-center text-text-secondary">Price</span>
          <span className="pl-2">Size</span>
          <span className="text-right">Shorts</span>
        </div>

        <div
          className="flex-1 min-h-0 overflow-y-auto pr-1"
          onMouseLeave={() => setHover(null)}
        >
          {ordered.map((b) => {
            const longRatio = b.longs / maxSide;
            const shortRatio = b.shorts / maxSide;
            const isLastPrice = Math.abs(b.price - lastPrice) < 60;
            const isHovered = hover?.price === b.price;

            return (
              <div
                key={b.price}
                onMouseEnter={() => setHover(b)}
                className={`grid grid-cols-[70px_1fr_60px_1fr_70px] items-center py-[3px] rounded-md cursor-default transition-colors ${
                  isHovered ? "bg-white/[0.03]" : ""
                }`}
              >
                {/* Long amount text */}
                <span className="text-[10px] font-semibold tabular-nums text-rose-400/90 text-left">
                  {b.longs > 100_000 ? formatUsd(b.longs) : ""}
                </span>

                {/* Long bar (right aligned) */}
                <div className="relative flex h-5 items-center justify-end pr-1">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: longRatio }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    style={{
                      transformOrigin: "right center",
                      background: `linear-gradient(90deg, rgba(244,63,94,${
                        0.15 + longRatio * 0.6
                      }), rgba(244,63,94,${0.35 + longRatio * 0.55}))`,
                      boxShadow:
                        longRatio > 0.6
                          ? "inset 0 0 12px rgba(244,63,94,0.35)"
                          : "none",
                    }}
                    className="h-full w-full rounded-l-sm"
                  />
                </div>

                {/* Price */}
                <div className="text-center">
                  <span
                    className={`tabular-nums text-[11px] font-semibold ${
                      isLastPrice ? "text-brand-accent" : "text-text-secondary"
                    }`}
                  >
                    ${b.price.toLocaleString()}
                  </span>
                  {isLastPrice && (
                    <div className="mx-auto mt-0.5 h-[2px] w-8 rounded-full bg-brand-accent shadow-[0_0_8px_rgba(131,233,255,0.8)]" />
                  )}
                </div>

                {/* Short bar (left aligned) */}
                <div className="relative flex h-5 items-center justify-start pl-1">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: shortRatio }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    style={{
                      transformOrigin: "left center",
                      background: `linear-gradient(90deg, rgba(16,185,129,${
                        0.35 + shortRatio * 0.55
                      }), rgba(16,185,129,${0.15 + shortRatio * 0.6}))`,
                      boxShadow:
                        shortRatio > 0.6
                          ? "inset 0 0 12px rgba(16,185,129,0.35)"
                          : "none",
                    }}
                    className="h-full w-full rounded-r-sm"
                  />
                </div>

                {/* Short amount text */}
                <span className="text-[10px] font-semibold tabular-nums text-emerald-400/90 text-right">
                  {b.shorts > 100_000 ? formatUsd(b.shorts) : ""}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer / hover detail */}
        <div className="mt-3 flex items-center justify-between border-t border-border-subtle pt-3 text-[11px] text-text-muted tabular-nums">
          {hover ? (
            <>
              <span>
                <span className="text-text-secondary">Level </span>
                <span className="font-semibold text-text-primary">${hover.price.toLocaleString()}</span>
              </span>
              <span>
                <span className="text-rose-400">Longs {formatUsd(hover.longs)}</span>
                <span className="mx-2 text-text-muted/50">·</span>
                <span className="text-emerald-400">Shorts {formatUsd(hover.shorts)}</span>
              </span>
            </>
          ) : (
            <>
              <span>Last price ${lastPrice.toLocaleString()}</span>
              <span className="text-text-muted/70">Hover a level for detail</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
