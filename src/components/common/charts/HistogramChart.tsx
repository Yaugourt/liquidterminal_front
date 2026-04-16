"use client";

import { useRef, useEffect, useCallback, memo } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  Time,
  HistogramSeries,
  HistogramData,
} from "lightweight-charts";
import { lwcDefaults, chartColors } from "./chartTheme";

export interface HistogramDataPoint {
  time: number;
  value: number;
  color?: string;
}

interface HistogramChartProps {
  data: HistogramDataPoint[];
  defaultColor?: string;
  formatValue?: (value: number) => string;
  onCrosshairMove?: (value: number | null, time: number | null) => void;
}

const HistogramChartComponent = ({
  data,
  defaultColor = chartColors.rose,
  formatValue,
  onCrosshairMove,
}: HistogramChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const timeMapRef = useRef<Map<number, number>>(new Map());

  const formatData = useCallback(
    (rawData: HistogramDataPoint[]): HistogramData<Time>[] => {
      const timeMap = new Map<number, number>();
      const formattedData = rawData
        .map((point) => {
          const timeInSeconds = Math.floor(point.time / 1000);
          timeMap.set(timeInSeconds, point.time);
          return {
            time: timeInSeconds as Time,
            value: point.value,
            color: point.color || defaultColor,
          };
        })
        .sort((a, b) => (a.time as number) - (b.time as number));

      timeMapRef.current = timeMap;
      return formattedData;
    },
    [defaultColor],
  );

  useEffect(() => {
    if (!chartContainerRef.current) return;
    const container = chartContainerRef.current;

    chartRef.current = createChart(container, {
      ...lwcDefaults,
      width: container.clientWidth || 400,
      height: container.clientHeight || 200,
      timeScale: {
        ...lwcDefaults.timeScale,
        tickMarkFormatter: (time: Time) => {
          const date = new Date((time as number) * 1000);
          return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          });
        },
      },
    });

    seriesRef.current = chartRef.current.addSeries(HistogramSeries, {
      color: defaultColor,
      priceFormat: {
        type: "custom",
        formatter: formatValue || ((price: number) => price.toLocaleString()),
      },
    });

    if (onCrosshairMove) {
      chartRef.current.subscribeCrosshairMove((param) => {
        if (!param.time || !param.seriesData.get(seriesRef.current!)) {
          onCrosshairMove(null, null);
          return;
        }
        const chartData = param.seriesData.get(
          seriesRef.current!,
        ) as HistogramData<Time>;
        const timeInSeconds = param.time as number;
        const originalTimeMs =
          timeMapRef.current.get(timeInSeconds) || timeInSeconds * 1000;
        onCrosshairMove(chartData.value, originalTimeMs);
      });
    }

    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length === 0 || !chartRef.current) return;
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) {
        chartRef.current.applyOptions({ width, height });
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
  }, []);

  useEffect(() => {
    if (!seriesRef.current || !data.length) return;
    const formattedData = formatData(data);
    seriesRef.current.setData(formattedData);
    chartRef.current?.timeScale().fitContent();
  }, [data, formatData]);

  return (
    <div
      ref={chartContainerRef}
      className="w-full h-full"
      style={{ minHeight: 200 }}
    />
  );
};

export const HistogramChart = memo(HistogramChartComponent);
