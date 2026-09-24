import { ColorType, CrosshairMode, LineStyle } from "lightweight-charts";
import type { DeepPartial, ChartOptions } from "lightweight-charts";
import { chartColors } from "./chartTheme";

/**
 * Lightweight Charts theme. Import it by path
 * (`@/components/common/charts/lwcTheme`), not through the `@/components/common`
 * barrel: it pulls the `lightweight-charts` runtime, which must stay out of the
 * app shell.
 */

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
