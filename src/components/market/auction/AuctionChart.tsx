"use client";

import { Loader2, Database } from "lucide-react";
import { useChartData, ChartPeriod } from '@/components/common/charts';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatLargeNumber, formatNumber } from '@/lib/formatters/numberFormatting';
import { useNumberFormat } from '@/store/number-format.store';
import { useState, useRef, useEffect } from 'react';

// Types pour les données d'enchère
interface AuctionDataPoint {
  time: number;
  value: number;
}

// Types pour le tooltip
interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
  }>;
  label?: number;
}

interface AuctionChartProps {
  data: AuctionDataPoint[];
  isLoading: boolean;
  selectedCurrency: "HYPE" | "USDC";
  onCurrencyChange: (currency: "HYPE" | "USDC") => void;
  selectedPeriod: ChartPeriod;
  onPeriodChange: (period: ChartPeriod) => void;
  availablePeriods: ChartPeriod[];
  chartHeight: number;
  marketType: "spot" | "perp";
}

const AnimatedPeriodSelector = ({ 
  selectedPeriod, 
  onPeriodChange, 
  availablePeriods 
}: { 
  selectedPeriod: ChartPeriod; 
  onPeriodChange: (period: ChartPeriod) => void; 
  availablePeriods: ChartPeriod[]; 
}) => {
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  useEffect(() => {
    const selectedButton = buttonRefs.current[selectedPeriod];
    if (selectedButton && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const buttonRect = selectedButton.getBoundingClientRect();
      
      setIndicatorStyle({
        left: buttonRect.left - containerRect.left,
        width: buttonRect.width,
      });
    }
  }, [selectedPeriod]);

  return (
    <div 
      ref={containerRef}
      className="relative flex bg-brand-dark rounded-lg p-1 border border-white/5"
    >
      <div
        className="absolute top-1 bottom-1 bg-brand-accent rounded-md transition-all duration-300 ease-out"
        style={{
          left: indicatorStyle.left + 2,
          width: indicatorStyle.width - 4,
        }}
      />
      {availablePeriods.map((period) => (
        <button
          key={period}
          ref={(el) => { 
            buttonRefs.current[period] = el; 
          }}
          onClick={() => onPeriodChange(period)}
          className={`relative z-10 px-2 py-1 text-xs font-medium transition-colors duration-200 whitespace-nowrap rounded-md ${
            selectedPeriod === period ? 'text-brand-tertiary font-bold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          {period}
        </button>
      ))}
    </div>
  );
};

export const AuctionChart = ({ 
  data,
  isLoading,
  selectedCurrency,
  onCurrencyChange,
  selectedPeriod,
  onPeriodChange,
  availablePeriods,
  chartHeight,
  marketType
}: AuctionChartProps) => {
  const { format } = useNumberFormat();
  
  // Toujours appeler les hooks en premier
  const chartData = useChartData({
    data,
    getValue: (item: AuctionDataPoint) => item.value,
    getTimestamp: (item: AuctionDataPoint) => item.time
  });
  
  // Si c'est perp, afficher Coming Soon
  if (marketType === "perp") {
    return (
      <div 
        className="bg-brand-secondary/60 backdrop-blur-md border border-white/5 rounded-2xl hover:border-white/10 transition-all shadow-xl shadow-black/20 overflow-hidden"
        style={{ height: chartHeight }}
      >
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center text-center px-4">
            <Database className="w-10 h-10 mb-3 text-zinc-600" />
            <p className="text-zinc-400 text-sm mb-1">Coming Soon</p>
            <p className="text-zinc-600 text-xs">Perpetual auctions chart will be available soon.</p>
          </div>
        </div>
      </div>
    );
  }

  const formatYAxisValue = (value: number) => {
    if (selectedCurrency === 'USDC') {
      return formatLargeNumber(value, { prefix: '$', decimals: 2 });
    }
    return formatNumber(value, format);
  };

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const formattedValue = selectedCurrency === 'USDC' 
        ? formatLargeNumber(value, { prefix: '$', decimals: 2 })
        : formatNumber(value, format);
      return (
        <div className="bg-brand-secondary border border-white/10 p-2 rounded-lg shadow-lg">
          <p className="text-zinc-400 text-xs">
            {new Date(Number(label)).toLocaleDateString()}
          </p>
          <p className="text-white font-bold">
            {formattedValue} {selectedCurrency}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-brand-secondary/60 backdrop-blur-md border border-white/5 rounded-2xl hover:border-white/10 transition-all shadow-xl shadow-black/20 overflow-hidden relative" style={{ height: chartHeight }}>
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
              Auction Price ({selectedCurrency})
            </h2>
            <div className="flex bg-brand-dark rounded-lg p-1 border border-white/5">
              <button
                onClick={() => onCurrencyChange("USDC")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                  selectedCurrency === "USDC"
                    ? "bg-brand-accent text-brand-tertiary shadow-sm font-bold"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                }`}
              >
                USDC
              </button>
              <button
                onClick={() => onCurrencyChange("HYPE")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                  selectedCurrency === "HYPE"
                    ? "bg-brand-accent text-brand-tertiary shadow-sm font-bold"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                }`}
              >
                HYPE
              </button>
            </div>
          </div>
          
          <AnimatedPeriodSelector
            selectedPeriod={selectedPeriod}
            onPeriodChange={onPeriodChange}
            availablePeriods={availablePeriods}
          />
        </div>
      </div>

      <div className="absolute inset-0 p-4 pt-16">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-brand-accent" />
          </div>
        ) : chartData.data.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-zinc-500">No data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(time) => {
                  const date = new Date(time);
                  if (selectedPeriod === "7d") {
                    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  }
                  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
                }}
                stroke="#71717a"
                fontSize={10}
              />
              <YAxis
                stroke="#71717a"
                fontSize={10}
                tickFormatter={formatYAxisValue}
                domain={['dataMin', 'dataMax']}
                padding={{ top: 20, bottom: 20 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#f9e370"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#f9e370" }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
