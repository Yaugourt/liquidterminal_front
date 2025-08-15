"use client";

import { useEffect, useRef } from 'react';

interface TradingViewChartProps {
  symbol: string;
  className?: string;
}

declare global {
  interface Window {
    TradingView: {
      widget: new (config: Record<string, unknown>) => void;
    };
  }
}

export function TradingViewChart({ symbol, className }: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load TradingView script
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (window.TradingView && containerRef.current) {
        new window.TradingView.widget({
          autosize: true,
          symbol: `HYPERLIQUID:${symbol.replace('/', '')}`,
          interval: '15',
          timezone: 'Etc/UTC',
          theme: 'dark',
          style: '1',
          locale: 'en',
          toolbar_bg: '#051728',
          enable_publishing: false,
          hide_top_toolbar: false,
          hide_legend: true,
          save_image: false,
          container_id: containerRef.current.id,
          backgroundColor: '#051728',
          gridColor: '#1E3851',
          studies: [],
          overrides: {
            'paneProperties.background': '#051728',
            'paneProperties.vertGridProperties.color': '#1E3851',
            'paneProperties.horzGridProperties.color': '#1E3851',
            'symbolWatermarkProperties.transparency': 90,
            'scalesProperties.textColor': '#83E9FF',
            'mainSeriesProperties.candleStyle.upColor': '#4ADE80',
            'mainSeriesProperties.candleStyle.downColor': '#F87171',
            'mainSeriesProperties.candleStyle.borderUpColor': '#4ADE80',
            'mainSeriesProperties.candleStyle.borderDownColor': '#F87171',
            'mainSeriesProperties.candleStyle.wickUpColor': '#4ADE80',
            'mainSeriesProperties.candleStyle.wickDownColor': '#F87171'
          }
        });
      }
    };
    
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [symbol]);

  return (
    <div className={`w-full ${className}`}>
      <div 
        ref={containerRef}
        id={`tradingview_chart_${symbol.replace('/', '_')}`}
        className="h-[500px] w-full rounded-lg overflow-hidden bg-[#051728] border-2 border-[#83E9FF4D]"
      />
    </div>
  );
}
