"use client";

import { useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Sector } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { PORTFOLIO, Allocation } from "./mockData";

function formatUsd(n: number, frac = 0) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: frac,
    maximumFractionDigits: frac,
  });
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
  const {
    cx = 0,
    cy = 0,
    innerRadius = 0,
    outerRadius = 0,
    startAngle = 0,
    endAngle = 0,
    fill = "#fff",
  } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={outerRadius + 10}
        outerRadius={outerRadius + 13}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.45}
      />
    </g>
  );
}

export function OrbitCompositionChart() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const total = useMemo(
    () => PORTFOLIO.reduce((s, a) => s + a.value, 0),
    []
  );

  const displayed: Allocation =
    activeIdx !== null ? PORTFOLIO[activeIdx] : {
      symbol: "Total",
      name: "All assets",
      value: total,
      change24h: PORTFOLIO.reduce((s, a) => s + a.change24h * (a.value / total), 0),
      color: "#83E9FF",
    };
  const displayedPct = (displayed.value / total) * 100;
  const isUp = displayed.change24h >= 0;

  return (
    <div className="bg-surface border border-border-subtle rounded-lg relative overflow-hidden h-[460px] p-6 flex flex-col">
      {/* Ambient glow that follows hovered asset */}
      <motion.div
        animate={{
          background: activeIdx !== null
            ? `radial-gradient(circle at 30% 40%, ${PORTFOLIO[activeIdx].color}33, transparent 60%)`
            : "radial-gradient(circle at 30% 40%, rgba(131,233,255,0.12), transparent 60%)",
        }}
        transition={{ duration: 0.5 }}
        className="pointer-events-none absolute inset-0 opacity-70"
      />

      {/* HEADER */}
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-tertiary">
            <span className="h-1 w-1 rounded-full bg-brand" />
            Portfolio Composition
          </div>
          <div className="mt-0.5 text-[11px] text-text-tertiary">
            {PORTFOLIO.length} assets · updated 12s ago
          </div>
        </div>
        <div className="rounded-lg border border-border-subtle bg-white/[0.03] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
          All Chains
        </div>
      </div>

      <div className="relative z-10 mt-2 grid flex-1 min-h-0 grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-4 items-center">
        {/* DONUT */}
        <div className="relative h-full min-h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                {PORTFOLIO.map((a, i) => (
                  <radialGradient key={a.symbol} id={`orbit-g-${i}`} cx="50%" cy="50%" r="75%">
                    <stop offset="0%" stopColor={a.color} stopOpacity={0.95} />
                    <stop offset="100%" stopColor={a.color} stopOpacity={0.65} />
                  </radialGradient>
                ))}
              </defs>
              <Pie
                data={PORTFOLIO}
                dataKey="value"
                nameKey="symbol"
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
                {PORTFOLIO.map((a, i) => (
                  <Cell
                    key={a.symbol}
                    fill={`url(#orbit-g-${i})`}
                    style={{
                      filter: activeIdx === i
                        ? `drop-shadow(0 0 14px ${a.color}aa)`
                        : "none",
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
                key={displayed.symbol}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center"
              >
                <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-text-tertiary">
                  {displayed.name}
                </div>
                <div className="mt-0.5 text-[22px] font-bold text-text-primary tabular-nums tracking-tight">
                  {formatUsd(displayed.value)}
                </div>
                <div className="flex items-center gap-2 text-[11px] tabular-nums">
                  <span className="text-text-secondary">{displayedPct.toFixed(1)}%</span>
                  <span
                    className={`flex items-center gap-0.5 ${isUp ? "text-emerald-400" : "text-rose-400"}`}
                  >
                    {isUp ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {isUp ? "+" : ""}
                    {displayed.change24h.toFixed(2)}%
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* LEGEND LIST */}
        <div className="flex flex-col gap-1.5 overflow-y-auto pr-1">
          {PORTFOLIO.map((a, i) => {
            const pct = (a.value / total) * 100;
            const isActive = activeIdx === i;
            return (
              <button
                key={a.symbol}
                onMouseEnter={() => setActiveIdx(i)}
                onMouseLeave={() => setActiveIdx(null)}
                className={`group relative flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all ${
                  isActive
                    ? "border-border-default bg-white/[0.04]"
                    : "border-border-subtle bg-transparent hover:border-border-default hover:bg-white/[0.02]"
                }`}
              >
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                  style={{
                    background: `linear-gradient(135deg, ${a.color}40, ${a.color}10)`,
                    color: a.color,
                    boxShadow: isActive ? `0 0 14px ${a.color}66` : "none",
                    transition: "box-shadow 0.25s ease",
                  }}
                >
                  {a.symbol === "OTHER" ? "+" : a.symbol.slice(0, 3)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-text-primary truncate">
                      {a.symbol === "OTHER" ? a.name : a.symbol}
                    </span>
                    <span className="text-sm font-semibold text-text-primary tabular-nums">
                      {formatUsd(a.value)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: i * 0.05 }}
                        className="absolute inset-y-0 left-0 rounded-full"
                        style={{
                          background: `linear-gradient(90deg, ${a.color}80, ${a.color})`,
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-semibold tabular-nums text-text-secondary min-w-[40px] text-right">
                      {pct.toFixed(1)}%
                    </span>
                    <span
                      className={`text-[10px] font-semibold tabular-nums min-w-[48px] text-right ${a.change24h >= 0 ? "text-emerald-400" : "text-rose-400"}`}
                    >
                      {a.change24h >= 0 ? "+" : ""}
                      {a.change24h.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
