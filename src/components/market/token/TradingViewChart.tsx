"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  CandlestickSeries,
  HistogramData,
  HistogramSeries,
  LineSeries,
  Time,
  LineStyle,
  CrosshairMode,
  ColorType,
  IPriceLine,
  PriceScaleMode,
} from "lightweight-charts";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, ChevronDown } from "lucide-react";
import {
  useTokenCandles,
  useTokenWebSocket,
  marketIndexToCoinId,
} from "@/services/market/token";
import { TokenCandle } from "@/services/market/token/types";
import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChartLoading, ChartEmpty, ChartError } from "@/components/common/charts";
import { chartColors } from "@/components/common/charts/chartTheme";

interface TradingViewChartProps {
  symbol: string;
  marketIndex?: number;
  tokenName?: string;
  className?: string;
  /** Direct coinId for perpetual WebSocket (e.g., "BTC") */
  coinId?: string;
  /** Perp coin to overlay as a line on a separate price scale (e.g., "BTC") */
  overlayPerpCoinId?: string;
  /** Strike price drawn as a horizontal line on the overlay scale */
  overlayStrikePrice?: number;
}

type TimeframeType =
  | "1m"
  | "3m"
  | "5m"
  | "15m"
  | "30m"
  | "1h"
  | "2h"
  | "4h"
  | "8h"
  | "12h"
  | "1d"
  | "3d"
  | "1w"
  | "1M";

const TIMEFRAMES: readonly TimeframeType[] = [
  "1m",
  "3m",
  "5m",
  "15m",
  "30m",
  "1h",
  "2h",
  "4h",
  "8h",
  "12h",
  "1d",
  "3d",
  "1w",
  "1M",
] as const;

// Quick-access bar: 5 most-used timeframes. The rest live in the "more" popover.
const QUICK_TIMEFRAMES: readonly TimeframeType[] = ["1h", "1d", "1w"] as const;

const TIMEFRAME_GROUPS: { label: string; items: readonly TimeframeType[] }[] = [
  { label: "Minutes", items: ["1m", "3m", "5m", "15m", "30m"] },
  { label: "Hours", items: ["1h", "2h", "4h", "8h", "12h"] },
  { label: "Days & up", items: ["1d", "3d", "1w", "1M"] },
];

// Price scale mode — lets the user switch the Y axis between linear,
// logarithmic, and percentage views. Persisted in localStorage.
type PriceScaleModeKey = "normal" | "log" | "percent";

const PRICE_SCALE_OPTIONS: {
  key: PriceScaleModeKey;
  label: string;
  title: string;
}[] = [
  { key: "normal", label: "Lin", title: "Linear scale" },
  { key: "log", label: "Log", title: "Logarithmic scale" },
  { key: "percent", label: "%", title: "Percentage scale" },
];

const toPriceScaleMode = (k: PriceScaleModeKey): PriceScaleMode => {
  switch (k) {
    case "log":
      return PriceScaleMode.Logarithmic;
    case "percent":
      return PriceScaleMode.Percentage;
    case "normal":
    default:
      return PriceScaleMode.Normal;
  }
};

// Helpers ──────────────────────────────────────────────────────────────
const convertToCandlestickData = (candle: TokenCandle): CandlestickData<Time> => ({
  time: Math.floor(candle.t / 1000) as Time,
  open: parseFloat(candle.o),
  high: parseFloat(candle.h),
  low: parseFloat(candle.l),
  close: parseFloat(candle.c),
});

const convertToVolumeData = (candle: TokenCandle): HistogramData<Time> => {
  const up = parseFloat(candle.c) >= parseFloat(candle.o);
  return {
    time: Math.floor(candle.t / 1000) as Time,
    value: parseFloat(candle.v),
    color: up ? "rgba(16,185,129,0.35)" : "rgba(244,63,94,0.35)",
  };
};

const getIntervalSeconds = (interval: TimeframeType): number => {
  const value = parseInt(interval);
  const unit = interval.slice(-1);
  switch (unit) {
    case "m":
      return value * 60;
    case "h":
      return value * 3600;
    case "d":
      return value * 86400;
    case "w":
      return value * 604800;
    case "M":
      return value * 2592000;
    default:
      return 86400;
  }
};

function formatCompactUsd(n: number) {
  if (!Number.isFinite(n)) return "—";
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function formatPrice(n: number) {
  if (!Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  if (abs >= 1000) return n.toFixed(2);
  if (abs >= 1) return n.toFixed(3);
  if (abs >= 0.01) return n.toFixed(4);
  return n.toFixed(6);
}

interface HoverInfo {
  time: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

export function TradingViewChart({
  marketIndex,
  tokenName,
  className,
  coinId: directCoinId,
  overlayPerpCoinId,
  overlayStrikePrice,
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const overlayLineRef = useRef<ISeriesApi<"Line"> | null>(null);
  const lastPriceLineRef = useRef<IPriceLine | null>(null);
  const lastCandleRef = useRef<CandlestickData<Time> | null>(null);

  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeType>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("tv_interval");
      if (saved && TIMEFRAMES.includes(saved as TimeframeType)) {
        return saved as TimeframeType;
      }
    }
    return "1d";
  });
  const [hover, setHover] = useState<HoverInfo | null>(null);
  const [laserY, setLaserY] = useState<number | null>(null);
  const [tfPopoverOpen, setTfPopoverOpen] = useState(false);

  const [priceScaleMode, setPriceScaleMode] = useState<PriceScaleModeKey>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("tv_price_scale_mode");
      if (saved === "normal" || saved === "log" || saved === "percent") {
        return saved;
      }
    }
    return "normal";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("tv_interval", selectedTimeframe);
    }
  }, [selectedTimeframe]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("tv_price_scale_mode", priceScaleMode);
    }
    if (chartRef.current) {
      chartRef.current.priceScale("right").applyOptions({
        mode: toPriceScaleMode(priceScaleMode),
      });
    }
  }, [priceScaleMode]);

  const coinId =
    directCoinId || (marketIndex !== undefined ? marketIndexToCoinId(marketIndex, tokenName) : null);

  const { candles, isLoading, error } = useTokenCandles({
    coin: coinId,
    interval: selectedTimeframe,
  });
  const { candles: overlayCandles } = useTokenCandles({
    coin: overlayPerpCoinId ?? null,
    interval: selectedTimeframe,
  });
  const { price: currentPrice, isLoading: wsLoading } = useTokenWebSocket(coinId || "");

  // ── Derived stats over the loaded candle history ─────────────────────
  const stats = useMemo(() => {
    if (!candles || candles.length === 0) return null;
    const now = Date.now();
    const dayAgo = now - 24 * 60 * 60 * 1000;
    const recent = candles.filter((c) => c.t >= dayAgo);
    const scope = recent.length > 0 ? recent : candles;
    let high = -Infinity;
    let low = Infinity;
    let vol = 0;
    for (const c of scope) {
      const h = parseFloat(c.h);
      const l = parseFloat(c.l);
      const v = parseFloat(c.v);
      if (h > high) high = h;
      if (l < low) low = l;
      vol += v;
    }
    const first = scope[0];
    const last = scope[scope.length - 1];
    const open = parseFloat(first.o);
    const close = parseFloat(last.c);
    const delta = close - open;
    const deltaPct = open > 0 ? (delta / open) * 100 : 0;
    return { high, low, vol, delta, deltaPct, isUp: delta >= 0 };
  }, [candles]);

  const liveLabelPrice = currentPrice ?? (stats ? parseFloat(candles[candles.length - 1]?.c ?? "0") : null);
  const isConnected = !wsLoading && currentPrice !== null;

  // ── Chart init (once) ────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;
    if (chartRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: chartColors.textMuted,
        fontFamily: "var(--font-inter), Inter, sans-serif",
        fontSize: 10,
        attributionLogo: false,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: {
          visible: true,
          color: "rgba(255,255,255,0.035)",
          style: LineStyle.Dashed,
        },
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
          labelBackgroundColor: chartColors.labelBg,
        },
      },
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: { top: 0.08, bottom: 0.26 },
        mode: toPriceScaleMode(priceScaleMode),
      },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 8,
        barSpacing: 8,
        minBarSpacing: 1,
        rightBarStaysOnScroll: true,
        lockVisibleTimeRangeOnResize: true,
      },
      handleScale: {
        axisPressedMouseMove: { time: true, price: true },
        axisDoubleClickReset: { time: true, price: true },
        mouseWheel: true,
        pinch: true,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true,
      },
    });

    const candle = chart.addSeries(CandlestickSeries, {
      upColor: chartColors.emerald,
      downColor: chartColors.rose,
      borderUpColor: chartColors.emerald,
      borderDownColor: chartColors.rose,
      wickUpColor: chartColors.emerald,
      wickDownColor: chartColors.rose,
      priceLineVisible: true,
      priceLineColor: chartColors.cyan,
      priceLineWidth: 1,
      priceLineStyle: LineStyle.Dashed,
      lastValueVisible: true,
    });

    const volume = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "vol",
      color: "rgba(131,233,255,0.3)",
      priceLineVisible: false,
      lastValueVisible: false,
    });
    chart.priceScale("vol").applyOptions({
      scaleMargins: { top: 0.78, bottom: 0 },
    });

    chartRef.current = chart;
    candleRef.current = candle;
    volumeRef.current = volume;

    // Crosshair readout ────────────────────────────────
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

    // Live laser Y recompute on zoom/pan
    const onRange = () => {
      if (!candleRef.current || lastCandleRef.current === null) return;
      const y = candleRef.current.priceToCoordinate(lastCandleRef.current.close);
      setLaserY(typeof y === "number" ? y : null);
    };
    chart.timeScale().subscribeVisibleLogicalRangeChange(onRange);

    // Resize
    const ro = new ResizeObserver((entries) => {
      if (entries.length === 0 || !entries[0].contentRect) return;
      const { width, height } = entries[0].contentRect;
      chart.applyOptions({ width, height });
      onRange();
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.timeScale().unsubscribeVisibleLogicalRangeChange(onRange);
      chart.remove();
      chartRef.current = null;
      candleRef.current = null;
      volumeRef.current = null;
      lastPriceLineRef.current = null;
    };
  // Right scale mode is updated by the dedicated `priceScaleMode` effect after init.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Push historical data when candles change ─────────────────────────
  useEffect(() => {
    if (!candleRef.current || !volumeRef.current) return;
    if (!candles || candles.length === 0) return;

    try {
      const sortedCandles = [...candles].sort((a, b) => a.t - b.t);
      const candleData = sortedCandles.map(convertToCandlestickData);
      const volumeData = sortedCandles.map(convertToVolumeData);

      candleRef.current.setData(candleData);
      volumeRef.current.setData(volumeData);

      const last = candleData[candleData.length - 1];
      lastCandleRef.current = last;
      const y = candleRef.current.priceToCoordinate(last.close);
      setLaserY(typeof y === "number" ? y : null);
    } catch (e) {
      console.error("Error updating chart data:", e);
    }
  }, [candles]);

  // ── Create / destroy overlay series when overlayPerpCoinId changes ──
  useEffect(() => {
    if (!chartRef.current) return;
    if (!overlayPerpCoinId) {
      if (overlayLineRef.current) {
        try { chartRef.current.removeSeries(overlayLineRef.current); } catch { /* ignore */ }
        overlayLineRef.current = null;
      }
      return;
    }
    if (overlayLineRef.current) return;
    const line = chartRef.current.addSeries(LineSeries, {
      color: "rgba(251,191,36,0.75)",
      lineWidth: 1,
      priceScaleId: "left",
      priceLineVisible: false,
      lastValueVisible: true,
      crosshairMarkerVisible: false,
    });
    chartRef.current.priceScale("left").applyOptions({
      scaleMargins: { top: 0.05, bottom: 0.25 },
      visible: true,
      borderVisible: false,
      textColor: "rgba(251,191,36,0.7)",
    });
    overlayLineRef.current = line;
  // overlayLineRef is stable; we only need to re-run when the prop changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overlayPerpCoinId]);

  // ── Push overlay data (full history, no clipping) ────────────────────
  useEffect(() => {
    if (!overlayLineRef.current || !overlayCandles || overlayCandles.length === 0) return;
    try {
      const data = [...overlayCandles]
        .sort((a, b) => a.t - b.t)
        .map((c) => ({ time: Math.floor(c.t / 1000) as Time, value: parseFloat(c.c) }));

      if (data.length === 0) return;
      overlayLineRef.current.setData(data);

      if (overlayStrikePrice != null) {
        if (lastPriceLineRef.current) {
          try { overlayLineRef.current.removePriceLine(lastPriceLineRef.current); } catch { /* ignore */ }
          lastPriceLineRef.current = null;
        }
        lastPriceLineRef.current = overlayLineRef.current.createPriceLine({
          price: overlayStrikePrice,
          color: "rgba(251,191,36,0.7)",
          lineWidth: 1,
          lineStyle: LineStyle.Dashed,
          axisLabelVisible: true,
          title: "Strike",
        });
      }
    } catch (e) {
      console.error("Error updating overlay:", e);
    }
  }, [overlayCandles, overlayStrikePrice]);

  // ── Real-time updates from websocket ─────────────────────────────────
  useEffect(() => {
    if (!currentPrice || !candleRef.current || !volumeRef.current || !lastCandleRef.current || !coinId) {
      return;
    }

    const nowSec = Math.floor(Date.now() / 1000) as Time;
    const step = getIntervalSeconds(selectedTimeframe);
    const candleTime = (Math.floor((nowSec as number) / step) * step) as Time;
    const lastCandle = lastCandleRef.current;
    const lastTime = lastCandle.time as number;
    const currentTimeStep = candleTime as number;

    let next: CandlestickData<Time>;
    if (currentTimeStep === lastTime) {
      next = {
        ...lastCandle,
        high: Math.max(lastCandle.high, currentPrice),
        low: Math.min(lastCandle.low, currentPrice),
        close: currentPrice,
      };
    } else if (currentTimeStep > lastTime) {
      next = {
        time: candleTime,
        open: lastCandle.close,
        high: currentPrice,
        low: currentPrice,
        close: currentPrice,
      };
    } else {
      return;
    }

    try {
      candleRef.current.update(next);
      lastCandleRef.current = next;
      const y = candleRef.current.priceToCoordinate(next.close);
      setLaserY(typeof y === "number" ? y : null);
    } catch (e) {
      console.error("Error updating real-time candle:", e);
    }
  }, [currentPrice, selectedTimeframe, coinId]);

  const hasNoData = !isLoading && !error && (!candles || candles.length === 0);

  return (
    <Card
      className={`relative w-full h-full flex flex-col overflow-hidden ${className || ""}`}
    >
      {/* Ambient glow (reflects session bias) */}
      <div
        className="pointer-events-none absolute -top-24 -left-16 h-56 w-56 rounded-full opacity-40 blur-3xl transition-colors duration-700"
        style={{
          background:
            stats?.isUp !== false
              ? "radial-gradient(circle, rgba(16,185,129,0.22), transparent 70%)"
              : "radial-gradient(circle, rgba(244,63,94,0.22), transparent 70%)",
        }}
      />

      {/* TOOLBAR — wraps on narrow screens so no info is ever hidden */}
      <div className="relative z-20 flex flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2.5 border-b border-border-subtle bg-gradient-to-b from-white/[0.02] to-transparent">
        {/* LIVE badge — always visible */}
        <span
          className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] ${isConnected
            ? "bg-emerald-500/10 text-emerald-400"
            : "bg-white/5 text-text-muted"
            }`}
        >
          <Radio
            className={`h-2.5 w-2.5 ${isConnected ? "animate-pulse" : ""}`}
          />
          {isConnected ? "Live" : "—"}
        </span>

        {overlayPerpCoinId && (
          <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] bg-amber-400/10 text-amber-400 border border-amber-400/20">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            {overlayPerpCoinId}
          </span>
        )}

        {/* Timeframe selector (desktop: quick pills + more popover) */}
        <div className="hidden min-[620px]:flex items-center rounded-lg border border-border-subtle bg-black/30 p-0.5">
          {QUICK_TIMEFRAMES.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTimeframe(t)}
              className="relative rounded-md px-2 py-0.5 text-[10.5px] font-semibold tabular-nums transition-colors whitespace-nowrap"
            >
              {selectedTimeframe === t && (
                <motion.span
                  layoutId="tv-active-tf"
                  className="absolute inset-0 rounded-md bg-brand-accent/15 ring-1 ring-brand-accent/40"
                  transition={{ type: "spring", bounce: 0.18, duration: 0.4 }}
                />
              )}
              <span
                className={`relative z-10 ${selectedTimeframe === t
                  ? "text-brand-accent"
                  : "text-text-secondary hover:text-white"
                  }`}
              >
                {t}
              </span>
            </button>
          ))}

          {/* "More" popover — shows all 14 grouped. Acts as the active indicator
              when the selected TF isn't in the quick bar. */}
          <TimeframePopover
            open={tfPopoverOpen}
            onOpenChange={setTfPopoverOpen}
            selected={selectedTimeframe}
            onSelect={(t) => {
              setSelectedTimeframe(t);
              setTfPopoverOpen(false);
            }}
          />
        </div>

        {/* Timeframe dropdown (mobile) */}
        <div className="min-[620px]:hidden relative">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value as TimeframeType)}
            className="appearance-none bg-brand-dark border border-border-subtle rounded-lg pl-3 pr-8 py-1.5 text-xs font-semibold tabular-nums text-brand-accent focus:outline-none focus:border-brand-accent/60"
          >
            {TIMEFRAMES.map((t) => (
              <option key={t} value={t} className="bg-brand-dark text-white">
                {t}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
        </div>

        {/* Price scale mode (Linear / Log / Percent) */}
        <div
          className="flex items-center rounded-lg border border-border-subtle bg-black/30 p-0.5"
          role="radiogroup"
          aria-label="Price axis scale"
        >
          {PRICE_SCALE_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              role="radio"
              aria-checked={priceScaleMode === opt.key}
              title={opt.title}
              onClick={() => setPriceScaleMode(opt.key)}
              className="relative rounded-md px-2 py-0.5 text-[10.5px] font-semibold tabular-nums transition-colors whitespace-nowrap"
            >
              {priceScaleMode === opt.key && (
                <motion.span
                  layoutId="tv-active-scale"
                  className="absolute inset-0 rounded-md bg-brand-accent/15 ring-1 ring-brand-accent/40"
                  transition={{ type: "spring", bounce: 0.18, duration: 0.4 }}
                />
              )}
              <span
                className={`relative z-10 ${priceScaleMode === opt.key
                  ? "text-brand-accent"
                  : "text-text-secondary hover:text-white"
                  }`}
              >
                {opt.label}
              </span>
            </button>
          ))}
        </div>

        {/* OHLC crosshair readout */}
        <div className="hidden lg:flex flex-1 items-center justify-center gap-3 text-[10px] font-semibold uppercase tracking-wider text-text-muted min-w-0">
          <AnimatePresence mode="wait">
            {hover && (
              <motion.div
                key={hover.time}
                initial={{ opacity: 0, y: -3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                className="flex items-center gap-3 min-w-0"
              >
                <span>
                  O <span className="text-white tabular-nums">{formatPrice(hover.o)}</span>
                </span>
                <span>
                  H <span className="text-emerald-400 tabular-nums">{formatPrice(hover.h)}</span>
                </span>
                <span>
                  L <span className="text-rose-400 tabular-nums">{formatPrice(hover.l)}</span>
                </span>
                <span>
                  C <span className="text-white tabular-nums">{formatPrice(hover.c)}</span>
                </span>
                <span>
                  V <span className="text-brand-accent tabular-nums">{formatCompactUsd(hover.v)}</span>
                </span>
                {hover.c >= hover.o ? (
                  <span className="text-emerald-400 tabular-nums">
                    +{(((hover.c - hover.o) / hover.o) * 100).toFixed(2)}%
                  </span>
                ) : (
                  <span className="text-rose-400 tabular-nums">
                    {(((hover.c - hover.o) / hover.o) * 100).toFixed(2)}%
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 24h stats — always visible, wraps to next row on narrow screens */}
        {stats && !hover && (
          <div className="ml-auto flex items-stretch gap-1.5">
            <ToolbarStat label="24h High" value={formatPrice(stats.high)} tone="emerald" />
            <ToolbarStat label="24h Low" value={formatPrice(stats.low)} tone="rose" />
          </div>
        )}
      </div>

      {/* CHART BODY */}
      <div className="relative flex-1 min-h-0">
        {/* Overlay states */}
        {(isLoading || error || hasNoData) && (
          <div className="absolute inset-0 bg-brand-secondary/60 backdrop-blur-md z-10 flex items-center justify-center">
            {error ? (
              <ChartError
                message={typeof error === "string" ? error : "Failed to load chart data"}
              />
            ) : isLoading ? (
              <ChartLoading />
            ) : (
              <ChartEmpty message="No candle data available" />
            )}
          </div>
        )}

        <div
          ref={containerRef}
          className="absolute inset-0 rounded-lg overflow-hidden"
        />

        {/* Live price laser dot (right edge, positioned via priceToCoordinate) */}
        {laserY !== null && liveLabelPrice !== null && !isLoading && (
          <div
            className="pointer-events-none absolute right-[60px] z-10 -translate-y-1/2"
            style={{ top: laserY }}
          >
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                {isConnected && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-accent/70" />
                )}
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-accent shadow-[0_0_8px_rgba(131,233,255,0.8)]" />
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

// ── Timeframe "more" popover ───────────────────────────────────────────
function TimeframePopover({
  open,
  onOpenChange,
  selected,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  selected: TimeframeType;
  onSelect: (t: TimeframeType) => void;
}) {
  const isSelectedInQuick = (QUICK_TIMEFRAMES as readonly string[]).includes(selected);
  // When the current TF isn't in the quick bar, the trigger becomes the visible
  // indicator and shows the active TF label in accent.
  const triggerLabel = isSelectedInQuick ? null : selected;

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="More timeframes"
          className={`relative ml-0.5 flex items-center gap-0.5 rounded-md px-2 py-0.5 text-[10.5px] font-semibold tabular-nums transition-colors ${triggerLabel
            ? "bg-brand-accent/15 text-brand-accent ring-1 ring-brand-accent/40"
            : open
              ? "text-white bg-white/5"
              : "text-text-secondary hover:text-white"
            }`}
        >
          {triggerLabel ? <span>{triggerLabel}</span> : <span>···</span>}
          <ChevronDown
            className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-auto min-w-[220px] rounded-xl border border-border-hover bg-[#0B0E14]/95 backdrop-blur-md p-2 shadow-2xl shadow-black/40"
      >
        <div className="flex flex-col gap-2">
          {TIMEFRAME_GROUPS.map((group) => (
            <div key={group.label}>
              <div className="px-1 pb-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-text-muted">
                {group.label}
              </div>
              <div className="grid grid-cols-5 gap-1">
                {group.items.map((t) => {
                  const isActive = selected === t;
                  return (
                    <button
                      key={t}
                      onClick={() => onSelect(t)}
                      className={`relative rounded-md px-2 py-1 text-[11px] font-semibold tabular-nums transition-colors ${isActive
                        ? "bg-brand-accent/15 text-brand-accent ring-1 ring-brand-accent/40"
                        : "text-text-secondary hover:bg-white/5 hover:text-white"
                        }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ── Small toolbar stat pill ────────────────────────────────────────────
function ToolbarStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "emerald" | "rose" | "accent";
}) {
  const dot =
    tone === "emerald"
      ? "bg-emerald-400"
      : tone === "rose"
        ? "bg-rose-400"
        : "bg-brand-accent";
  return (
    <div className="flex items-center gap-1.5 rounded-md border border-border-subtle bg-white/[0.02] px-1.5 py-0.5 sm:gap-2 sm:px-2">
      <span className={`h-1 w-1 rounded-full ${dot}`} />
      <span className="text-[9px] font-semibold uppercase tracking-wider text-text-muted">
        {label}
      </span>
      <span className="text-[11px] font-semibold text-white tabular-nums">{value}</span>
    </div>
  );
}
