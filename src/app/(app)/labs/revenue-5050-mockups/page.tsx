"use client";

import { useMemo } from "react";
import { Coins, TrendingUp, Wallet, Activity, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import {
  AuroraAreaChart,
  FlowBar,
  FlowGrid,
  chartPalette,
  TokenAvatar,
  type FlowGridColumn,
  Sparkline,
} from "@/components/common";

/**
 * Labs page — 3 visual mockups for the "Fees + Stables 50/50" dashboard row.
 *
 * Each variant renders 2 real Cards in a `grid-cols-2` so the user can see
 * how they coexist side by side at the actual breakpoint width. Numbers
 * are hardcoded to match the agent specs — these are mockups, not live data.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Shared fake data
// ─────────────────────────────────────────────────────────────────────────────

const REVENUE = {
  lifetime: 1_200_431_558,
  last24h: 1_871_927,
  windowTotal: 148_234_109,
  windowDelta: 12.4,
  avgDay: 1_649_267,
  sources: [
    { key: "perp", label: "Perp", color: chartPalette.multiSeries[0], value: 136_415_388, pct: 92.0 },
    { key: "spot", label: "Spot", color: chartPalette.gold, value: 8_945_219, pct: 6.0 },
    { key: "hip1", label: "HIP-1", color: chartPalette.multiSeries[3], value: 2_723_054, pct: 1.8 },
    { key: "hip3", label: "HIP-3", color: chartPalette.multiSeries[5], value: 259_847, pct: 0.4 },
    { key: "hip4", label: "HIP-4", color: chartPalette.multiSeries[6], value: 0, pct: 0 },
  ],
} as const;

const STABLES = {
  totalSupply: 4_213_847_294,
  totalHolders: 988_481,
  delta24h: 0.8,
  list: [
    { symbol: "USDC", supply: 2_949_693_106, holders: 798_743, pct: 70.0 },
    { symbol: "USDH", supply: 758_492_513, holders: 124_387, pct: 18.0 },
    { symbol: "USDT0", supply: 421_384_729, holders: 56_420, pct: 10.0 },
    { symbol: "USDE", supply: 84_277_946, holders: 8_931, pct: 2.0 },
  ],
} as const;

// 90 days of fake daily revenue (gold area chart).
function makeAuroraData(days = 90) {
  const out: { time: number; value: number }[] = [];
  const now = Date.now();
  const dayMs = 86_400_000;
  for (let i = days - 1; i >= 0; i--) {
    const ts = now - i * dayMs;
    const trend = 1 + 0.4 * Math.sin(i / 12);
    const noise = 0.8 + Math.random() * 0.4;
    out.push({ time: ts, value: 1_500_000 * trend * noise });
  }
  return out;
}

function makeSupplyHistory(): number[] {
  const out: number[] = [];
  const base = 3.9e9;
  for (let i = 0; i < 48; i++) {
    const trend = base * (1 + i * 0.0015);
    const noise = 1 + Math.sin(i / 3) * 0.012;
    out.push(trend * noise);
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Formatters
// ─────────────────────────────────────────────────────────────────────────────

const fmtUsdFull = (v: number): string => {
  if (!Number.isFinite(v) || v === 0) return "—";
  return `$${Math.round(v).toLocaleString("en-US")}`;
};

const fmtUsdCompact = (v: number): string => {
  if (!Number.isFinite(v) || v === 0) return "—";
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(2)}M`;
  if (v >= 1e3) return `$${(v / 1e3).toFixed(1)}K`;
  return `$${v.toFixed(0)}`;
};

const fmtCount = (n: number): string => {
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return String(Math.round(n));
};

const fmtDate = (ts: number) =>
  new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function Revenue5050MockupsPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-[20px] font-bold text-text-primary">
          Fees + Stables · 50/50 mockups
        </h1>
        <p className="text-[13px] text-text-secondary">
          3 directions visuelles. Chaque section rend les 2 cards en grid 50/50
          comme elles apparaîtraient sur le dashboard.
        </p>
      </header>

      <Section
        label="V1"
        name="Mirror Strata"
        desc="Stables passe en quadrant 2×2 pour exploiter la largeur. Symétrie horizontale entre les 2 cards."
      >
        <V1Fees />
        <V1Stables />
      </Section>

      <Section
        label="V2"
        name="Twin Heroes — Vertical Stack"
        desc="Les 2 cards en 5 strates identiques. Hairlines alignées ligne par ligne entre les 2."
      >
        <V2Fees />
        <V2Stables />
      </Section>

      <Section
        label="V3"
        name="Stacked Spine + Yield Bridge"
        desc="Chart pleine largeur. Bridge KPI Yield = revenue annualisé / supply ≈ 14.4% APY."
      >
        <V3Fees />
        <V3Stables />
      </Section>
    </div>
  );
}

function Section({
  label,
  name,
  desc,
  children,
}: {
  label: string;
  name: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <div className="flex items-baseline gap-3">
        <span className="mono text-[11px] font-bold text-brand">{label}</span>
        <h2 className="text-[15px] font-semibold text-text-primary">{name}</h2>
        <p className="text-[12px] text-text-secondary">{desc}</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">{children}</div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared card-head
// ─────────────────────────────────────────────────────────────────────────────

function FeesHead() {
  return (
    <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle">
      <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
        <Coins size={13} className="text-brand" />
      </span>
      <h3 className="text-[13px] font-semibold text-text-primary">
        Protocol Revenue
      </h3>
      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle mono">
        Lifetime {fmtUsdCompact(REVENUE.lifetime)}
      </span>
      <span className="ml-auto text-[11px] font-semibold text-text-tertiary">
        30D · <span className="text-text-primary">90D</span> · 1Y · All
      </span>
    </div>
  );
}

function StablesHead({ right }: { right?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle">
      <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
        <Wallet size={13} className="text-brand" />
      </span>
      <h3 className="text-[13px] font-semibold text-text-primary">Stablecoins</h3>
      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle">
        spot supply
      </span>
      {right && <div className="ml-auto">{right}</div>}
    </div>
  );
}

function MiniKpi({
  label,
  value,
  delta,
  tone,
  deltaTone,
}: {
  label: string;
  value: string;
  delta?: string;
  tone?: "default" | "gold";
  deltaTone?: "default" | "success" | "danger";
}) {
  const v = tone === "gold" ? "text-gold" : "text-text-primary";
  const d =
    deltaTone === "success"
      ? "text-success"
      : deltaTone === "danger"
      ? "text-danger"
      : "text-text-tertiary";
  return (
    <div className="bg-surface px-3.5 py-2 flex items-baseline gap-2 min-w-0">
      <span className="text-[9.5px] uppercase tracking-[0.06em] text-text-tertiary font-semibold truncate">
        {label}
      </span>
      <span className={`mono text-[13px] font-semibold ml-auto ${v}`}>
        {value}
      </span>
      {delta && (
        <span
          className={`text-[10px] font-semibold flex items-center gap-0.5 ${d}`}
        >
          <TrendingUp size={10} />
          {delta}
        </span>
      )}
    </div>
  );
}

function FlowGridSources({ compact = false }: { compact?: boolean }) {
  type Row = (typeof REVENUE.sources)[number];
  const maxPct = Math.max(...REVENUE.sources.map((s) => s.pct), 1);
  const columns: FlowGridColumn<Row>[] = [
    {
      header: "Source",
      width: 56,
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
      width: compact ? 80 : 110,
      align: "right",
      render: (r) => (
        <span className="mono text-[10.5px] font-semibold text-text-primary">
          {r.value > 0 ? (compact ? fmtUsdCompact(r.value) : fmtUsdFull(r.value)) : "—"}
        </span>
      ),
    },
    {
      header: "%",
      width: 36,
      align: "right",
      render: (r) => (
        <span className="mono text-[10.5px] text-text-tertiary">
          {r.pct > 0.1 ? `${r.pct.toFixed(r.pct < 1 ? 1 : 0)}%` : "—"}
        </span>
      ),
    },
  ];
  return (
    <FlowGrid
      rows={[...REVENUE.sources]}
      rowKey={(r) => r.key}
      columns={columns}
      containerDelay={0.15}
      rowStagger={0.04}
      rowGap={4}
    />
  );
}

function FeesFooter() {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 px-3.5 py-1.5 border-t border-border-subtle text-[10px] text-text-tertiary">
      <span>Sources: Hypurrscan · HypeDexer · HL</span>
      <span className="opacity-50">·</span>
      <span>Spot ×2</span>
      <span className="opacity-50">·</span>
      <span>HYPE @ $63</span>
    </div>
  );
}

function StablesFooter() {
  return (
    <div className="flex items-center gap-x-3 px-3.5 py-1.5 border-t border-border-subtle text-[10px] text-text-tertiary">
      <span>Source: Hypurrscan /spotUSDC</span>
      <span className="opacity-50">·</span>
      <span>refresh 60s</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// V1 — Mirror Strata
//     Fees:    vertical strates · chart full-bleed · source ladder horizontal
//     Stables: 2×2 quadrant for the 4 stables
// ─────────────────────────────────────────────────────────────────────────────

function V1Fees() {
  const auroraData = useMemo(() => makeAuroraData(90), []);
  return (
    <Card className="overflow-hidden flex flex-col">
      <FeesHead />
      <div className="grid grid-cols-3 gap-px bg-border-subtle border-b border-border-subtle">
        <MiniKpi label="Last 24h" value={fmtUsdFull(REVENUE.last24h)} />
        <MiniKpi
          label="Window"
          value={fmtUsdCompact(REVENUE.windowTotal)}
          tone="gold"
          delta={`+${REVENUE.windowDelta.toFixed(1)}%`}
          deltaTone="success"
        />
        <MiniKpi label="Avg/Day" value={fmtUsdFull(REVENUE.avgDay)} />
      </div>
      <div className="px-3.5 pt-3 pb-3 border-b border-border-subtle">
        <div className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary font-semibold mb-1">
          Daily revenue · 90d
        </div>
        <div className="h-[220px]">
          <AuroraAreaChart
            data={auroraData}
            lineColor={chartPalette.gold}
            height={220}
            yAxisWidth={48}
            formatValue={fmtUsdCompact}
            formatTime={fmtDate}
          />
        </div>
      </div>
      <div className="px-3.5 py-3">
        <div className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary font-semibold mb-2">
          Source · 90d
        </div>
        <FlowGridSources />
      </div>
      <FeesFooter />
    </Card>
  );
}

function V1Stables() {
  const supplyHistory = useMemo(() => makeSupplyHistory(), []);
  const stableColors = [chartPalette.accent, chartPalette.gold, chartPalette.violet, chartPalette.multiSeries[5]];
  return (
    <Card className="overflow-hidden flex flex-col">
      <StablesHead />
      <div className="grid grid-cols-2 gap-px bg-border-subtle border-b border-border-subtle">
        <MiniKpi label="Total supply" value={fmtUsdFull(STABLES.totalSupply)} tone="gold" />
        <MiniKpi label="Holders" value={fmtCount(STABLES.totalHolders)} />
      </div>
      <div className="px-3.5 pt-3 pb-2 border-b border-border-subtle">
        <Sparkline data={supplyHistory} color={chartPalette.accent} height={64} />
      </div>
      {/* 2×2 quadrant */}
      <div className="grid grid-cols-2 gap-px bg-border-subtle">
        {STABLES.list.map((s, i) => (
          <div key={s.symbol} className="bg-surface px-3.5 py-2.5">
            <div className="flex items-center gap-2">
              <TokenAvatar assetName={s.symbol} kind="spot" size="md" />
              <span className="text-[12px] font-semibold text-text-primary">{s.symbol}</span>
              <span
                className="mono text-[10px] font-semibold ml-auto"
                style={{ color: stableColors[i % stableColors.length] }}
              >
                {s.pct.toFixed(0)}%
              </span>
            </div>
            <div className="mono text-[13px] font-bold text-text-primary mt-1.5">
              {fmtUsdCompact(s.supply)}
            </div>
            <div className="text-[10px] text-text-tertiary mono mt-0.5">
              {fmtCount(s.holders)} holders
            </div>
            <div className="h-1 bg-base rounded-sm mt-1.5 overflow-hidden">
              <motion.div
                className="h-full rounded-sm"
                style={{ background: stableColors[i % stableColors.length] }}
                initial={{ width: 0 }}
                animate={{ width: `${s.pct}%` }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 + i * 0.05 }}
              />
            </div>
          </div>
        ))}
      </div>
      <StablesFooter />
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// V2 — Twin Heroes (Vertical Stack — both cards same 5 strates)
// ─────────────────────────────────────────────────────────────────────────────

function V2Fees() {
  const auroraData = useMemo(() => makeAuroraData(90), []);
  return (
    <Card className="overflow-hidden flex flex-col">
      <FeesHead />
      <div className="grid grid-cols-3 gap-px bg-border-subtle border-b border-border-subtle">
        <MiniKpi label="Last 24h" value={fmtUsdCompact(REVENUE.last24h)} />
        <MiniKpi
          label="Window"
          value={fmtUsdCompact(REVENUE.windowTotal)}
          tone="gold"
          delta={`+${REVENUE.windowDelta.toFixed(1)}%`}
          deltaTone="success"
        />
        <MiniKpi label="Avg/Day" value={fmtUsdCompact(REVENUE.avgDay)} />
      </div>
      <div className="px-3.5 pt-3 pb-3 border-b border-border-subtle">
        <div className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary font-semibold mb-1">
          Daily revenue · 90d
        </div>
        <div className="h-[200px]">
          <AuroraAreaChart
            data={auroraData}
            lineColor={chartPalette.gold}
            height={200}
            yAxisWidth={48}
            formatValue={fmtUsdCompact}
            formatTime={fmtDate}
          />
        </div>
      </div>
      <div className="px-3.5 py-3">
        <div className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary font-semibold mb-2">
          Source breakdown
        </div>
        <FlowGridSources compact />
      </div>
      <FeesFooter />
    </Card>
  );
}

function V2Stables() {
  const supplyHistory = useMemo(() => makeSupplyHistory(), []);
  return (
    <Card className="overflow-hidden flex flex-col">
      <StablesHead />
      <div className="grid grid-cols-3 gap-px bg-border-subtle border-b border-border-subtle">
        <MiniKpi label="Total supply" value={fmtUsdCompact(STABLES.totalSupply)} tone="gold" />
        <MiniKpi label="Holders" value={fmtCount(STABLES.totalHolders)} />
        <MiniKpi
          label="24h Δ"
          value={`+${STABLES.delta24h.toFixed(1)}%`}
          deltaTone="success"
        />
      </div>
      <div className="px-3.5 pt-3 pb-3 border-b border-border-subtle">
        <div className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary font-semibold mb-1">
          Supply trajectory · 48pts
        </div>
        <div className="h-[200px] flex items-center">
          <Sparkline data={supplyHistory} color={chartPalette.accent} height={120} />
        </div>
      </div>
      <div>
        {STABLES.list.map((s, i) => (
          <div
            key={s.symbol}
            className={`flex items-center gap-2.5 px-3.5 py-2 ${
              i < STABLES.list.length - 1 ? "border-b border-border-subtle" : ""
            }`}
          >
            <TokenAvatar assetName={s.symbol} kind="spot" size="lg" />
            <div className="min-w-0">
              <div className="text-[12.5px] font-semibold text-text-primary leading-tight">
                {s.symbol}
              </div>
              <div className="text-[10px] text-text-tertiary mono">
                {fmtCount(s.holders)} holders
              </div>
            </div>
            <span className="mono text-[12px] font-semibold text-text-primary ml-auto">
              {fmtUsdFull(s.supply)}
            </span>
            <span className="mono text-[10px] text-text-tertiary w-10 text-right">
              {s.pct.toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
      <StablesFooter />
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// V3 — Stacked Spine + Yield Bridge
// ─────────────────────────────────────────────────────────────────────────────

function V3Fees() {
  const auroraData = useMemo(() => makeAuroraData(90), []);
  return (
    <Card className="overflow-hidden flex flex-col">
      <FeesHead />
      <div className="grid grid-cols-3 gap-px bg-border-subtle border-b border-border-subtle">
        <MiniKpi label="Last 24h" value={fmtUsdFull(REVENUE.last24h)} />
        <MiniKpi
          label="Window"
          value={fmtUsdCompact(REVENUE.windowTotal)}
          tone="gold"
          delta={`+${REVENUE.windowDelta.toFixed(1)}%`}
          deltaTone="success"
        />
        <MiniKpi label="Avg/Day" value={fmtUsdFull(REVENUE.avgDay)} />
      </div>
      <div className="px-3.5 pt-3 pb-3 border-b border-border-subtle">
        <div className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary font-semibold mb-1">
          Daily revenue · 90d
        </div>
        <div className="h-[220px]">
          <AuroraAreaChart
            data={auroraData}
            lineColor={chartPalette.gold}
            height={220}
            yAxisWidth={48}
            formatValue={fmtUsdCompact}
            formatTime={fmtDate}
          />
        </div>
      </div>
      <div className="px-3.5 py-3">
        <div className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary font-semibold mb-2">
          Source breakdown · window
        </div>
        <FlowGridSources />
      </div>
      <FeesFooter />
    </Card>
  );
}

function V3Stables() {
  const supplyHistory = useMemo(() => makeSupplyHistory(), []);
  // Yield = (windowRevenue × 4 to annualize 90d) / supply
  const yieldPct = ((REVENUE.windowTotal * 4) / STABLES.totalSupply) * 100;
  return (
    <Card className="overflow-hidden flex flex-col">
      <StablesHead />
      <div className="px-3.5 pt-3 pb-2 border-b border-border-subtle">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wide text-text-tertiary">
              Total spot supply
            </div>
            <div className="mono text-[20px] font-semibold tracking-[-0.02em] text-text-primary mt-1 leading-none">
              {fmtUsdFull(STABLES.totalSupply)}
            </div>
          </div>
          <div className="text-[10px] text-text-tertiary mono">
            {fmtCount(STABLES.totalHolders)} holders
          </div>
        </div>
        <Sparkline
          data={supplyHistory}
          color={chartPalette.accent}
          height={36}
          className="mt-2"
        />
      </div>
      {/* Bridge KPI — the unique value of having Fees + Stables side by side */}
      <div className="px-3.5 py-2.5 border-b border-border-subtle bg-gradient-to-r from-gold/[0.04] to-transparent">
        <div className="flex items-center gap-2">
          <Zap size={11} className="text-gold" />
          <span className="text-[10px] uppercase tracking-[0.06em] text-text-tertiary font-semibold">
            Yield context
          </span>
          <span className="mono text-[16px] font-bold text-gold ml-auto">
            ≈ {yieldPct.toFixed(1)}% APY
          </span>
        </div>
        <div className="text-[10px] text-text-tertiary mt-1">
          {fmtUsdCompact(REVENUE.windowTotal)} window × 4 / {fmtUsdCompact(STABLES.totalSupply)} capital
        </div>
      </div>
      <div>
        {STABLES.list.map((s, i) => (
          <div
            key={s.symbol}
            className={`flex items-center gap-2.5 px-3.5 py-1.5 ${
              i < STABLES.list.length - 1 ? "border-b border-border-subtle" : ""
            }`}
          >
            <TokenAvatar assetName={s.symbol} kind="spot" size="md" />
            <div className="min-w-0">
              <div className="text-[12px] font-semibold text-text-primary leading-tight">
                {s.symbol}
              </div>
              <div className="text-[9.5px] text-text-tertiary mono">
                {fmtCount(s.holders)} holders
              </div>
            </div>
            <span className="mono text-[11.5px] font-semibold text-text-primary ml-auto">
              {fmtUsdFull(s.supply)}
            </span>
            <span className="mono text-[10px] text-text-tertiary w-10 text-right">
              {s.pct.toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
      <StablesFooter />
    </Card>
  );
}

// Silenced unused import warning — `Activity` reserved for a future variant.
void Activity;
