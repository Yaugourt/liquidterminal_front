"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
  CandlestickData,
  HistogramData,
  LineData,
  Time,
  LineStyle,
  CrosshairMode,
  ColorType,
} from "lightweight-charts";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, Radio } from "lucide-react";
import { buildCandles, CandlePoint } from "./mockData";

const TIMEFRAMES = ["15m", "1h", "4h", "1D", "1W"] as const;
type Tf = (typeof TIMEFRAMES)[number];

const COLORS = {
  up: "#10b981",
  down: "#f43f5e",
  accent: "#83e9ff",
  gridLine: "rgba(255,255,255,0.04)",
  muted: "#71717a",
  secondary: "#a1a1aa",
} as const;

function formatUsd(n: number, frac = 2) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: frac,
    maximumFractionDigits: frac,
  });
}

function formatCompact(n: number) {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toFixed(0);
}

interface HoverInfo {
  time: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

export function QuantumCandleChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const markerRef = useRef<ISeriesApi<"Line"> | null>(null);

  const [tf, setTf] = useState<Tf>("4h");
  const [hover, setHover] = useState<HoverInfo | null>(null);
  const [pulse, setPulse] = useState(0);

  // Regenerate data when timeframe changes — the domain differs per TF.
  const candles: CandlePoint[] = useMemo(() => {
    const counts: Record<Tf, number> = {
      "15m": 120,
      "1h": 96,
      "4h": 90,
      "1D": 120,
      "1W": 104,
    };
    return buildCandles(counts[tf], 34 + TIMEFRAMES.indexOf(tf) * 1.2);
  }, [tf]);

  const last = candles[candles.length - 1];
  const first = candles[0];
  const deltaAbs = last.close - first.close;
  const deltaPct = (deltaAbs / first.close) * 100;
  const isUp = deltaAbs >= 0;

  const stats = useMemo(() => {
    const high = Math.max(...candles.map((c) => c.high));
    const low = Math.min(...candles.map((c) => c.low));
    const vol = candles.reduce((s, c) => s + c.volume, 0);
    return { high, low, vol };
  }, [candles]);

  // Pulsing live indicator
  useEffect(() => {
    const id = setInterval(() => setPulse((p) => (p + 1) % 100), 1200);
    return () => clearInterval(id);
  }, []);

  // Init chart once
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: COLORS.muted,
        fontFamily: "var(--font-inter), Inter, sans-serif",
        fontSize: 10,
        attributionLogo: false,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: true, color: COLORS.gridLine, style: LineStyle.Dashed },
      },
      crosshair: {
        mode: CrosshairMode.Magnet,
        vertLine: {
          color: "rgba(131,233,255,0.35)",
          width: 1,
          style: LineStyle.Solid,
          labelVisible: false,
        },
        horzLine: {
          color: "rgba(131,233,255,0.35)",
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: "#0B0E14",
        },
      },
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: { top: 0.08, bottom: 0.28 },
      },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 6,
        barSpacing: 8,
      },
      handleScroll: { mouseWheel: true, pressedMouseMove: true },
    });

    const candle = chart.addSeries(CandlestickSeries, {
      upColor: COLORS.up,
      downColor: COLORS.down,
      borderUpColor: COLORS.up,
      borderDownColor: COLORS.down,
      wickUpColor: COLORS.up,
      wickDownColor: COLORS.down,
      priceFormat: { type: "price", precision: 2, minMove: 0.01 },
    });

    const volume = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "vol",
      color: "rgba(131,233,255,0.35)",
    });
    chart.priceScale("vol").applyOptions({
      scaleMargins: { top: 0.78, bottom: 0 },
    });

    const marker = chart.addSeries(LineSeries, {
      color: COLORS.accent,
      lineWidth: 1,
      lineStyle: LineStyle.Dashed,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    });

    chartRef.current = chart;
    candleRef.current = candle;
    volumeRef.current = volume;
    markerRef.current = marker;

    const ro = new ResizeObserver((entries) => {
      if (!entries[0]) return;
      const { width, height } = entries[0].contentRect;
      chart.applyOptions({ width, height });
    });
    ro.observe(containerRef.current);

    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !candleRef.current) {
        setHover(null);
        return;
      }
      const c = param.seriesData.get(candleRef.current) as CandlestickData<Time> | undefined;
      const v = volumeRef.current
        ? (param.seriesData.get(volumeRef.current) as HistogramData<Time> | undefined)
        : undefined;
      if (!c) {
        setHover(null);
        return;
      }
      setHover({
        time: (param.time as number) * 1000,
        o: c.open,
        h: c.high,
        l: c.low,
        c: c.close,
        v: v?.value ?? 0,
      });
    });

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      candleRef.current = null;
      volumeRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // Push data on tf change
  useEffect(() => {
    if (!candleRef.current || !volumeRef.current || !markerRef.current) return;

    const candleData: CandlestickData<Time>[] = candles.map((c) => ({
      time: Math.floor(c.time / 1000) as Time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));
    const volumeData: HistogramData<Time>[] = candles.map((c) => ({
      time: Math.floor(c.time / 1000) as Time,
      value: c.volume,
      color: c.close >= c.open ? "rgba(16,185,129,0.35)" : "rgba(244,63,94,0.35)",
    }));
    const markerData: LineData<Time>[] = [
      { time: Math.floor(candles[0].time / 1000) as Time, value: last.close },
      { time: Math.floor(last.time / 1000) as Time, value: last.close },
    ];

    candleRef.current.setData(candleData);
    volumeRef.current.setData(volumeData);
    markerRef.current.setData(markerData);
    chartRef.current?.timeScale().fitContent();
  }, [candles, last.close, last.time]);

  return (
    <div className="relative bg-surface border border-border-subtle rounded-lg overflow-hidden h-[460px] flex flex-col">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute -top-20 -left-20 h-64 w-64 rounded-full opacity-40 blur-3xl"
        style={{
          background: isUp
            ? "radial-gradient(circle, rgba(16,185,129,0.25), transparent 70%)"
            : "radial-gradient(circle, rgba(244,63,94,0.25), transparent 70%)",
        }}
      />

      {/* HEADER */}
      <div className="relative z-10 flex items-start justify-between gap-4 px-6 pt-5 pb-3">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-accent/30 to-brand-accent/5 border border-brand-accent/30">
            <span className="text-xs font-bold text-brand-accent">H</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[15px] font-semibold text-text-primary tracking-tight">HYPE / USDC</h3>
              <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-text-secondary">
                Perp
              </span>
              <span className="flex items-center gap-1 rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-emerald-400">
                <Radio
                  className={`h-2.5 w-2.5 transition-opacity ${pulse % 2 ? "opacity-100" : "opacity-40"}`}
                />
                Live
              </span>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-[28px] font-bold text-text-primary tabular-nums tracking-tight">
                {formatUsd(last.close)}
              </span>
              <span
                className={`flex items-center gap-0.5 text-sm font-semibold tabular-nums ${isUp ? "text-emerald-400" : "text-rose-400"}`}
              >
                {isUp ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
                {deltaAbs >= 0 ? "+" : ""}
                {deltaAbs.toFixed(2)} ({deltaPct >= 0 ? "+" : ""}
                {deltaPct.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Side stats */}
        <div className="hidden md:flex items-stretch gap-2">
          <StatPill label="24h High" value={formatUsd(stats.high)} accent="emerald" />
          <StatPill label="24h Low" value={formatUsd(stats.low)} accent="rose" />
          <StatPill label="Volume" value={`$${formatCompact(stats.vol)}`} accent="accent" />
        </div>
      </div>

      {/* TIMEFRAME PILLS */}
      <div className="relative z-10 flex items-center justify-between px-6 pb-3">
        <div className="relative flex items-center rounded-lg border border-border-subtle bg-black/30 p-1">
          {TIMEFRAMES.map((t) => (
            <button
              key={t}
              onClick={() => setTf(t)}
              className="relative rounded-lg px-3 py-1 text-[11px] font-semibold tabular-nums transition-colors"
            >
              {tf === t && (
                <motion.span
                  layoutId="qc-active-tf"
                  className="absolute inset-0 rounded-lg bg-brand-accent/15 ring-1 ring-brand-accent/40"
                  transition={{ type: "spring", bounce: 0.18, duration: 0.45 }}
                />
              )}
              <span
                className={`relative z-10 ${tf === t ? "text-brand-accent" : "text-text-secondary hover:text-text-primary"}`}
              >
                {t}
              </span>
            </button>
          ))}
        </div>

        {/* OHLC hover readout */}
        <AnimatePresence mode="wait">
          {hover && (
            <motion.div
              key={hover.time}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="hidden lg:flex items-center gap-3 text-[10px] font-semibold uppercase tracking-wider text-text-muted"
            >
              <span>
                O <span className="text-text-primary tabular-nums">{hover.o.toFixed(2)}</span>
              </span>
              <span>
                H <span className="text-emerald-400 tabular-nums">{hover.h.toFixed(2)}</span>
              </span>
              <span>
                L <span className="text-rose-400 tabular-nums">{hover.l.toFixed(2)}</span>
              </span>
              <span>
                C <span className="text-text-primary tabular-nums">{hover.c.toFixed(2)}</span>
              </span>
              <span>
                V <span className="text-brand-accent tabular-nums">${formatCompact(hover.v)}</span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CHART */}
      <div className="relative flex-1 min-h-0 px-2">
        <div ref={containerRef} className="h-full w-full" />

        {/* Live price laser label */}
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
          <div className="flex items-center gap-1 rounded-md bg-brand-accent/90 px-2 py-0.5 text-[10px] font-bold text-brand-tertiary shadow-lg shadow-brand-accent/30 tabular-nums">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/80" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
            </span>
            {last.close.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatPill({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: "emerald" | "rose" | "accent";
}) {
  const dot =
    accent === "emerald"
      ? "bg-emerald-400"
      : accent === "rose"
        ? "bg-rose-400"
        : "bg-brand-accent";
  return (
    <div className="min-w-[92px] rounded-lg border border-border-subtle bg-white/[0.02] px-3 py-1.5">
      <div className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-wider text-text-muted">
        <span className={`h-1 w-1 rounded-full ${dot}`} />
        {label}
      </div>
      <div className="mt-0.5 text-xs font-semibold text-text-primary tabular-nums">{value}</div>
    </div>
  );
}
