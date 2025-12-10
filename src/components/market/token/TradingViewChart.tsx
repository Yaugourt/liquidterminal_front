"use client";

import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickData, CandlestickSeries, Time } from 'lightweight-charts';
import { useTokenCandles, marketIndexToCoinId } from '@/services/market/token';
import { TokenCandle } from '@/services/market/token/types';
import { GlassPanel } from "@/components/ui/glass-panel";

interface TradingViewChartProps {
  symbol: string;
  marketIndex?: number;
  tokenName?: string;
  className?: string;
}

// Helper function to convert TokenCandle to CandlestickData
const convertToCandlestickData = (candle: TokenCandle): CandlestickData<Time> => {
  const timeInSeconds = Math.floor(candle.t / 1000) as Time;

  return {
    time: timeInSeconds,
    open: parseFloat(candle.o),
    high: parseFloat(candle.h),
    low: parseFloat(candle.l),
    close: parseFloat(candle.c)
  };
};

type TimeframeType = "1m" | "3m" | "5m" | "15m" | "30m" | "1h" | "2h" | "4h" | "8h" | "12h" | "1d" | "3d" | "1w" | "1M";

const TIMEFRAMES: { label: string; value: TimeframeType }[] = [
  { label: '1m', value: '1m' },
  { label: '3m', value: '3m' },
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '30m', value: '30m' },
  { label: '1h', value: '1h' },
  { label: '2h', value: '2h' },
  { label: '4h', value: '4h' },
  { label: '8h', value: '8h' },
  { label: '12h', value: '12h' },
  { label: '1d', value: '1d' },
  { label: '3d', value: '3d' },
  { label: '1w', value: '1w' },
  { label: '1M', value: '1M' }
];

export function TradingViewChart({ symbol, marketIndex, tokenName, className }: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  // State for timeframe selection
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeType>('1d');

  // Convert marketIndex to coinId (like @107)
  const coinId = marketIndex !== undefined ? marketIndexToCoinId(marketIndex, tokenName) : null;

  // Fetch candle data using our hook with coinId
  const { candles, isLoading, error } = useTokenCandles({
    coin: coinId,
    interval: selectedTimeframe
  });

  // Initialize chart
  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#525252',
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
        fontSize: 10,
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: 'rgba(255, 255, 255, 0.1)',
          width: 1,
          style: 2,
          labelBackgroundColor: '#0B0E14',
        },
        horzLine: {
          color: 'rgba(255, 255, 255, 0.1)',
          width: 1,
          style: 2,
          labelBackgroundColor: '#0B0E14',
        },
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.05)',
        textColor: '#FFFFFF',
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.05)',
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 24,
        barSpacing: 10,
        fixLeftEdge: true,
        lockVisibleTimeRangeOnResize: true,
        rightBarStaysOnScroll: true,
        minBarSpacing: 1,
      },
    });

    // Add candlestick series
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#4ADE80',
      downColor: '#F87171',
      borderDownColor: '#F87171',
      borderUpColor: '#4ADE80',
      wickDownColor: '#F87171',
      wickUpColor: '#4ADE80',
    });

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    // Auto-resize chart
    const handleResize = () => {
      if (containerRef.current && chart) {
        chart.applyOptions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    // ResizeObserver pour détecter les changements de taille du conteneur
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [symbol]);

  // Force resize when component mounts to ensure chart takes full width
  useEffect(() => {
    if (chartRef.current && containerRef.current) {
      setTimeout(() => {
        chartRef.current?.applyOptions({
          width: containerRef.current?.clientWidth || 0,
          height: containerRef.current?.clientHeight || 0,
        });
      }, 100);
    }
  }, []);

  // Update chart data when candles change
  useEffect(() => {
    if (!seriesRef.current || !candles || candles.length === 0) {
      return;
    }

    try {
      const chartData = candles
        .map(convertToCandlestickData)
        .sort((a, b) => (a.time as number) - (b.time as number));

      seriesRef.current.setData(chartData);

      // Set default visible range to show 131 candles
      if (chartRef.current) {
        const timeScale = chartRef.current.timeScale();

        // Wait a bit for the data to be processed, then set the range
        setTimeout(() => {
          if (chartData.length > 0) {
            const totalCandles = chartData.length;
            const startIndex = Math.max(0, totalCandles - 131);
            const endIndex = totalCandles - 1;

            timeScale.setVisibleLogicalRange({
              from: startIndex,
              to: endIndex,
            });
          }
        }, 100);
      }
    } catch {
    }
  }, [candles]);

  return (
    <GlassPanel className={`w-full h-full flex flex-col relative overflow-hidden ${className || ''}`}>
      {/* Timeframe Selector - Range Switcher */}
      {/* Desktop version - Hidden on small screens */}
      <div className="absolute top-4 left-4 z-20 hidden min-[620px]:flex gap-1 bg-[#0A0D12] rounded-lg p-1 border border-white/5">
        {TIMEFRAMES.map((timeframe) => (
          <button
            key={timeframe.value}
            onClick={() => setSelectedTimeframe(timeframe.value)}
            className={`px-2 py-1 text-xs font-medium rounded transition-all duration-200 ${selectedTimeframe === timeframe.value
              ? 'bg-[#83E9FF] text-[#051728] shadow-sm font-bold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
          >
            {timeframe.label}
          </button>
        ))}
      </div>

      {/* Mobile version - Dropdown for screens < 620px */}
      <div className="absolute top-4 left-4 z-20 max-[619px]:block hidden">
        <select
          value={selectedTimeframe}
          onChange={(e) => setSelectedTimeframe(e.target.value as TimeframeType)}
          className="bg-[#0A0D12] border border-white/5 rounded-lg px-3 py-2 text-xs font-medium text-zinc-400 focus:outline-none focus:border-[#83E9FF] focus:bg-[#0A0D12]"
        >
          {TIMEFRAMES.map((timeframe) => (
            <option
              key={timeframe.value}
              value={timeframe.value}
              className="bg-[#0A0D12] text-zinc-400"
            >
              {timeframe.label}
            </option>
          ))}
        </select>
      </div>

      {(isLoading || (!candles || candles.length === 0)) && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#151A25]/60 backdrop-blur-md z-10">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-2 border-[#83E9FF] border-t-transparent rounded-full animate-spin mb-2"></div>
            <span className="text-zinc-400 text-sm">
              {isLoading ? 'Loading chart data...' : 'No data available'}
            </span>
            {error && (
              <span className="text-rose-400 text-xs mt-1">Error: {error}</span>
            )}
          </div>
        </div>
      )}
      <div
        ref={containerRef}
        className="w-full flex-1 min-h-0 rounded-lg overflow-hidden"
      />
    </GlassPanel>
  );
}
