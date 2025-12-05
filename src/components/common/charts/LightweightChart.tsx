"use client";

import { useEffect, useRef, useCallback, memo } from "react";
import {
  createChart,
  ColorType,
  IChartApi,
  ISeriesApi,
  AreaData,
  Time,
  CrosshairMode,
  LineStyle,
  AreaSeries,
} from "lightweight-charts";

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
        scaleMargins: {
          top: 0.15,
          bottom: 0.1,
        },
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
      crosshairMarkerBorderColor: "#0B0E14",
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
