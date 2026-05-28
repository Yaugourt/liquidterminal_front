"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ComposedChart,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { Coins, TrendingUp, ArrowRight, Wallet } from "lucide-react";
import { Sparkline } from "@/components/common";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import {
  AuroraAreaChart,
  FlowBar,
  FlowGrid,
  chartPalette,
  type FlowGridColumn,
} from "@/components/common";

/**
 * Labs page — 3 visual mockups for the "Protocol Revenue" dashboard card.
 *
 * Each variant addresses the same problem (5 revenue sources with a 230:1
 * dominance ratio between Perp and HIP-3) with a different design philosophy.
 * The page is a side-by-side comparison so the user can pick the direction
 * that resonates before any code lands on the production dashboard.
 *
 * All variants stay strictly inside the V4 token palette — `bg-base`,
 * `bg-surface`, `border-border-subtle`, `chartPalette.*` — and respect the
 * "one Card, no nested containers" rule.
 */

const REVENUE_COLORS = {
  perp: chartPalette.multiSeries[0],
  spot: chartPalette.gold,
  hip1: chartPalette.multiSeries[3],
  hip3: chartPalette.multiSeries[5],
  hip4: chartPalette.multiSeries[6],
} as const;

interface FakeDay {
  date: string;
  timestamp: number;
  perp: number;
  spot: number;
  hip1: number;
  hip3: number;
  hip4: number;
  total: number;
}

/**
 * Generate ~90 days of realistic-looking fake daily revenue data.
 * Numbers roughly match the live distribution (perp ~92% / spot ~6% / sporadic hip1).
 */
function makeFakeData(days: number): FakeDay[] {
  const out: FakeDay[] = [];
  const now = Date.now();
  const dayMs = 86_400_000;
  for (let i = days - 1; i >= 0; i--) {
    const ts = now - i * dayMs;
    const trend = 1 + 0.4 * Math.sin(i / 12);
    const noise = 0.8 + Math.random() * 0.4;
    const perp = 1_400_000 * trend * noise;
    const spot = 75_000 * trend * (0.7 + Math.random() * 0.6);
    const hip1 = i % 17 === 0 ? 50_000 + Math.random() * 400_000 : 0;
    const hip3 = i % 9 === 0 ? 8_000 + Math.random() * 40_000 : 0;
    const hip4 = 0;
    const total = perp + spot + hip1 + hip3 + hip4;
    out.push({
      date: new Date(ts).toISOString().slice(0, 10),
      timestamp: ts,
      perp,
      spot,
      hip1,
      hip3,
      hip4,
      total,
    });
  }
  return out;
}

function fmtUsd(v: number): string {
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(2)}M`;
  if (v >= 1e3) return `$${(v / 1e3).toFixed(1)}K`;
  return `$${v.toFixed(0)}`;
}

function fmtDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function RevenueMockupsPage() {
  const days = useMemo(() => makeFakeData(90), []);

  const sums = useMemo(() => {
    const acc = { perp: 0, spot: 0, hip1: 0, hip3: 0, hip4: 0, total: 0 };
    for (const d of days) {
      acc.perp += d.perp;
      acc.spot += d.spot;
      acc.hip1 += d.hip1;
      acc.hip3 += d.hip3;
      acc.hip4 += d.hip4;
      acc.total += d.total;
    }
    return acc;
  }, [days]);

  const today = days[days.length - 1];
  const avgDay = sums.total / days.length;

  /** Delta = avg of recent third vs avg of middle third. */
  const delta = useMemo(() => {
    const len = days.length;
    const recent = days.slice(-Math.floor(len / 3));
    const prior = days.slice(
      -Math.floor((2 * len) / 3),
      -Math.floor(len / 3),
    );
    const avg = (arr: FakeDay[]) =>
      arr.reduce((a, d) => a + d.total, 0) / arr.length;
    const r = avg(recent);
    const p = avg(prior);
    return ((r - p) / p) * 100;
  }, [days]);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-[20px] font-bold text-text-primary">
          Protocol Revenue — Mockups
        </h1>
        <p className="text-[13px] text-text-secondary">
          3 directions visuelles pour la card revenue. Données simulées (~90
          jours). Tous les variants respectent V4 et la règle « une seule Card ».
        </p>
      </header>

      {/* V2 — Aurora + Source Ladder (DS strict) */}
      <section className="space-y-2">
        <MockupHeader
          label="V2"
          name="Aurora hero + Source Ladder"
          desc="Squelette LiquidationsPanel. KPI ribbon hairlines → AuroraAreaChart gold → FlowGrid leaderboard."
        />
        <V2Mockup
          days={days}
          today={today}
          sums={sums}
          delta={delta}
          avgDay={avgDay}
        />
      </section>

      {/* V1 — Revenue Spine (Perp hero) */}
      <section className="space-y-2">
        <MockupHeader
          label="V1"
          name="Revenue Spine — Perp hero"
          desc="Assume Perp = 92%. Hero chart Perp seul + diamants HIP-1 sur axe X + 5-cells source-flow strip en bas (PulseBar gap-px)."
        />
        <V1Mockup
          days={days}
          today={today}
          sums={sums}
          delta={delta}
        />
      </section>

      {/* V3 — River & Events (log scale) */}
      <section className="space-y-2">
        <MockupHeader
          label="V3"
          name="River &amp; Events — log scale"
          desc="Line chart unique log Y du total. Tick marks colorés sur l'axe X pour HIP-1/HIP-3 events. Headline inline + mix bar horizontale."
        />
        <V3Mockup
          days={days}
          today={today}
          sums={sums}
          delta={delta}
        />
      </section>
    </div>
  );
}

function MockupHeader({
  label,
  name,
  desc,
}: {
  label: string;
  name: string;
  desc: string;
}) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="mono text-[11px] font-bold text-brand">{label}</span>
      <h2 className="text-[15px] font-semibold text-text-primary">{name}</h2>
      <p className="text-[12px] text-text-secondary">{desc}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// V2 — Aurora hero + Source Ladder
// ─────────────────────────────────────────────────────────────────────────────

function V2Mockup({
  days,
  today,
  sums,
  delta,
  avgDay,
}: {
  days: FakeDay[];
  today: FakeDay;
  sums: { perp: number; spot: number; hip1: number; hip3: number; hip4: number; total: number };
  delta: number;
  avgDay: number;
}) {
  const auroraData = useMemo(
    () => days.map((d) => ({ time: d.timestamp, value: d.total })),
    [days],
  );

  const sourceRows = useMemo(
    () => [
      { label: "Perp", value: sums.perp, pct: (sums.perp / sums.total) * 100, color: REVENUE_COLORS.perp },
      { label: "Spot", value: sums.spot, pct: (sums.spot / sums.total) * 100, color: REVENUE_COLORS.spot },
      { label: "HIP-1", value: sums.hip1, pct: (sums.hip1 / sums.total) * 100, color: REVENUE_COLORS.hip1 },
      { label: "HIP-3", value: sums.hip3, pct: (sums.hip3 / sums.total) * 100, color: REVENUE_COLORS.hip3 },
      { label: "HIP-4", value: 0, pct: 0, color: REVENUE_COLORS.hip4 },
    ],
    [sums],
  );

  type Row = (typeof sourceRows)[number];
  const maxPct = Math.max(...sourceRows.map((r) => r.pct), 1);

  const columns: FlowGridColumn<Row>[] = [
    {
      header: "Source",
      width: 64,
      align: "left",
      render: (r) => (
        <div className="flex items-center gap-1.5 text-[12px] font-semibold text-text-primary">
          <span
            className="h-1.5 w-1.5 rounded-full shrink-0"
            style={{ background: r.color }}
          />
          {r.label}
        </div>
      ),
    },
    {
      header: "Share",
      width: "1fr",
      align: "left",
      render: (r) => (
        <FlowBar ratio={r.pct / maxPct} color={r.color} variant="gradient" />
      ),
    },
    {
      header: "USD",
      width: 56,
      align: "right",
      render: (r) => (
        <span className="mono text-[11.5px] font-semibold text-text-primary">
          {r.value > 0 ? fmtUsd(r.value) : "—"}
        </span>
      ),
    },
    {
      header: "%",
      width: 40,
      align: "right",
      render: (r) => (
        <span className="mono text-[11px] text-text-tertiary">
          {r.pct > 0.1 ? `${r.pct.toFixed(r.pct < 1 ? 1 : 0)}%` : "—"}
        </span>
      ),
    },
  ];

  return (
    <Card className="overflow-hidden flex flex-col">
      {/* card-head */}
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle">
        <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
          <Coins size={13} className="text-brand" />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">
          Protocol Revenue
        </h3>
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle">
          Lifetime $1.20B
        </span>
        <span className="ml-auto text-[11px] font-semibold text-text-tertiary">
          30D · <span className="text-text-primary">90D</span> · 1Y · All
        </span>
      </div>

      {/* Body — 2 cols : chart-col left, breakdown right */}
      <div className="flex flex-col lg:flex-row">
        {/* Left column — KPI strip on top (limited to this column), chart below */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* KPI strip — sits ONLY above the chart, not the whole card */}
          <div className="grid grid-cols-3 gap-px bg-border-subtle border-b border-border-subtle">
            <MiniKpi
              label="24H Revenue"
              value={fmtUsd(today.total)}
              delta={`+${delta.toFixed(1)}%`}
              deltaTone="success"
            />
            <MiniKpi
              label="90D Total"
              value={fmtUsd(sums.total)}
              valueTone="gold"
            />
            <MiniKpi label="Avg / Day" value={fmtUsd(avgDay)} />
          </div>

          {/* Chart — total revenue Aurora gold */}
          <div className="px-3.5 pt-3 pb-3 flex-1 flex flex-col">
            <div className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary font-semibold mb-1">
              Daily revenue · 90D
            </div>
            <div className="flex-1 min-h-[320px]">
              <AuroraAreaChart
                data={auroraData}
                lineColor={chartPalette.gold}
                height={320}
                yAxisWidth={56}
                formatValue={fmtUsd}
                formatTime={fmtDate}
              />
            </div>
          </div>
        </div>

        {/* Right column — Source breakdown immediately followed by Capital base,
            no gap, no flex-1 stretching */}
        <div className="lg:w-[300px] lg:shrink-0 lg:border-l border-t lg:border-t-0 border-border-subtle">
          {/* Top — Source breakdown */}
          <div className="px-3.5 py-3">
            <div className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary font-semibold mb-2">
              Source breakdown · 90D
            </div>
            <FlowGrid
              rows={sourceRows}
              rowKey={(r) => r.label}
              columns={columns}
              containerDelay={0.15}
              rowStagger={0.04}
              rowGap={4}
            />
          </div>

          {/* Bottom — Capital base context (stablecoin supply) */}
          <V2CapitalBaseBlock />
        </div>
      </div>

      {/* footer */}
      <div className="flex flex-wrap items-center gap-x-3 px-3.5 py-1.5 border-t border-border-subtle text-[10px] text-text-tertiary">
        <span>Sources: Hypurrscan · HypeDexer · HL</span>
        <span className="opacity-50">·</span>
        <span>Spot ×2</span>
        <span className="opacity-50">·</span>
        <span>HYPE @ $63</span>
      </div>
    </Card>
  );
}

/**
 * V2CapitalBaseBlock — compact stablecoin supply context, placed below
 * the Source breakdown in the right column. Visually a sub-section (not a
 * nested card): only a top hairline separates it from the breakdown above.
 *
 * Numbers are hardcoded for the mockup; the production version will read
 * from `useSpotStablecoins()`.
 */
function V2CapitalBaseBlock() {
  const supplyHistory = useMemo(() => {
    const out: number[] = [];
    const base = 3.9e9;
    for (let i = 0; i < 48; i++) {
      const trend = base * (1 + i * 0.0015);
      const noise = 1 + Math.sin(i / 3) * 0.012;
      out.push(trend * noise);
    }
    return out;
  }, []);

  const total = supplyHistory[supplyHistory.length - 1];

  /** Top 3 stables (hardcoded for mockup; real version pulls from useSpotStablecoins). */
  const topStables = [
    { symbol: "USDC", supply: total * 0.70, holders: 798_700, color: chartPalette.accent },
    { symbol: "USDH", supply: total * 0.18, holders: 124_300, color: chartPalette.gold },
    { symbol: "USDT0", supply: total * 0.10, holders: 56_400, color: chartPalette.violet },
  ];

  return (
    <div className="border-t border-border-subtle">
      {/* Hero — like StablecoinsCard: label + total + sparkline */}
      <div className="px-3.5 pt-2.5 pb-2 border-b border-border-subtle">
        <div className="text-[10px] uppercase tracking-wide text-text-tertiary flex items-center gap-1.5">
          <Wallet size={10} className="text-text-tertiary" />
          Total spot supply
        </div>
        <div className="mono text-[18px] font-semibold tracking-[-0.02em] leading-none text-text-primary mt-1">
          {fmtUsd(total)}
        </div>
        <Sparkline
          data={supplyHistory}
          color={chartPalette.multiSeries[7]}
          height={28}
          className="mt-1.5"
        />
      </div>

      {/* Top stables list — each row: dot + symbol + holders + supply (mirrors StablecoinsCard format) */}
      {topStables.map((s, i) => (
        <div
          key={s.symbol}
          className={`flex items-center gap-2 px-3.5 py-1.5 ${
            i < topStables.length - 1 ? "border-b border-border-subtle" : ""
          }`}
        >
          <span
            className="h-2 w-2 rounded-full shrink-0"
            style={{ background: s.color }}
          />
          <div className="min-w-0">
            <div className="text-[11.5px] font-semibold text-text-primary leading-tight">
              {s.symbol}
            </div>
            <div className="text-[9.5px] text-text-tertiary mono">
              {(s.holders / 1000).toFixed(1)}K holders
            </div>
          </div>
          <span className="mono text-[11.5px] font-semibold text-text-primary ml-auto">
            {fmtUsd(s.supply)}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * Minimalist KPI cell — label + value inline on a single tight row.
 * Used to keep the top stats visible without dominating the card vertically.
 */
function MiniKpi({
  label,
  value,
  delta,
  valueTone,
  deltaTone,
}: {
  label: string;
  value: string;
  delta?: string;
  valueTone?: "default" | "gold";
  deltaTone?: "default" | "success";
}) {
  const valueColor = valueTone === "gold" ? "text-gold" : "text-text-primary";
  const deltaColor =
    deltaTone === "success" ? "text-success" : "text-text-tertiary";
  return (
    <div className="bg-surface px-3.5 py-1.5 flex items-baseline gap-2">
      <span className="text-[9.5px] uppercase tracking-[0.06em] text-text-tertiary font-semibold">
        {label}
      </span>
      <span className={`mono text-[13px] font-semibold ml-auto ${valueColor}`}>
        {value}
      </span>
      {delta && (
        <span className={`text-[10px] font-semibold ${deltaColor}`}>
          {delta}
        </span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// V1 — Revenue Spine (Perp hero + source-flow strip)
// ─────────────────────────────────────────────────────────────────────────────

function V1Mockup({
  days,
  today,
  sums,
  delta,
}: {
  days: FakeDay[];
  today: FakeDay;
  sums: { perp: number; spot: number; hip1: number; hip3: number; hip4: number; total: number };
  delta: number;
}) {
  const perpData = useMemo(
    () => days.map((d) => ({ time: d.timestamp, value: d.perp })),
    [days],
  );

  const hip1Events = useMemo(
    () => days.filter((d) => d.hip1 > 50_000),
    [days],
  );

  const sources = [
    { label: "Perp", value: sums.perp, pct: (sums.perp / sums.total) * 100, color: REVENUE_COLORS.perp },
    { label: "Spot", value: sums.spot, pct: (sums.spot / sums.total) * 100, color: REVENUE_COLORS.spot },
    { label: "HIP-1", value: sums.hip1, pct: (sums.hip1 / sums.total) * 100, color: REVENUE_COLORS.hip1 },
    { label: "HIP-3", value: sums.hip3, pct: (sums.hip3 / sums.total) * 100, color: REVENUE_COLORS.hip3 },
    { label: "HIP-4", value: 0, pct: 0, color: REVENUE_COLORS.hip4, pending: true },
  ];

  return (
    <Card className="overflow-hidden flex flex-col">
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle">
        <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
          <Coins size={13} className="text-brand" />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">
          Protocol Revenue
        </h3>
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle">
          Lifetime $1.20B
        </span>
        <span className="ml-auto text-[11px] font-semibold text-text-tertiary">
          30D · <span className="text-text-primary">90D</span> · 1Y · All
        </span>
      </div>

      {/* KPI triplet inline — no boxes, just typography rhythm */}
      <div className="flex flex-wrap items-baseline gap-x-8 gap-y-2 px-3.5 py-3 border-b border-border-subtle">
        <div>
          <div className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary font-semibold">
            Today
          </div>
          <div className="mono text-[26px] font-bold text-text-primary tracking-tight leading-none mt-1">
            {fmtUsd(today.total)}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary font-semibold">
            Window total
          </div>
          <div className="mono text-[26px] font-bold text-gold tracking-tight leading-none mt-1">
            {fmtUsd(sums.total)}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary font-semibold">
            Delta
          </div>
          <div className="text-[14px] font-semibold text-success leading-none mt-1 flex items-center gap-1">
            <TrendingUp size={12} />
            {delta.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Hero — Perp chart full width */}
      <div className="px-3.5 pt-3 pb-2 border-b border-border-subtle">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary font-semibold">
            Perp revenue · the engine
          </span>
          <span className="text-[10px] text-text-tertiary/70">
            92% of total
          </span>
        </div>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={perpData.map((d) => ({ ...d, hip1Marker: 0 }))}
              margin={{ top: 8, right: 8, bottom: 12, left: 0 }}
            >
              <defs>
                <linearGradient id="v1-perp-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={REVENUE_COLORS.perp} stopOpacity={0.55} />
                  <stop offset="100%" stopColor={REVENUE_COLORS.perp} stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 5"
                stroke="rgba(255,255,255,0.04)"
                vertical={false}
              />
              <XAxis
                dataKey="time"
                type="number"
                domain={["dataMin", "dataMax"]}
                scale="time"
                tickFormatter={fmtDate}
                tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                minTickGap={48}
              />
              <YAxis
                tickFormatter={fmtUsd}
                tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={56}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={REVENUE_COLORS.perp}
                strokeWidth={1.75}
                fill="url(#v1-perp-grad)"
                isAnimationActive={false}
              />
              {hip1Events.map((e) => (
                <ReferenceLine
                  key={`hip1-${e.timestamp}`}
                  x={e.timestamp}
                  stroke={chartPalette.gold}
                  strokeWidth={1}
                  strokeDasharray="2 2"
                  label={{
                    value: "◆",
                    position: "insideBottom",
                    fill: chartPalette.gold,
                    fontSize: 10,
                  }}
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="text-[10px] text-text-tertiary/70 mt-1 flex items-center gap-1">
          <span style={{ color: chartPalette.gold }}>◆</span> HIP-1 auction events (
          {hip1Events.length} in window)
        </div>
      </div>

      {/* Source-flow strip — 5 cells with gap-px trick (PulseBar) */}
      <div className="px-3.5 py-3">
        <div className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary font-semibold mb-2">
          Where revenue comes from · 90D
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-border-subtle border border-border-subtle">
          {sources.map((s) => (
            <div key={s.label} className="bg-surface px-3 py-2.5">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.06em] text-text-tertiary font-semibold">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    background: s.color,
                    opacity: s.pending ? 0.4 : 1,
                  }}
                />
                {s.label}
              </div>
              <div
                className={`mono text-[14px] font-semibold mt-1 ${
                  s.pending ? "text-text-tertiary" : "text-text-primary"
                }`}
              >
                {s.value > 0 ? fmtUsd(s.value) : "—"}
              </div>
              <div className="text-[10px] text-text-tertiary mono mt-0.5">
                {s.pending ? "pending" : `${s.pct.toFixed(s.pct < 1 ? 1 : 0)}%`}
              </div>
              {/* Mini fill bar */}
              <div className="h-1 bg-base rounded-sm mt-1.5 overflow-hidden">
                <motion.div
                  className="h-full rounded-sm"
                  style={{
                    background: s.color,
                    opacity: s.pending ? 0.2 : 1,
                  }}
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(100, Math.max(2, s.pct))}%`,
                  }}
                  transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 px-3.5 py-1.5 border-t border-border-subtle text-[10px] text-text-tertiary">
        <span>Sources: Hypurrscan · HypeDexer · HL</span>
        <span className="opacity-50">·</span>
        <span>Spot ×2</span>
        <span className="opacity-50">·</span>
        <span>HYPE @ $63</span>
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// V3 — River & Events (log scale + event tick marks)
// ─────────────────────────────────────────────────────────────────────────────

function V3Mockup({
  days,
  today,
  sums,
  delta,
}: {
  days: FakeDay[];
  today: FakeDay;
  sums: { perp: number; spot: number; hip1: number; hip3: number; hip4: number; total: number };
  delta: number;
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const mixBar = [
    { label: "Perp", pct: (sums.perp / sums.total) * 100, color: REVENUE_COLORS.perp },
    { label: "Spot", pct: (sums.spot / sums.total) * 100, color: REVENUE_COLORS.spot },
    { label: "HIP-1", pct: (sums.hip1 / sums.total) * 100, color: REVENUE_COLORS.hip1 },
    { label: "HIP-3", pct: (sums.hip3 / sums.total) * 100, color: REVENUE_COLORS.hip3 },
  ];

  const events = useMemo(() => {
    const e: { ts: number; type: "hip1" | "hip3" }[] = [];
    for (const d of days) {
      if (d.hip1 > 50_000) e.push({ ts: d.timestamp, type: "hip1" });
      if (d.hip3 > 20_000) e.push({ ts: d.timestamp, type: "hip3" });
    }
    return e;
  }, [days]);

  const chartData = useMemo(
    () => days.map((d) => ({ time: d.timestamp, total: d.total })),
    [days],
  );

  return (
    <Card className="overflow-hidden flex flex-col">
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle">
        <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
          <Coins size={13} className="text-brand" />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">
          Protocol Revenue
        </h3>
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle">
          Lifetime $1.20B
        </span>
        <span className="ml-auto text-[11px] font-semibold text-text-tertiary">
          30D · <span className="text-text-primary">90D</span> · 1Y · All
        </span>
      </div>

      {/* Headline inline + mix bar */}
      <div className="px-3.5 py-2.5 border-b border-border-subtle space-y-1.5">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[13px]">
          <span className="mono text-[16px] font-bold text-text-primary">
            {fmtUsd(today.total)}
          </span>
          <span className="text-text-tertiary">today</span>
          <span className="text-text-tertiary opacity-40">·</span>
          <span className="mono text-[16px] font-bold text-gold">
            {fmtUsd(sums.total)}
          </span>
          <span className="text-text-tertiary">90D window</span>
          <span className="text-success font-semibold flex items-center gap-1">
            <TrendingUp size={12} />
            {delta.toFixed(1)}%
          </span>
        </div>
        {/* Mix bar horizontal */}
        <div className="flex items-center gap-2 text-[10px] text-text-tertiary">
          <div className="flex-1 h-2 rounded-sm overflow-hidden flex bg-base">
            {mixBar.map((m) => (
              <div
                key={m.label}
                style={{
                  background: m.color,
                  width: `${m.pct}%`,
                  minWidth: m.pct > 0.05 ? "1px" : 0,
                }}
              />
            ))}
          </div>
          <div className="flex items-center gap-2.5 mono text-[10px]">
            {mixBar.map((m) => (
              <span key={m.label} className="flex items-center gap-1">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: m.color }}
                />
                <span className="text-text-secondary">{m.label}</span>
                <span className="text-text-primary font-semibold">
                  {m.pct < 1 ? m.pct.toFixed(1) : m.pct.toFixed(0)}%
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Chart — log scale total revenue + event tick marks */}
      <div className="px-2 pt-3 pb-1">
        <div className="flex items-center justify-between px-1.5 mb-1">
          <span className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary font-semibold">
            Daily revenue · log scale
          </span>
          <span className="text-[9px] text-text-tertiary/60 italic">log Y</span>
        </div>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 8, right: 8, bottom: 20, left: 0 }}
              onMouseMove={(state: unknown) => {
                const s = state as { activeTooltipIndex?: number } | null;
                setHoveredIdx(s?.activeTooltipIndex ?? null);
              }}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <defs>
                <linearGradient id="v3-total-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartPalette.gold} stopOpacity={0.5} />
                  <stop offset="50%" stopColor={REVENUE_COLORS.perp} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={REVENUE_COLORS.perp} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 5"
                stroke="rgba(255,255,255,0.04)"
                vertical={false}
              />
              <XAxis
                dataKey="time"
                type="number"
                domain={["dataMin", "dataMax"]}
                scale="time"
                tickFormatter={fmtDate}
                tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                minTickGap={48}
              />
              <YAxis
                scale="log"
                domain={["auto", "auto"]}
                tickFormatter={fmtUsd}
                tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={56}
                allowDataOverflow
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke={chartPalette.gold}
                strokeWidth={1.75}
                fill="url(#v3-total-grad)"
                isAnimationActive={false}
              />
              {events.map((e) => (
                <ReferenceLine
                  key={`${e.type}-${e.ts}`}
                  x={e.ts}
                  stroke={
                    e.type === "hip1"
                      ? REVENUE_COLORS.hip1
                      : REVENUE_COLORS.hip3
                  }
                  strokeWidth={1.5}
                  strokeOpacity={0.75}
                  label={{
                    value: "▲",
                    position: "insideBottom",
                    fill:
                      e.type === "hip1"
                        ? REVENUE_COLORS.hip1
                        : REVENUE_COLORS.hip3,
                    fontSize: 9,
                  }}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-3 px-1.5 mt-1 text-[10px] text-text-tertiary">
          <span className="flex items-center gap-1">
            <span style={{ color: REVENUE_COLORS.hip1 }}>▲</span>
            HIP-1 auction
          </span>
          <span className="flex items-center gap-1">
            <span style={{ color: REVENUE_COLORS.hip3 }}>▲</span>
            HIP-3 auction
          </span>
          {hoveredIdx !== null && days[hoveredIdx] && (
            <span className="ml-auto mono text-text-secondary">
              <ArrowRight size={9} className="inline mr-1" />
              {fmtDate(days[hoveredIdx].timestamp)} · {fmtUsd(days[hoveredIdx].total)}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 px-3.5 py-1.5 border-t border-border-subtle text-[10px] text-text-tertiary">
        <span>Sources: Hypurrscan · HypeDexer · HL</span>
        <span className="opacity-50">·</span>
        <span>Spot ×2</span>
        <span className="opacity-50">·</span>
        <span>HYPE @ $63</span>
      </div>
    </Card>
  );
}
