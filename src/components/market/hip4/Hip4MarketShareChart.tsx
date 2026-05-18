"use client";

import { useMemo, useState, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cell, Pie, PieChart, ResponsiveContainer, Sector } from "recharts";
import { ChartLoading, ChartEmpty, chartPalette, chartColors } from "@/components/common";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import type { Hip4MarketEnrichedRow } from "@/services/indexer/hip4";
import { categorizeMarket, CATEGORY_LABELS } from "@/lib/hip4-category";

const SLICE_PALETTE = chartPalette.multiSeries;
const SLICE_FALLBACK = chartColors.textMuted;
const SLICE_OTHERS_COLOR = "rgb(82 82 91)";

interface ActiveShapeProps {
  cx?: number; cy?: number;
  innerRadius?: number; outerRadius?: number;
  startAngle?: number; endAngle?: number;
  fill?: string;
}

function ActiveArc({ cx = 0, cy = 0, innerRadius = 0, outerRadius = 0, startAngle = 0, endAngle = 0, fill = chartPalette.white }: ActiveShapeProps) {
  return (
    <g>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 8} startAngle={startAngle} endAngle={endAngle} fill={fill} />
      <Sector cx={cx} cy={cy} innerRadius={outerRadius + 10} outerRadius={outerRadius + 13} startAngle={startAngle} endAngle={endAngle} fill={fill} opacity={0.45} />
    </g>
  );
}

interface Hip4MarketShareChartProps {
  markets: Hip4MarketEnrichedRow[];
  isLoading: boolean;
}

export function Hip4MarketShareChart({ markets, isLoading }: Hip4MarketShareChartProps) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const layoutId = useId().replace(/:/g, "");

  const { slices, total } = useMemo(() => {
    if (!Array.isArray(markets) || !markets.length) return { slices: [], total: 0 };
    const byCategory: Record<string, number> = {};
    for (const m of markets) {
      const category = categorizeMarket(m);
      const label = CATEGORY_LABELS[category];
      byCategory[label] = (byCategory[label] ?? 0) + (m.total_volume ?? 0);
    }
    const sorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
    const total = sorted.reduce((s, [, v]) => s + v, 0);
    const slices = sorted.slice(0, 10).map(([name, value], i) => ({
      name,
      value,
      color: SLICE_PALETTE[i] ?? SLICE_FALLBACK,
    }));
    const othersValue = sorted.slice(10).reduce((s, [, v]) => s + v, 0);
    if (othersValue > 0) slices.push({ name: "Others", value: othersValue, color: SLICE_OTHERS_COLOR });
    return { slices, total };
  }, [markets]);

  const displayed = activeIdx !== null && slices[activeIdx] ? slices[activeIdx] : null;
  const displayedValue = displayed ? displayed.value : total;
  const displayedPct = total > 0 ? (displayedValue / total) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.35 }}
      className="bg-surface border border-border-subtle rounded-lg relative overflow-hidden p-6"
    >
      <motion.div
        animate={{
          background: displayed
            ? `radial-gradient(circle at 30% 30%, ${displayed.color}33, transparent 60%)`
            : "radial-gradient(circle at 30% 30%, rgba(131,233,255,0.12), transparent 60%)",
        }}
        transition={{ duration: 0.5 }}
        className="pointer-events-none absolute inset-0 opacity-70"
      />

      <div className="relative z-10 mb-4">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-tertiary">
          <span className="h-1 w-1 rounded-full bg-brand" />
          Volume by Category
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${displayed?.name ?? "total"}-${displayedValue.toFixed(0)}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-1 text-[28px] font-bold text-text-primary tabular-nums tracking-tight"
          >
            {compactUsd(displayedValue)}
          </motion.div>
        </AnimatePresence>
        <div className="text-[11px] text-text-tertiary">
          {displayed
            ? <span><span className="text-text-primary">{displayed.name}</span> · {displayedPct.toFixed(1)}% of total</span>
            : <span>{slices.length} categories</span>
          }
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-4 items-center min-h-[280px]">
        {isLoading && slices.length === 0 ? (
          <div className="md:col-span-2"><ChartLoading /></div>
        ) : slices.length === 0 ? (
          <div className="md:col-span-2"><ChartEmpty message="No market data" /></div>
        ) : (
          <>
            <div className="relative h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    {slices.map((s, i) => (
                      <radialGradient key={s.name} id={`hip4-slice-${layoutId}-${i}`} cx="50%" cy="50%" r="75%">
                        <stop offset="0%" stopColor={s.color} stopOpacity={0.95} />
                        <stop offset="100%" stopColor={s.color} stopOpacity={0.65} />
                      </radialGradient>
                    ))}
                  </defs>
                  <Pie
                    data={slices}
                    dataKey="value"
                    nameKey="name"
                    cx="50%" cy="50%"
                    innerRadius="62%" outerRadius="88%"
                    paddingAngle={2} startAngle={90} endAngle={-270}
                    activeShape={ActiveArc}
                    onMouseEnter={(_, idx) => setActiveIdx(idx)}
                    onMouseLeave={() => setActiveIdx(null)}
                    stroke="transparent"
                    isAnimationActive={false}
                  >
                    {slices.map((s, i) => (
                      <Cell
                        key={s.name}
                        fill={`url(#hip4-slice-${layoutId}-${i})`}
                        style={{ filter: activeIdx === i ? `drop-shadow(0 0 14px ${s.color}aa)` : "none", transition: "filter 0.25s ease" }}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={displayed?.name ?? "total"}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col items-center text-center px-4"
                  >
                    <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-text-tertiary">{displayed ? displayed.name : "Total"}</div>
                    <div className="mt-0.5 text-[20px] font-bold text-text-primary tabular-nums tracking-tight">{compactUsd(displayedValue)}</div>
                    <div className="text-[11px] text-text-secondary tabular-nums">{displayedPct.toFixed(1)}%</div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 max-h-[260px] overflow-y-auto pr-1 scrollbar-brand">
              {slices.map((s, i) => {
                const pct = total > 0 ? (s.value / total) * 100 : 0;
                const isActive = activeIdx === i;
                return (
                  <button
                    key={s.name}
                    onMouseEnter={() => setActiveIdx(i)}
                    onMouseLeave={() => setActiveIdx(null)}
                    className={`group relative flex items-center gap-3 rounded-lg border px-3 py-2 text-left transition-all ${
                      isActive ? "border-border-default bg-white/[0.04]" : "border-border-subtle bg-transparent hover:border-border-default hover:bg-white/[0.02]"
                    }`}
                  >
                    <div
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                      style={{
                        background: `linear-gradient(135deg, ${s.color}40, ${s.color}10)`,
                        color: s.color,
                        boxShadow: isActive ? `0 0 14px ${s.color}66` : "none",
                        transition: "box-shadow 0.25s ease",
                      }}
                    >
                      {s.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-text-primary truncate">{s.name}</span>
                        <span className="text-xs font-semibold text-text-primary tabular-nums shrink-0">{compactUsd(s.value)}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-white/5">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6, delay: i * 0.04 }}
                            className="absolute inset-y-0 left-0 rounded-full"
                            style={{ background: `linear-gradient(90deg, ${s.color}80, ${s.color})` }}
                          />
                        </div>
                        <span className="text-[10px] font-semibold tabular-nums text-text-secondary min-w-[44px] text-right">{pct.toFixed(1)}%</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
