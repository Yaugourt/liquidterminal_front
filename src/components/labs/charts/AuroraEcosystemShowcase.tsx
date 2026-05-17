"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import { buildAuroraSeries } from "./mockData";

type SeriesKey = "spotTvl" | "perpOi" | "staked";

const SERIES: Record<
  SeriesKey,
  { label: string; sub: string; color: string; glow: string }
> = {
  spotTvl: {
    label: "Spot TVL",
    sub: "All DEXs",
    color: "#83E9FF",
    glow: "rgba(131,233,255,0.35)",
  },
  perpOi: {
    label: "Perp OI",
    sub: "Open interest",
    color: "#f9e370",
    glow: "rgba(249,227,112,0.32)",
  },
  staked: {
    label: "Staked HYPE",
    sub: "Validators",
    color: "#a78bfa",
    glow: "rgba(167,139,250,0.32)",
  },
};

const PERIODS = ["7D", "30D", "90D", "1Y"] as const;
type Period = (typeof PERIODS)[number];

function formatDate(ms: number) {
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function AuroraEcosystemShowcase() {
  const [period, setPeriod] = useState<Period>("90D");
  const [visible, setVisible] = useState<Record<SeriesKey, boolean>>({
    spotTvl: true,
    perpOi: true,
    staked: true,
  });
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const days = period === "7D" ? 7 : period === "30D" ? 30 : period === "90D" ? 90 : 365;
  const data = useMemo(() => buildAuroraSeries(days), [days]);
  const last = data[data.length - 1];
  const first = data[0];

  const totals = useMemo(() => {
    const current = last.spotTvl + last.perpOi + last.staked;
    const previous = first.spotTvl + first.perpOi + first.staked;
    const delta = current - previous;
    const pct = (delta / previous) * 100;
    return { current, delta, pct };
  }, [first, last]);

  const display = hoverIdx !== null && data[hoverIdx] ? data[hoverIdx] : last;
  const displayTotal =
    (visible.spotTvl ? display.spotTvl : 0) +
    (visible.perpOi ? display.perpOi : 0) +
    (visible.staked ? display.staked : 0);

  return (
    <div className="glass-panel relative overflow-hidden h-[460px] flex flex-col p-6">
      {/* Ambient color glow */}
      <div className="pointer-events-none absolute -top-32 right-0 h-72 w-72 rounded-full bg-brand-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 -left-24 h-64 w-64 rounded-full bg-brand-gold/10 blur-3xl" />

      {/* HEADER */}
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-muted">
            <span className="h-1 w-1 rounded-full bg-brand-accent" />
            Ecosystem Capital
            <span className="text-text-muted/60">·</span>
            <span>{formatDate(display.time)}</span>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={displayTotal.toFixed(0)}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="mt-1 text-[32px] font-bold text-text-primary tabular-nums tracking-tight"
            >
              {compactUsd(displayTotal)}
            </motion.div>
          </AnimatePresence>
          <div className="flex items-center gap-1.5 text-sm tabular-nums">
            {totals.delta >= 0 ? (
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            ) : (
              <TrendingDown className="h-4 w-4 text-rose-400" />
            )}
            <span className={totals.delta >= 0 ? "text-emerald-400" : "text-rose-400"}>
              {totals.delta >= 0 ? "+" : ""}
              {compactUsd(totals.delta)} ({totals.pct >= 0 ? "+" : ""}
              {totals.pct.toFixed(2)}%)
            </span>
            <span className="text-text-muted">over {period}</span>
          </div>
        </div>

        <div className="flex items-center rounded-lg border border-border-subtle bg-black/30 p-1">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="relative rounded-lg px-3 py-1 text-[11px] font-semibold tabular-nums"
            >
              {period === p && (
                <motion.span
                  layoutId="aurora-active-period"
                  className="absolute inset-0 rounded-lg bg-white/[0.06] ring-1 ring-white/10"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                />
              )}
              <span
                className={`relative z-10 ${period === p ? "text-text-primary" : "text-text-secondary hover:text-text-primary"}`}
              >
                {p}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* LEGEND TOGGLES */}
      <div className="relative z-10 mt-4 flex flex-wrap items-center gap-2">
        {(Object.keys(SERIES) as SeriesKey[]).map((key) => {
          const meta = SERIES[key];
          const isOn = visible[key];
          const current = display[key];
          return (
            <button
              key={key}
              onClick={() => setVisible((v) => ({ ...v, [key]: !v[key] }))}
              className={`group flex items-center gap-2.5 rounded-lg border px-3 py-2 transition-all ${
                isOn
                  ? "border-border-hover bg-white/[0.03]"
                  : "border-border-subtle bg-transparent opacity-45 hover:opacity-75"
              }`}
            >
              <span
                className="h-2.5 w-2.5 rounded-full transition-all"
                style={{
                  background: meta.color,
                  boxShadow: isOn ? `0 0 12px ${meta.glow}` : "none",
                }}
              />
              <div className="text-left">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                  {meta.label}
                </div>
                <div className="text-xs font-bold text-text-primary tabular-nums">
                  {compactUsd(current)}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* CHART */}
      <div className="relative z-10 mt-4 flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
            onMouseMove={(e) => {
              if (e && typeof e.activeTooltipIndex === "number") setHoverIdx(e.activeTooltipIndex);
            }}
            onMouseLeave={() => setHoverIdx(null)}
          >
            <defs>
              <linearGradient id="g-spot" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={SERIES.spotTvl.color} stopOpacity={0.45} />
                <stop offset="100%" stopColor={SERIES.spotTvl.color} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="g-perp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={SERIES.perpOi.color} stopOpacity={0.32} />
                <stop offset="100%" stopColor={SERIES.perpOi.color} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="g-staked" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={SERIES.staked.color} stopOpacity={0.28} />
                <stop offset="100%" stopColor={SERIES.staked.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 5"
              stroke="rgba(255,255,255,0.04)"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              tickFormatter={formatDate}
              tick={{ fill: "#71717a", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              minTickGap={40}
            />
            <YAxis
              tickFormatter={(v) => compactUsd(Number(v))}
              tick={{ fill: "#71717a", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={60}
            />
            <Tooltip
              cursor={{ stroke: "rgba(131,233,255,0.3)", strokeDasharray: "3 3" }}
              content={<AuroraTooltip visible={visible} />}
            />
            {visible.spotTvl && (
              <Area
                type="monotone"
                dataKey="spotTvl"
                stroke={SERIES.spotTvl.color}
                strokeWidth={2}
                fill="url(#g-spot)"
                isAnimationActive={false}
              />
            )}
            {visible.perpOi && (
              <Area
                type="monotone"
                dataKey="perpOi"
                stroke={SERIES.perpOi.color}
                strokeWidth={2}
                fill="url(#g-perp)"
                isAnimationActive={false}
              />
            )}
            {visible.staked && (
              <Area
                type="monotone"
                dataKey="staked"
                stroke={SERIES.staked.color}
                strokeWidth={2}
                fill="url(#g-staked)"
                isAnimationActive={false}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

interface TooltipPayloadItem {
  dataKey?: string | number;
  value?: number | string;
}

interface AuroraTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
  visible: Record<SeriesKey, boolean>;
}

function AuroraTooltip({ active, payload, label, visible }: AuroraTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const ts = Number(label);
  return (
    <div className="rounded-xl border border-border-hover bg-brand-main/95 backdrop-blur-md px-3 py-2.5 shadow-2xl shadow-black/40 min-w-[180px]">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
        {formatDate(ts)}
      </div>
      <div className="mt-2 space-y-1.5">
        {(Object.keys(SERIES) as SeriesKey[]).map((key) => {
          if (!visible[key]) return null;
          const meta = SERIES[key];
          const p = payload.find((x) => x.dataKey === key);
          if (!p) return null;
          return (
            <div key={key} className="flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: meta.color, boxShadow: `0 0 8px ${meta.glow}` }}
                />
                <span className="text-text-secondary">{meta.label}</span>
              </div>
              <span className="font-semibold text-text-primary tabular-nums">
                {compactUsd(Number(p.value))}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
