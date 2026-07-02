import { ColorType, CrosshairMode, LineStyle } from "lightweight-charts";
import type { DeepPartial, ChartOptions } from "lightweight-charts";

// ── Color palette ──────────────────────────────────────────────────────
// SSOT for chart colors. This is the ONLY file in src/components allowed
// to contain hex literals (enforced by ESLint override).
export const chartColors = {
  bg: "transparent",
  // V4: axis/grid aligned on V4 text & border tokens (spec §8.2).
  textMuted: "#6B7280",        // --text-tertiary
  textSecondary: "#9CA3AF",    // --text-secondary
  gridLine: "rgba(30, 37, 53, 0.5)",  // --border-subtle @ 50%
  crosshair: "rgba(255, 255, 255, 0.1)",
  labelBg: "#0F1421",          // --bg-surface

  cyan: "#83e9ff",
  gold: "#f9e370",
  emerald: "#10b981",
  rose: "#f43f5e",

  cyanArea: "rgba(131, 233, 255, 0.30)",
  goldArea: "rgba(249, 227, 112, 0.30)",
} as const;

/**
 * chartPalette — official secondary palette for charts.
 *
 * UI tokens stay brand-accent (cyan) + brand-gold. Charts that need more
 * differentiation (multi-series donut, candlestick up/down, flow charts)
 * MUST source colors from here instead of inlining hex literals.
 *
 * Sync with CSS variables in globals.css (--chart-up-rgb, --chart-down-rgb,
 * --chart-violet-rgb) which are used for dynamic-alpha animations.
 */
export const chartPalette = {
  accent: chartColors.cyan,        // brand-accent
  gold: chartColors.gold,          // brand-gold
  up: chartColors.emerald,         // candlestick green / positive
  down: chartColors.rose,          // candlestick red / negative
  success: "#1FB58E",              // V4 --success — match Tailwind `text-success`
  danger: "#E53E3E",               // V4 --danger  — match Tailwind `text-danger`
  violet: "#a78bfa",
  cyanVariant: "#6bd4f0",          // slightly desaturated cyan (chart-specific)
  emeraldLight: "#4ade80",         // emerald-400 (also covers #34d399 close enough)
  roseLight: "#ff5252",
  roseSoft: "#f87171",             // rose-400 — used by Hip4Prices / TableRow PnL
  amber: "#fbbf24",
  pink: "#ec4899",
  /** JS-side brand background tokens (mirrors tailwind.config.ts `brand.*`). */
  brandMain: "#0B0E14",
  brandSecondary: "#151A25",
  brandTertiary: "#051728",
  brandDark: "#0A0D12",
  white: "rgb(255 255 255)",
  /** V4 multi-series palette for donuts/pies/stacked bars (spec §8.1). */
  multiSeries: [
    "#83E9FF", // 0 brand cyan
    "#1692AD", // 1 cyan deep
    "#F9E370", // 2 gold
    "#A78BFA", // 3 violet
    "#F472B6", // 4 pink
    "#34D399", // 5 emerald
    "#FB923C", // 6 orange
    "#60A5FA", // 7 blue
  ] as readonly string[],
  /** Mono-hue cyan ramp (light→deep) for ranked single-metric segments,
   *  e.g. the validator stake-share DominanceBar. */
  cyanRamp: [
    "#83E9FF", // 0 brand cyan
    "#5FC9E6", // 1
    "#3FA9CC", // 2
    "#2C8CB0", // 3
    "#1F6E8C", // 4
  ] as readonly string[],
} as const;

export type ChartPalette = typeof chartPalette;

// ── Recharts axis / grid shared props ──────────────────────────────────
export const rechartsAxisDefaults = {
  tick: {
    fill: chartColors.textMuted,
    fontSize: 10,
    fontFamily: "var(--font-mono), monospace",
  },
  axisLine: false,
  tickLine: false,
} as const;

export const rechartsGridDefaults = {
  strokeDasharray: "3 3",
  stroke: chartColors.gridLine,
  vertical: false,
} as const;

export const rechartsTooltipContainer =
  "bg-surface border border-border-default rounded-lg px-3 py-2 shadow-md" as const;

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

/**
 * createLwcChartOptions — single entry point for any `lightweight-charts`
 * consumer. Returns `lwcDefaults` deep-merged with the caller's overrides so
 * font, grid, crosshair and scale conventions stay consistent across every
 * chart in the app.
 *
 * Usage:
 * ```ts
 * const chart = createChart(container, createLwcChartOptions({
 *   width: container.clientWidth,
 *   height: 480,
 *   rightPriceScale: { scaleMargins: { top: 0.08, bottom: 0.26 } },
 * }));
 * ```
 *
 * The override object is shallow-merged at the top level, then per top-level
 * key. We keep the merge intentionally shallow-but-keyed: most LWC options
 * are flat (booleans, colors, scaleMargins, etc.) and the few nested ones
 * are themselves stable objects.
 */
export function createLwcChartOptions(
  overrides?: DeepPartial<ChartOptions>,
): DeepPartial<ChartOptions> {
  if (!overrides) return { ...lwcDefaults };

  const merged: DeepPartial<ChartOptions> = { ...lwcDefaults };
  const defaultsRecord = lwcDefaults as unknown as Record<string, unknown>;
  const overridesRecord = overrides as unknown as Record<string, unknown>;
  const mergedRecord = merged as unknown as Record<string, unknown>;

  for (const key of Object.keys(overridesRecord)) {
    const overrideValue = overridesRecord[key];
    const defaultValue = defaultsRecord[key];
    if (
      overrideValue &&
      typeof overrideValue === "object" &&
      !Array.isArray(overrideValue) &&
      defaultValue &&
      typeof defaultValue === "object" &&
      !Array.isArray(defaultValue)
    ) {
      mergedRecord[key] = {
        ...(defaultValue as Record<string, unknown>),
        ...(overrideValue as Record<string, unknown>),
      };
    } else {
      mergedRecord[key] = overrideValue;
    }
  }

  return merged;
}
