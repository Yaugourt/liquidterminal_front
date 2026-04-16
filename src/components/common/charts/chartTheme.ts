import { ColorType, CrosshairMode, LineStyle } from "lightweight-charts";
import type { DeepPartial, ChartOptions } from "lightweight-charts";

// ── Color palette ──────────────────────────────────────────────────────
export const chartColors = {
  bg: "transparent",
  textMuted: "#71717a",
  textSecondary: "#a1a1aa",
  gridLine: "rgba(255, 255, 255, 0.05)",
  crosshair: "rgba(255, 255, 255, 0.1)",
  labelBg: "#0B0E14",

  cyan: "#83e9ff",
  gold: "#f9e370",
  emerald: "#10b981",
  rose: "#f43f5e",

  cyanArea: "rgba(131, 233, 255, 0.30)",
  goldArea: "rgba(249, 227, 112, 0.30)",
} as const;

// ── Recharts axis / grid shared props ──────────────────────────────────
export const rechartsAxisDefaults = {
  tick: { fill: chartColors.textMuted, fontSize: 10 },
  axisLine: false,
  tickLine: false,
} as const;

export const rechartsGridDefaults = {
  strokeDasharray: "3 3",
  stroke: chartColors.gridLine,
  vertical: false,
} as const;

export const rechartsTooltipContainer =
  "bg-brand-secondary/95 border border-border-subtle rounded-lg px-3 py-2 shadow-xl backdrop-blur-sm" as const;

// ── Lightweight Charts shared options ──────────────────────────────────
export const lwcDefaults: DeepPartial<ChartOptions> = {
  layout: {
    background: { type: ColorType.Solid, color: chartColors.bg },
    textColor: chartColors.textMuted,
    fontFamily: "var(--font-inter), Inter, sans-serif",
    fontSize: 10,
  },
  grid: {
    vertLines: { visible: false },
    horzLines: {
      visible: true,
      color: chartColors.gridLine,
      style: LineStyle.Dashed,
    },
  },
  crosshair: {
    mode: CrosshairMode.Magnet,
    vertLine: {
      color: chartColors.crosshair,
      width: 1,
      style: LineStyle.Solid,
      labelVisible: false,
    },
    horzLine: {
      color: chartColors.crosshair,
      width: 1,
      style: LineStyle.Solid,
      labelVisible: true,
      labelBackgroundColor: chartColors.labelBg,
    },
  },
  rightPriceScale: {
    borderVisible: false,
    scaleMargins: { top: 0.15, bottom: 0.1 },
  },
  timeScale: {
    borderVisible: false,
    timeVisible: true,
    secondsVisible: false,
    fixLeftEdge: true,
    fixRightEdge: true,
  },
  handleScale: {
    axisPressedMouseMove: { time: true, price: false },
  },
  handleScroll: {
    mouseWheel: true,
    pressedMouseMove: true,
    horzTouchDrag: true,
    vertTouchDrag: false,
  },
};
