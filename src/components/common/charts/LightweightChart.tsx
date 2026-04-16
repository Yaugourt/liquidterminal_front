"use client";

import { useEffect, useRef, useCallback, memo } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  AreaData,
  Time,
  AreaSeries,
} from "lightweight-charts";
import { lwcDefaults, chartColors } from "./chartTheme";

export interface ChartDataPoint {
  time: number; // timestamp in milliseconds
  value: number;
}

interface LightweightChartProps {
  data: ChartDataPoint[];
  height?: number;
  lineColor?: string;
  areaTopColor?: string;
  areaBottomColor?: string;
  showGrid?: boolean;
  formatValue?: (value: number) => string;
  formatTime?: (time: number) => string;
  onCrosshairMove?: (value: number | null, time: number | null) => void;
}

const LightweightChartComponent = ({
  data,
  height,
  lineColor = "#83e9ff",
  areaTopColor,
  areaBottomColor = "transparent",
  showGrid = true,
  formatValue,
  onCrosshairMove,
}: LightweightChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);

  // Convert milliseconds to seconds for lightweight-charts
  const formatData = useCallback((rawData: ChartDataPoint[]): AreaData<Time>[] => {
    return rawData
      .map((point) => ({
        time: Math.floor(point.time / 1000) as Time,
        value: point.value,
      }))
      .sort((a, b) => (a.time as number) - (b.time as number));
  }, []);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const container = chartContainerRef.current;

    // Get initial dimensions
    const initialWidth = container.clientWidth || 400;
    const initialHeight = height || container.clientHeight || 200;

    chartRef.current = createChart(container, {
      ...lwcDefaults,
      width: initialWidth,
      height: initialHeight,
      grid: {
        ...lwcDefaults.grid,
        horzLines: {
          ...(lwcDefaults.grid?.horzLines as object),
          visible: showGrid,
        },
      },
      timeScale: {
        ...lwcDefaults.timeScale,
        tickMarkFormatter: (time: Time) => {
          const date = new Date((time as number) * 1000);
          return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
        },
      },
    });

    // Create area series using v5 API
    const topColor = areaTopColor || `${lineColor}4D`; // 30% opacity

    seriesRef.current = chartRef.current.addSeries(AreaSeries, {
      lineColor,
      topColor,
      bottomColor: areaBottomColor,
      lineWidth: 2,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 4,
      crosshairMarkerBackgroundColor: lineColor,
      crosshairMarkerBorderColor: chartColors.labelBg,
      crosshairMarkerBorderWidth: 2,
      priceFormat: {
        type: "custom",
        formatter: formatValue || ((price: number) => price.toLocaleString()),
      },
    });

    // Handle crosshair move
    if (onCrosshairMove) {
      chartRef.current.subscribeCrosshairMove((param) => {
        if (!param.time || !param.seriesData.get(seriesRef.current!)) {
          onCrosshairMove(null, null);
          return;
        }
        const data = param.seriesData.get(seriesRef.current!) as AreaData<Time>;
        onCrosshairMove(data.value, (param.time as number) * 1000);
      });
    }

    // Resize observer for auto-sizing
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length === 0 || !chartRef.current) return;
      const { width, height: containerHeight } = entries[0].contentRect;
      if (width > 0 && containerHeight > 0) {
        chartRef.current.applyOptions({
          width,
          height: height || containerHeight
        });
      }
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      chartRef.current?.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showGrid]);

  // Update series data
  useEffect(() => {
    if (!seriesRef.current || !data.length) return;

    const formattedData = formatData(data);
    seriesRef.current.setData(formattedData);

    // Fit content
    chartRef.current?.timeScale().fitContent();
  }, [data, formatData]);

  // Update colors
  useEffect(() => {
    if (!seriesRef.current) return;

    const topColor = areaTopColor || `${lineColor}4D`;

    seriesRef.current.applyOptions({
      lineColor,
      topColor,
      bottomColor: areaBottomColor,
      crosshairMarkerBackgroundColor: lineColor,
    });
  }, [lineColor, areaTopColor, areaBottomColor]);

  // Update height if prop changes
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

export const LightweightChart = memo(LightweightChartComponent);
