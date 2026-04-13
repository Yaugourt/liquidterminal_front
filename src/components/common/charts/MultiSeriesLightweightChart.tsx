"use client";

import { useEffect, useRef, useCallback, memo } from "react";
import {
  createChart,
  ColorType,
  IChartApi,
  ISeriesApi,
  LineData,
  Time,
  CrosshairMode,
  LineStyle,
  LineSeries,
} from "lightweight-charts";

export interface MultiSeriesDataPoint {
  time: number; // timestamp in milliseconds
  value: number;
}

export interface ChartSeries {
  name: string;
  data: MultiSeriesDataPoint[];
  color: string;
}

interface MultiSeriesLightweightChartProps {
  series: ChartSeries[];
  height?: number;
  showGrid?: boolean;
  formatValue?: (value: number) => string;
}

const COLORS = [
  "#83e9ff",
  "#f9e370",
  "#4ade80",
  "#f87171",
  "#a78bfa",
  "#fb923c",
];

const MultiSeriesLightweightChartComponent = ({
  series,
  height,
  showGrid = true,
  formatValue,
}: MultiSeriesLightweightChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRefsRef = useRef<ISeriesApi<"Line">[]>([]);

  const formatData = useCallback(
    (rawData: MultiSeriesDataPoint[]): LineData<Time>[] => {
      return rawData
        .map((point) => ({
          time: Math.floor(point.time / 1000) as Time,
          value: point.value,
        }))
        .sort((a, b) => (a.time as number) - (b.time as number));
    },
    []
  );

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const container = chartContainerRef.current;
    const initialWidth = container.clientWidth || 400;
    const initialHeight = height || container.clientHeight || 200;

    chartRef.current = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#525252",
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
        fontSize: 10,
      },
      width: initialWidth,
      height: initialHeight,
      grid: {
        vertLines: { visible: false },
        horzLines: {
          visible: showGrid,
          color: "rgba(255, 255, 255, 0.05)",
          style: LineStyle.Dashed,
        },
      },
      crosshair: {
        mode: CrosshairMode.Magnet,
        vertLine: {
          color: "rgba(255, 255, 255, 0.1)",
          width: 1,
          style: LineStyle.Solid,
          labelVisible: false,
        },
        horzLine: {
          color: "rgba(255, 255, 255, 0.1)",
          width: 1,
          style: LineStyle.Solid,
          labelVisible: true,
          labelBackgroundColor: "#0B0E14",
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
        tickMarkFormatter: (time: Time) => {
          const date = new Date((time as number) * 1000);
          return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
        },
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
    });

    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length === 0 || !chartRef.current) return;
      const { width, height: containerHeight } = entries[0].contentRect;
      if (width > 0 && containerHeight > 0) {
        chartRef.current.applyOptions({
          width,
          height: height || containerHeight,
        });
      }
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      chartRef.current?.remove();
      chartRef.current = null;
      seriesRefsRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showGrid]);

  // Update series data whenever series prop changes
  useEffect(() => {
    if (!chartRef.current) return;

    // Remove stale series
    seriesRefsRef.current.forEach((s) => {
      try {
        chartRef.current?.removeSeries(s);
      } catch {
        // already removed
      }
    });
    seriesRefsRef.current = [];

    // Add new series
    series.forEach((s, i) => {
      if (!chartRef.current) return;
      const color = s.color || COLORS[i % COLORS.length];
      const lineSeries = chartRef.current.addSeries(LineSeries, {
        color,
        lineWidth: 2,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 4,
        crosshairMarkerBackgroundColor: color,
        crosshairMarkerBorderColor: "#0B0E14",
        crosshairMarkerBorderWidth: 2,
        priceFormat: {
          type: "custom",
          formatter: formatValue || ((price: number) => price.toLocaleString()),
        },
      });

      if (s.data.length > 0) {
        lineSeries.setData(formatData(s.data));
      }

      seriesRefsRef.current.push(lineSeries);
    });

    chartRef.current.timeScale().fitContent();
  }, [series, formatData, formatValue]);

  // Update height
  useEffect(() => {
    if (!chartRef.current || !height) return;
    chartRef.current.applyOptions({ height });
  }, [height]);

  return (
    <div
      ref={chartContainerRef}
      className="w-full h-full"
      style={{ minHeight: height || 200 }}
    />
  );
};

export const MultiSeriesLightweightChart = memo(
  MultiSeriesLightweightChartComponent
);
