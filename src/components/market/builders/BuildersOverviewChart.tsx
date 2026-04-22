"use client";

import { useMemo, useState, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cell, Pie, PieChart, ResponsiveContainer, Sector } from "recharts";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { ChartLoading, ChartEmpty } from "@/components/common/charts";
import type { BuilderTopRow } from "@/services/indexer/builders/types";
import { formatBuilderDisplayName } from "./formatBuilderDisplayName";

type Metric = "totalVolume" | "totalBuilderFees" | "fillCount";

const METRICS: { key: Metric; label: string; color: string; glow: string }[] = [
  { key: "totalVolume", label: "Volume", color: "#83E9FF", glow: "rgba(131,233,255,0.35)" },
  { key: "totalBuilderFees", label: "Builder Fees", color: "#f9e370", glow: "rgba(249,227,112,0.32)" },
  { key: "fillCount", label: "Fills", color: "#a78bfa", glow: "rgba(167,139,250,0.32)" },
];

const SLICE_PALETTE = [
  "#83E9FF", "#f9e370", "#a78bfa", "#10b981", "#f43f5e",
  "#fb923c", "#ec4899", "#22d3ee", "#eab308", "#8b5cf6",
];

function compactUsd(n: number) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function compactNum(n: number) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toFixed(0);
}

interface ActiveShapeProps {
  cx?: number;
  cy?: number;
  innerRadius?: number;
  outerRadius?: number;
  startAngle?: number;
  endAngle?: number;
  fill?: string;
}

function ActiveArc(props: ActiveShapeProps) {
  const { cx = 0, cy = 0, innerRadius = 0, outerRadius = 0, startAngle = 0, endAngle = 0, fill = "#fff" } = props;
  return (
    <g>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 8} startAngle={startAngle} endAngle={endAngle} fill={fill} />
      <Sector cx={cx} cy={cy} innerRadius={outerRadius + 10} outerRadius={outerRadius + 13} startAngle={startAngle} endAngle={endAngle} fill={fill} opacity={0.45} />
    </g>
  );
}

interface BuildersOverviewChartProps {
  rows: BuilderTopRow[];
  isLoading: boolean;
  timeframe: string;
}

export function BuildersOverviewChart({ rows, isLoading, timeframe }: BuildersOverviewChartProps) {
  const [metric, setMetric] = useState<Metric>("totalVolume");
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const layoutId = useId().replace(/:/g, "");

  // Top 10 by metric + "Others" aggregate
  const { slices, topRows, total } = useMemo(() => {
    if (!rows.length) return { slices: [], topRows: [], total: 0, othersValue: 0 };
    const sorted = [...rows].sort((a, b) => ((b[metric] as number) ?? 0) - ((a[metric] as number) ?? 0));
    const total = sorted.reduce((s, r) => s + ((r[metric] as number) ?? 0), 0);
    const top = sorted.slice(0, 10);
    const rest = sorted.slice(10);
    const othersValue = rest.reduce((s, r) => s + ((r[metric] as number) ?? 0), 0);

    const slices = top.map((r, i) => ({
      name: formatBuilderDisplayName(r.builderName),
      address: r.builder,
      value: (r[metric] as number) ?? 0,
      color: SLICE_PALETTE[i] ?? "#71717a",
    }));
    if (othersValue > 0) {
      slices.push({ name: "Others", address: "others", value: othersValue, color: "#52525b" });
    }
    return { slices, topRows: top, total, othersValue };
  }, [rows, metric]);

  const displayed = activeIdx !== null && slices[activeIdx] ? slices[activeIdx] : null;
  const displayedValue = displayed ? displayed.value : total;
  const displayedPct = total > 0 ? (displayedValue / total) * 100 : 0;

  const fmtValue = metric === "fillCount" ? compactNum : compactUsd;

  const topConcentration = useMemo(() => {
    if (!total) return 0;
    const top3 = topRows.slice(0, 3).reduce((s, r) => s + ((r[metric] as number) ?? 0), 0);
    return (top3 / total) * 100;
  }, [topRows, total, metric]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.35 }}
      className="glass-panel relative overflow-hidden p-6"
    >
      {/* Ambient glow — follows active slice */}
      <motion.div
        animate={{
          background: displayed
            ? `radial-gradient(circle at 30% 30%, ${displayed.color}33, transparent 60%)`
            : "radial-gradient(circle at 30% 30%, rgba(131,233,255,0.12), transparent 60%)",
        }}
        transition={{ duration: 0.5 }}
        className="pointer-events-none absolute inset-0 opacity-70"
      />

      {/* HEADER */}
      <div className="relative z-10 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-muted">
            <span className="h-1 w-1 rounded-full bg-brand-accent" />
            Market Share
            <span className="text-text-muted/60">·</span>
            <span>Top 10 builders · {timeframe}</span>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${metric}-${displayedValue.toFixed(0)}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="mt-1 text-[28px] font-bold text-white tabular-nums tracking-tight"
            >
              {fmtValue(displayedValue)}
            </motion.div>
          </AnimatePresence>
          <div className="text-[11px] text-text-muted">
            {displayed ? (
              <span>
                <span className="text-white">{displayed.name}</span> · {displayedPct.toFixed(1)}% of total
              </span>
            ) : (
              <span>
                Top 3 hold <span className="text-brand-accent font-semibold">{topConcentration.toFixed(1)}%</span> · {slices.length} slices
              </span>
            )}
          </div>
        </div>

        {/* Metric pills */}
        <div className="flex items-center rounded-xl border border-border-subtle bg-black/30 p-1">
          {METRICS.map((m) => (
            <button
              key={m.key}
              onClick={() => {
                setMetric(m.key);
                setActiveIdx(null);
              }}
              className="relative rounded-lg px-3 py-1 text-[11px] font-semibold tabular-nums"
            >
              {metric === m.key && (
                <motion.span
                  layoutId={`builders-metric-${layoutId}`}
                  className="absolute inset-0 rounded-lg bg-white/[0.06] ring-1 ring-white/10"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                />
              )}
              <span className={`relative z-10 ${metric === m.key ? "text-white" : "text-text-secondary hover:text-white"}`}>
                {m.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* BODY — donut + legend */}
      <div className="relative z-10 mt-4 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-4 items-center min-h-[320px]">
        {isLoading && slices.length === 0 ? (
          <div className="md:col-span-2">
            <ChartLoading />
          </div>
        ) : slices.length === 0 ? (
          <div className="md:col-span-2">
            <ChartEmpty message="No builder data" />
          </div>
        ) : (
          <>
            {/* DONUT */}
            <div className="relative h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    {slices.map((s, i) => (
                      <radialGradient key={s.address} id={`b-slice-${layoutId}-${i}`} cx="50%" cy="50%" r="75%">
                        <stop offset="0%" stopColor={s.color} stopOpacity={0.95} />
                        <stop offset="100%" stopColor={s.color} stopOpacity={0.65} />
                      </radialGradient>
                    ))}
                  </defs>
                  <Pie
                    data={slices}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius="62%"
                    outerRadius="88%"
                    paddingAngle={2}
                    startAngle={90}
                    endAngle={-270}
                    activeShape={ActiveArc}
                    onMouseEnter={(_, idx) => setActiveIdx(idx)}
                    onMouseLeave={() => setActiveIdx(null)}
                    stroke="transparent"
                    isAnimationActive={false}
                  >
                    {slices.map((s, i) => (
                      <Cell
                        key={s.address}
                        fill={`url(#b-slice-${layoutId}-${i})`}
                        style={{
                          filter: activeIdx === i ? `drop-shadow(0 0 14px ${s.color}aa)` : "none",
                          transition: "filter 0.25s ease",
                        }}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Center metric */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={displayed?.address ?? "total"}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col items-center text-center px-4"
                  >
                    <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-text-muted">
                      {displayed ? displayed.name : "Total"}
                    </div>
                    <div className="mt-0.5 text-[20px] font-bold text-white tabular-nums tracking-tight">
                      {fmtValue(displayedValue)}
                    </div>
                    <div className="text-[11px] text-text-secondary tabular-nums">
                      {displayedPct.toFixed(1)}%
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* LEGEND */}
            <div className="flex flex-col gap-1.5 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {slices.map((s, i) => {
                const pct = total > 0 ? (s.value / total) * 100 : 0;
                const isActive = activeIdx === i;
                const isOthers = s.address === "others";
                const initial = s.name !== "—" && s.name.length > 0 ? s.name.charAt(0).toUpperCase() : "?";
                return (
                  <button
                    key={s.address}
                    onMouseEnter={() => setActiveIdx(i)}
                    onMouseLeave={() => setActiveIdx(null)}
                    className={`group relative flex items-center gap-3 rounded-xl border px-3 py-2 text-left transition-all ${
                      isActive
                        ? "border-border-hover bg-white/[0.04]"
                        : "border-border-subtle bg-transparent hover:border-border-hover hover:bg-white/[0.02]"
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
                      {isOthers ? "+" : initial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-white truncate">
                          {isOthers ? `+ ${rows.length - 10} others` : `#${i + 1} ${s.name}`}
                        </span>
                        <span className="text-xs font-semibold text-white tabular-nums shrink-0">
                          {fmtValue(s.value)}
                        </span>
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
                        <span className="text-[10px] font-semibold tabular-nums text-text-secondary min-w-[44px] text-right">
                          {pct.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* FOOTER — concentration insight */}
      {total > 0 && (
        <div className="relative z-10 mt-4 flex items-center justify-between border-t border-border-subtle pt-3 text-[11px] text-text-muted">
          <span>
            <span className="text-text-secondary">Total {timeframe}</span>{" "}
            <span className="font-semibold text-white tabular-nums">{fmtValue(total)}</span>
          </span>
          <span className="flex items-center gap-1">
            {topConcentration >= 60 ? (
              <>
                <ArrowUpRight className="h-3 w-3 text-brand-gold" />
                <span className="text-brand-gold">High concentration</span>
              </>
            ) : (
              <>
                <ArrowDownRight className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400">Distributed market</span>
              </>
            )}
            <span className="text-text-muted/70">· Top 3: {topConcentration.toFixed(1)}%</span>
          </span>
        </div>
      )}
    </motion.div>
  );
}
