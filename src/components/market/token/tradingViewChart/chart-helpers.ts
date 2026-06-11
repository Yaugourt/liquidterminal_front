import {
  PriceScaleMode,
  type CandlestickData,
  type HistogramData,
  type Time,
} from "lightweight-charts";
import type { TokenCandle } from "@/services/market/token/types";

// ── Timeframes ──────────────────────────────────────────────────────────

export type TimeframeType =
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

export const TIMEFRAMES: readonly TimeframeType[] = [
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

/**
 * Quick-access bar shown in the toolbar. The rest live behind the "more" popover.
 */
export const QUICK_TIMEFRAMES: readonly TimeframeType[] = ["1h", "1d", "1w"] as const;

export const TIMEFRAME_GROUPS: { label: string; items: readonly TimeframeType[] }[] = [
  { label: "Minutes", items: ["1m", "3m", "5m", "15m", "30m"] },
  { label: "Hours", items: ["1h", "2h", "4h", "8h", "12h"] },
  { label: "Days & up", items: ["1d", "3d", "1w", "1M"] },
];

// ── Price scale modes ───────────────────────────────────────────────────

export type PriceScaleModeKey = "normal" | "log" | "percent";

export const PRICE_SCALE_OPTIONS: {
  key: PriceScaleModeKey;
  label: string;
  title: string;
}[] = [
  { key: "normal", label: "Lin", title: "Linear scale" },
  { key: "log", label: "Log", title: "Logarithmic scale" },
  { key: "percent", label: "%", title: "Percentage scale" },
];

export function toPriceScaleMode(k: PriceScaleModeKey): PriceScaleMode {
  switch (k) {
    case "log":
      return PriceScaleMode.Logarithmic;
    case "percent":
      return PriceScaleMode.Percentage;
    case "normal":
    default:
      return PriceScaleMode.Normal;
  }
}

// ── Candle / volume data converters ─────────────────────────────────────

export const convertToCandlestickData = (candle: TokenCandle): CandlestickData<Time> => ({
  time: Math.floor(candle.t / 1000) as Time,
  open: parseFloat(candle.o),
  high: parseFloat(candle.h),
  low: parseFloat(candle.l),
  close: parseFloat(candle.c),
});

export const convertToVolumeData = (candle: TokenCandle): HistogramData<Time> => {
  const up = parseFloat(candle.c) >= parseFloat(candle.o);
  return {
    time: Math.floor(candle.t / 1000) as Time,
    value: parseFloat(candle.v),
    color: up ? "rgba(16,185,129,0.35)" : "rgba(244,63,94,0.35)",
  };
};

export function getIntervalSeconds(interval: TimeframeType): number {
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
}

// ── Display formatters ──────────────────────────────────────────────────

export function formatPrice(n: number) {
  if (!Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  if (abs >= 1000) return n.toFixed(2);
  if (abs >= 1) return n.toFixed(3);
  if (abs >= 0.01) return n.toFixed(4);
  return n.toFixed(6);
}
