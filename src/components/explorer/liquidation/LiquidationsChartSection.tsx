"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useLiquidationsContext } from "./LiquidationsContext";
import { useDateFormat } from '@/store/date-format.store';
import { formatDate } from '@/lib/formatters/dateFormatting';
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

  // Convert milliseconds to seconds for lightweight-charts
  const formatData = useCallback((rawData: ChartDataPoint[]): HistogramData<Time>[] => {
    return rawData
      .map((point) => ({
        time: Math.floor(point.time / 1000) as Time,
        value: point.value,
        color: point.color || "#f43f5e",
      }))
      .sort((a, b) => (a.time as number) - (b.time as number));
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
        const data = param.seriesData.get(seriesRef.current!) as HistogramData<Time>;
        onCrosshairMove(data.value, (param.time as number) * 1000);
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
  
  // Utilise les données du Context
  const { liquidations, isLoading, error } = useLiquidationsContext();

  // Aggregate liquidations by 5-minute intervals
  const chartData = useMemo(() => {
    if (!liquidations.length) return [];

    const intervalMs = 5 * 60 * 1000; // 5 minutes
    const buckets: Record<number, { volume: number; count: number; longVolume: number; shortVolume: number }> = {};

    liquidations.forEach((liq) => {
      // Skip invalid data
      if (!liq.time_ms || isNaN(liq.time_ms) || isNaN(liq.notional_total)) return;
      
      const bucketTime = Math.floor(liq.time_ms / intervalMs) * intervalMs;
      if (!buckets[bucketTime]) {
        buckets[bucketTime] = { volume: 0, count: 0, longVolume: 0, shortVolume: 0 };
      }
      buckets[bucketTime].volume += liq.notional_total || 0;
      buckets[bucketTime].count += 1;
      if (liq.liq_dir === 'Long') {
        buckets[bucketTime].longVolume += liq.notional_total || 0;
      } else {
        buckets[bucketTime].shortVolume += liq.notional_total || 0;
      }
    });

    return Object.entries(buckets)
      .map(([time, data]) => {
        // Color based on dominant direction: green if more longs, red if more shorts
        const longRatio = data.volume > 0 ? data.longVolume / data.volume : 0.5;
        const color = longRatio > 0.5 ? "#10b981" : "#f43f5e"; // emerald for longs, rose for shorts
        const value = selectedChart === 'volume' ? data.volume : data.count;
        
        return {
          time: parseInt(time),
          value: isNaN(value) ? 0 : value,
          color,
        };
      })
      .filter(item => !isNaN(item.time) && !isNaN(item.value))
      .sort((a, b) => a.time - b.time);
  }, [liquidations, selectedChart]);

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

  // Get latest value for display
  const latestValue = useMemo(() => {
    if (chartData.length === 0) return null;
    return chartData.reduce((sum, point) => sum + point.value, 0);
  }, [chartData]);

  const displayValue = hoverValue ?? latestValue;

  const chartTabs: { key: LiquidationChartType; label: string }[] = [
    { key: 'volume', label: 'Volume' },
    { key: 'count', label: 'Count' }
  ];

  if (error) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex-1 flex items-center justify-center min-h-[300px]">
          <div className="flex items-center gap-2 text-rose-400">
            <span className="text-sm">Failed to load liquidations chart</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col p-4">
      {/* Header */}
      <div className="flex-shrink-0 pb-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Titre */}
            <h2 className="text-xs text-text-secondary font-semibold uppercase tracking-wider">
              Liquidations (2h)
            </h2>

            {/* Tabs */}
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
                      : `${liquidations.length} liquidations`
                  )}
                </span>
                {hoverTime && (
                  <span className="text-[10px] text-text-muted">
                    {formatDate(new Date(hoverTime), dateFormat)}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0">
        {isLoading ? (
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
