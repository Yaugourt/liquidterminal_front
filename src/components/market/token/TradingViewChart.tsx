"use client";

import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickData, CandlestickSeries, Time } from 'lightweight-charts';
import { useTokenCandles, useTokenWebSocket, marketIndexToCoinId } from '@/services/market/token';
import { TokenCandle } from '@/services/market/token/types';
import { GlassPanel } from "@/components/ui/glass-panel";

interface TradingViewChartProps {
  symbol: string;
  marketIndex?: number;
  tokenName?: string;
  className?: string;
  /** Direct coinId for perpetual WebSocket (e.g., "BTC") */
  coinId?: string;
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

export function TradingViewChart({ marketIndex, tokenName, className, coinId: directCoinId }: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  // State for timeframe selection with persistence
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeType>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tv_interval');
      if (saved && TIMEFRAMES.some(t => t.value === saved)) {
        return saved as TimeframeType;
      }
    }
    return '1d';
  });

  // Persist timeframe change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tv_interval', selectedTimeframe);
    }
  }, [selectedTimeframe]);

  // Convert marketIndex to coinId, or use direct coinId for perpetuals
  const coinId = directCoinId || (marketIndex !== undefined ? marketIndexToCoinId(marketIndex, tokenName) : null);

  // Fetch candle data using our hook with coinId
  const { candles, isLoading, error } = useTokenCandles({
    coin: coinId,
    interval: selectedTimeframe
  });

  // WebSocket for real-time updates
  const { price: currentPrice } = useTokenWebSocket(coinId || '');

  // Ref to keep track of the latest candle for real-time updates
  const lastCandleRef = useRef<CandlestickData<Time> | null>(null);

  // Helper to get interval in seconds
  const getIntervalSeconds = (interval: TimeframeType): number => {
    const value = parseInt(interval);
    const unit = interval.slice(-1);
    switch (unit) {
      case 'm': return value * 60;
      case 'h': return value * 3600;
      case 'd': return value * 86400;
      case 'w': return value * 604800;
      case 'M': return value * 2592000;
      default: return 86400;
    }
  };

  // Initialize chart
  useEffect(() => {
    if (!containerRef.current) return;

    // Only create chart if it doesn't exist
    if (!chartRef.current) {
      const chart = createChart(containerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: 'transparent' },
          textColor: '#A1A1AA', // zinc-400
          fontFamily: "var(--font-inter), Inter, sans-serif",
          fontSize: 10,
        },
        grid: {
          vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
          horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
        },
        crosshair: {
          mode: 1,
          vertLine: {
            color: 'rgba(131, 233, 255, 0.3)', // brand-accent with opacity
            width: 1,
            style: 2,
            labelBackgroundColor: '#0B0E14', // brand-main
          },
          horzLine: {
            color: 'rgba(131, 233, 255, 0.3)', // brand-accent with opacity
            width: 1,
            style: 2,
            labelBackgroundColor: '#0B0E14', // brand-main
          },
        },
        rightPriceScale: {
          borderColor: 'rgba(255, 255, 255, 0.05)',
          textColor: '#A1A1AA', // zinc-400
        },
        timeScale: {
          borderColor: 'rgba(255, 255, 255, 0.05)',
          timeVisible: true,
          secondsVisible: false,
          rightOffset: 12,
          barSpacing: 10,
          fixLeftEdge: false,
          lockVisibleTimeRangeOnResize: true,
          rightBarStaysOnScroll: true,
          minBarSpacing: 1,
        },
      });

      // Add candlestick series
      const candlestickSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#00ff88', // brand-success
        downColor: '#ef4444', // red-500
        borderDownColor: '#ef4444',
        borderUpColor: '#00ff88',
        wickDownColor: '#ef4444',
        wickUpColor: '#00ff88',
      });

      chartRef.current = chart;
      seriesRef.current = candlestickSeries;

      // Handle resize
      const resizeObserver = new ResizeObserver((entries) => {
        if (entries.length === 0 || !entries[0].contentRect) return;
        const { width, height } = entries[0].contentRect;
        chart.applyOptions({ width, height });
      });

      resizeObserver.observe(containerRef.current);

      return () => {
        resizeObserver.disconnect();
        chart.remove();
        chartRef.current = null;
        seriesRef.current = null;
      };
    }
  }, []);

  // Update chart data when historical candles change
  useEffect(() => {
    if (!seriesRef.current || !candles || candles.length === 0) {
      return;
    }

    try {
      const chartData = candles
        .map(convertToCandlestickData)
        .sort((a, b) => (a.time as number) - (b.time as number));

      seriesRef.current.setData(chartData);

      // Initialize lastCandleRef with the latest available candle
      if (chartData.length > 0) {
        lastCandleRef.current = chartData[chartData.length - 1];
      }
    } catch (e) {
      console.error("Error updating chart data:", e);
    }
  }, [candles]);

  // Real-time updates
  useEffect(() => {
    if (!currentPrice || !seriesRef.current || !lastCandleRef.current || !coinId) return;

    const currentTime = Math.floor(Date.now() / 1000) as Time;
    const intervalSeconds = getIntervalSeconds(selectedTimeframe);

    // Calculate the start time of the current candle interval
    // For 1d (86400s), it should be aligned to 00:00 UTC usually, but simpler floor matches:
    const candleTime = (Math.floor((currentTime as number) / intervalSeconds) * intervalSeconds) as Time;

    const lastCandle = lastCandleRef.current;

    let newCandle: CandlestickData<Time>;

    // Ensure strict number comparison for timestamps
    const lastTime = lastCandle.time as number;
    const currentTimeStep = candleTime as number;

    if (currentTimeStep === lastTime) {
      // Update existing candle
      newCandle = {
        ...lastCandle,
        high: Math.max(lastCandle.high, currentPrice),
        low: Math.min(lastCandle.low, currentPrice),
        close: currentPrice
      };
    } else if (currentTimeStep > lastTime) {
      // Create new candle
      newCandle = {
        time: candleTime,
        open: lastCandle.close, // Or currentPrice if we want to show gap
        high: currentPrice,
        low: currentPrice,
        close: currentPrice
      };
    } else {
      // Received old data or weird timing, ignore
      return;
    }

    try {
      seriesRef.current.update(newCandle);
      lastCandleRef.current = newCandle;
    } catch (e) {
      console.error("Error updating real-time candle:", e);
    }

  }, [currentPrice, selectedTimeframe, coinId]);

  return (
    <GlassPanel className={`w-full h-full flex flex-col relative overflow-hidden ${className || ''}`}>
      {/* Timeframe Selector - Range Switcher */}
      {/* Desktop version - Hidden on small screens */}
      <div className="absolute top-4 left-4 z-20 hidden min-[620px]:flex gap-1 bg-brand-dark/90 backdrop-blur-sm rounded-lg p-1 border border-border-subtle">
        {TIMEFRAMES.map((timeframe) => (
          <button
            key={timeframe.value}
            onClick={() => setSelectedTimeframe(timeframe.value)}
            className={`px-2 py-1 text-xs font-medium rounded transition-all duration-200 ${selectedTimeframe === timeframe.value
              ? 'bg-brand-accent text-brand-tertiary shadow-sm font-bold'
              : 'text-text-secondary hover:text-zinc-200 hover:bg-white/5'
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
          className="bg-brand-dark border border-border-subtle rounded-lg px-3 py-2 text-xs font-medium text-text-secondary focus:outline-none focus:border-brand-accent focus:bg-brand-dark"
        >
          {TIMEFRAMES.map((timeframe) => (
            <option
              key={timeframe.value}
              value={timeframe.value}
              className="bg-brand-dark text-text-secondary"
            >
              {timeframe.label}
            </option>
          ))}
        </select>
      </div>

      {(isLoading || (!candles || candles.length === 0)) && (
        <div className="absolute inset-0 flex items-center justify-center bg-brand-secondary/60 backdrop-blur-md z-10">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-2 border-brand-accent border-t-transparent rounded-full animate-spin mb-2"></div>
            <span className="text-text-secondary text-sm">
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
