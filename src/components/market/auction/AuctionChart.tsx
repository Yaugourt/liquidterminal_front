"use client";

import { Card } from "@/components/ui/card";
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
import { Button } from "@/components/ui/button";
import { formatLargeNumber, formatNumber } from '@/lib/numberFormatting';
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
      className="relative flex items-center bg-[#051728] rounded-md p-0.5 border border-[#83E9FF4D]"
    >
      <div
        className="absolute top-1 bottom-1 bg-[#83E9FF] rounded-sm transition-all duration-300 ease-out opacity-80"
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
          className="relative z-10 px-2 py-1 text-xs font-medium text-white transition-colors duration-200 whitespace-nowrap hover:text-[#83E9FF]"
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
      <Card 
        className="bg-[#051728E5] border-2 border-[#83E9FF4D] hover:border-[#83E9FF80] transition-colors shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden rounded-lg"
        style={{ height: chartHeight }}
      >
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center text-center px-4">
            <Database className="w-12 h-12 mb-4 text-[#83E9FF4D]" />
            <p className="text-white text-lg mb-2">Coming Soon</p>
            <p className="text-[#FFFFFF80] text-sm">Perpetual auctions chart will be available soon.</p>
          </div>
        </div>
      </Card>
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
        <div className="bg-[#051728] border border-[#83E9FF4D] p-2 rounded-md">
          <p className="text-white text-xs">
            {new Date(Number(label)).toLocaleDateString()}
          </p>
          <p className="text-[#83E9FF] font-medium">
            {formattedValue} {selectedCurrency}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full bg-[#051728E5] border-2 border-[#83E9FF4D] hover:border-[#83E9FF80] transition-colors shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden rounded-lg" style={{ height: chartHeight }}>
      <div className="absolute top-2 left-3 sm:left-6 right-3 sm:right-6 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-sm text-white font-medium">
              Auction Price Evolution ({selectedCurrency})
            </h2>
            <div className="flex items-center bg-[#051728] rounded-md p-0.5">
              <Button
                variant={selectedCurrency === "USDC" ? "default" : "ghost"}
                size="sm"
                onClick={() => onCurrencyChange("USDC")}
                className={`text-[10px] h-5 px-2 transition-colors ${
                  selectedCurrency === "USDC"
                    ? "bg-[#1692AD] text-white hover:bg-[#127d95]"
                    : "text-[#f9e370] hover:text-white"
                }`}
              >
                USDC
              </Button>
              <Button
                variant={selectedCurrency === "HYPE" ? "default" : "ghost"}
                size="sm"
                onClick={() => onCurrencyChange("HYPE")}
                className={`text-[10px] h-5 px-2 transition-colors ${
                  selectedCurrency === "HYPE"
                    ? "bg-[#1692AD] text-white hover:bg-[#127d95]"
                    : "text-[#f9e370] hover:text-white"
                }`}
              >
                HYPE
              </Button>
            </div>
          </div>
          
          <AnimatedPeriodSelector
            selectedPeriod={selectedPeriod}
            onPeriodChange={onPeriodChange}
            availablePeriods={availablePeriods}
          />
        </div>
      </div>

      <div className="absolute inset-0 p-4 pt-12">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-[#83E9FF]" />
          </div>
        ) : chartData.data.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-[#FFFFFF80]">Aucune donnée disponible</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#83E9FF1A" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(time) => {
                  const date = new Date(time);
                  if (selectedPeriod === "7d") {
                    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  }
                  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
                }}
                stroke="#FFFFFF99"
                fontSize={12}
              />
              <YAxis
                stroke="#FFFFFF99"
                fontSize={12}
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
    </Card>
  );
};
