"use client";

import { QuantumCandleChart } from "@/components/labs/charts/QuantumCandleChart";
import { AuroraAreaChart } from "@/components/labs/charts/AuroraAreaChart";
import { LiquidationFlowChart } from "@/components/labs/charts/LiquidationFlowChart";
import { OrbitCompositionChart } from "@/components/labs/charts/OrbitCompositionChart";
import { Sparkles } from "lucide-react";

const CHARTS = [
  {
    id: "quantum",
    number: "01",
    name: "Quantum Candle",
    tag: "Candlestick · Volume · Live",
    summary:
      "Trader-grade candlestick with a pulsing live-price laser, in-chart volume histogram coloured by candle direction, rich OHLC crosshair readout, and ambient glow that follows the session bias.",
  },
  {
    id: "aurora",
    number: "02",
    name: "Aurora Capital",
    tag: "Stacked Area · Multi-Series",
    summary:
      "Layered TVL / OI / Staking visualization with deep gradient fills, click-to-toggle legend pills that double as KPIs, and a hero total that updates live with the crosshair position.",
  },
  {
    id: "flow",
    number: "03",
    name: "Liquidation Flow",
    tag: "Directional Histogram · Heatmap",
    summary:
      "Longs vs shorts split around the live price with heat-intensity bars, max-pain markers, cumulative split ratio, and a focus row on the current market price — replaces the generic bar chart.",
  },
  {
    id: "orbit",
    number: "04",
    name: "Orbit Composition",
    tag: "Donut · Center Metric",
    summary:
      "Portfolio breakdown with animated segments, a glassmorphism center metric that morphs to the hovered asset, and an interactive legend with per-row progress bars and 24h delta.",
  },
];

export default function ChartsLabPage() {
  return (
    <div className="space-y-10">
      {/* HERO */}
      <header className="relative overflow-hidden rounded-3xl border border-border-subtle bg-gradient-to-br from-[#111826]/80 via-brand-secondary/60 to-[#0B0E14]/90 p-8">
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-brand-accent/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-brand-gold/10 blur-3xl" />
        <div className="relative z-10 flex flex-col gap-3">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-brand-accent/30 bg-brand-accent/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-accent">
            <Sparkles className="h-3 w-3" />
            Charts Lab
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Four premium chart patterns
          </h1>
          <p className="max-w-3xl text-sm text-text-secondary leading-relaxed md:text-[15px]">
            Design exploration to push Liquid Terminal visualisations past the
            current <code className="rounded bg-white/5 px-1.5 py-0.5 text-[12px] text-brand-accent">TradingViewChart</code>
            {" "}aesthetic and towards an institutional feel comparable to Artemis and HyperScreener — with
            deeper gradients, live indicators, richer tooltips and motion baked into the chrome.
            All data here is mocked for design review.
          </p>
        </div>
      </header>

      {/* INDEX LEGEND */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        {CHARTS.map((c) => (
          <a
            key={c.id}
            href={`#${c.id}`}
            className="group rounded-2xl border border-border-subtle bg-brand-secondary/40 p-4 transition-all hover:border-border-hover hover:bg-brand-secondary/70"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-brand-accent">
                {c.number}
              </span>
              <span className="text-[9px] font-semibold uppercase tracking-wider text-text-muted">
                {c.tag}
              </span>
            </div>
            <div className="mt-3 text-[15px] font-semibold text-white">{c.name}</div>
            <div className="mt-1 text-[11px] text-text-muted leading-relaxed line-clamp-2">
              {c.summary}
            </div>
          </a>
        ))}
      </div>

      {/* CHART SECTIONS */}
      {CHARTS.map((c, i) => (
        <section key={c.id} id={c.id} className="scroll-mt-24 space-y-3">
          <SectionLabel number={c.number} name={c.name} tag={c.tag} summary={c.summary} />
          <div>
            {i === 0 && <QuantumCandleChart />}
            {i === 1 && <AuroraAreaChart />}
            {i === 2 && <LiquidationFlowChart />}
            {i === 3 && <OrbitCompositionChart />}
          </div>
        </section>
      ))}

      {/* FOOTER */}
      <footer className="pb-6 text-center text-[11px] text-text-muted">
        Showcase page · mock data · not production-wired.
      </footer>
    </div>
  );
}

function SectionLabel({
  number,
  name,
  tag,
  summary,
}: {
  number: string;
  name: string;
  tag: string;
  summary: string;
}) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
      <div className="flex items-baseline gap-3">
        <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-accent">
          {number}
        </span>
        <h2 className="text-xl font-bold text-white tracking-tight">{name}</h2>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
          {tag}
        </span>
      </div>
      <p className="max-w-2xl text-[12px] text-text-secondary md:text-right leading-relaxed">
        {summary}
      </p>
    </div>
  );
}
