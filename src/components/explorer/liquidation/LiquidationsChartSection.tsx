"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useLiquidationsContext, CHART_PERIOD_OPTIONS } from "./LiquidationsContext";
import { useDateFormat } from '@/store/date-format.store';
import { formatDateTime } from '@/lib/formatters/dateFormatting';
import {
  createChart,
  ColorType,
  IChartApi,
  Time,
  CrosshairMode,
  LineStyle,
  HistogramSeries,
  ISeriesApi,
  HistogramData,
} from "lightweight-charts";

type LiquidationChartType = "volume" | "count";

interface ChartDataPoint {
  time: number;
  value: number;
  color?: string;
}

// Bar Chart Component using lightweight-charts Histogram
const LiquidationsBarChart = ({
  data,
  formatValue,
  onCrosshairMove,
}: {
  data: ChartDataPoint[];
  formatValue?: (value: number) => string;
  onCrosshairMove?: (value: number | null, time: number | null) => void;
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  
  // Map pour retrouver le temps original (ms) depuis le temps chart (seconds)
  const timeMapRef = useRef<Map<number, number>>(new Map());

  // Convert milliseconds to seconds for lightweight-charts
  const formatData = useCallback((rawData: ChartDataPoint[]): HistogramData<Time>[] => {
    const timeMap = new Map<number, number>();
    const formattedData = rawData
      .map((point) => {
        const timeInSeconds = Math.floor(point.time / 1000);
        timeMap.set(timeInSeconds, point.time); // Garder le mapping
        return {
          time: timeInSeconds as Time,
          value: point.value,
          color: point.color || "#f43f5e",
        };
      })
      .sort((a, b) => (a.time as number) - (b.time as number));
    
    timeMapRef.current = timeMap;
    return formattedData;
  }, []);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const container = chartContainerRef.current;
    const initialWidth = container.clientWidth || 400;
    const initialHeight = container.clientHeight || 200;

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
          visible: true,
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
          return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          });
        },
      },
    });

    // Create histogram series
    seriesRef.current = chartRef.current.addSeries(HistogramSeries, {
      color: "#f43f5e",
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
        const chartData = param.seriesData.get(seriesRef.current!) as HistogramData<Time>;
        const timeInSeconds = param.time as number;
        // Utiliser le mapping pour retrouver le temps original en ms
        const originalTimeMs = timeMapRef.current.get(timeInSeconds) || timeInSeconds * 1000;
        onCrosshairMove(chartData.value, originalTimeMs);
      });
    }

    // Resize observer
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

  // Update series data
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

export const LiquidationsChartSection = () => {
  const [selectedChart, setSelectedChart] = useState<LiquidationChartType>("volume");
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  
  const { format: dateFormat } = useDateFormat();
  
  // Utilise les données du chart depuis le Context (période indépendante)
  const { 
    chartBuckets, 
    chartLoading, 
    chartPeriod,
    setChartPeriod
  } = useLiquidationsContext();

  // Transformer les buckets en données de chart
  const chartData = useMemo(() => {
    if (!chartBuckets.length) return [];

    return chartBuckets.map((bucket) => {
      // Couleur basée sur la direction dominante
      const longRatio = bucket.totalVolume > 0 ? bucket.longVolume / bucket.totalVolume : 0.5;
      const color = longRatio > 0.5 ? "#10b981" : "#f43f5e"; // emerald for longs, rose for shorts
      const value = selectedChart === 'volume' ? bucket.totalVolume : bucket.liquidationsCount;
      
      return {
        time: bucket.timestampMs,
        value: isNaN(value) ? 0 : value,
        color,
      };
    }).filter(item => !isNaN(item.time) && !isNaN(item.value));
  }, [chartBuckets, selectedChart]);

  // Calculer le total depuis les buckets
  const totalFromBuckets = useMemo(() => {
    if (!chartBuckets.length) return { volume: 0, count: 0 };
    return chartBuckets.reduce((acc, bucket) => ({
      volume: acc.volume + bucket.totalVolume,
      count: acc.count + bucket.liquidationsCount
    }), { volume: 0, count: 0 });
  }, [chartBuckets]);

  const formatYAxisValue = useCallback((value: number) => {
    if (selectedChart === 'count') {
      return value.toFixed(0);
    }
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(0)}`;
  }, [selectedChart]);

  const handleCrosshairMove = useCallback((value: number | null, time: number | null) => {
    setHoverValue(value);
    setHoverTime(time);
  }, []);

  // Get total value for display
  const totalValue = selectedChart === 'volume' ? totalFromBuckets.volume : totalFromBuckets.count;
  const displayValue = hoverValue ?? totalValue;

  const chartTabs: { key: LiquidationChartType; label: string }[] = [
    { key: 'volume', label: 'Volume' },
    { key: 'count', label: 'Count' }
  ];

  return (
    <div className="w-full h-full flex flex-col p-4">
      {/* Header */}
      <div className="flex-shrink-0 pb-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Titre */}
            <h2 className="text-xs text-text-secondary font-semibold uppercase tracking-wider">
              Liquidations
            </h2>

            {/* Volume/Count Tabs */}
            <div className="flex bg-brand-dark rounded-lg p-1 border border-border-subtle">
              {chartTabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedChart(tab.key)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${selectedChart === tab.key
                    ? 'bg-brand-accent text-brand-tertiary shadow-sm font-bold'
                    : 'text-text-secondary hover:text-zinc-200 hover:bg-white/5'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Value Display */}
            {displayValue !== null && (
              <div className="flex flex-col">
                <span className="text-lg font-bold text-white tracking-tight">
                  {hoverValue !== null ? formatYAxisValue(hoverValue) : (
                    selectedChart === 'volume' 
                      ? formatYAxisValue(displayValue)
                      : `${displayValue} liquidations`
                  )}
                </span>
                {hoverTime && (
                  <span className="text-label text-text-muted">
                    {formatDateTime(new Date(hoverTime), dateFormat)}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Period Selector (right side) */}
          <div className="flex bg-brand-dark rounded-lg p-0.5 border border-border-subtle">
            {CHART_PERIOD_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => setChartPeriod(option.value)}
                className={`px-2 py-1 rounded-md text-label transition-all ${
                  chartPeriod === option.value
                    ? 'bg-rose-500/20 text-rose-400 font-bold'
                    : 'text-text-secondary hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0">
        {chartLoading ? (
          <div className="flex justify-center items-center h-full min-h-[200px]">
            <Loader2 className="h-6 w-6 animate-spin text-brand-accent" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex justify-center items-center h-full min-h-[200px]">
            <p className="text-text-muted">No liquidation data available</p>
          </div>
        ) : (
          <LiquidationsBarChart
            data={chartData}
            formatValue={formatYAxisValue}
            onCrosshairMove={handleCrosshairMove}
          />
        )}
      </div>
    </div>
  );
};
