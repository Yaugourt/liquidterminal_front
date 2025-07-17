"use client";

import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useChartFormat, useChartData, ChartPeriod } from '@/components/common/charts';
import { ChartDisplayProps } from "@/components/types/dashboard.types";
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
import { formatLargeNumber, formatNumber } from '@/lib/formatting';
import { useNumberFormat } from '@/store/number-format.store';
import { useState, useRef, useEffect } from 'react';

interface Props extends ChartDisplayProps {
  selectedCurrency?: "HYPE" | "USDC";
  onCurrencyChange?: (currency: "HYPE" | "USDC") => void;
  onPeriodChange: (period: ChartPeriod) => void;
  availablePeriods: ChartPeriod[];
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

export const ChartDisplay = ({ 
  data,
  isLoading,
  selectedFilter,
  selectedPeriod,
  chartHeight,
  selectedCurrency = "USDC",
  onCurrencyChange,
  onPeriodChange,
  availablePeriods,
  isAuctionTabActive = false,
  isPastAuctionTabActive = false
}: Props) => {
  const { format } = useNumberFormat();
  const { formatValue } = useChartFormat();
  
  // Utiliser directement la hauteur passée
  const adaptedHeight = chartHeight;
  
  const chartData = useChartData({
    data,
    period: selectedPeriod,
    getValue: (item: any) => item.value,
    getTimestamp: (item: any) => item.time
  });

  const getTitle = () => {
    switch (selectedFilter) {
      case "bridge":
        return "Bridge TVL Evolution";
      case "strict":
         return "Fees Evolution";
      default:
        return `Auction price evolution (${selectedCurrency})`;
    }
  };

  const formatOptions = {
    currency: 'USD',
    showCurrency: selectedFilter !== 'gas',
    minimumFractionDigits: 0,
    maximumFractionDigits: selectedFilter === 'gas' ? 0 : 2
  };

  const formatYAxisValue = (value: number) => {
    if (selectedFilter === 'bridge') {
      return formatLargeNumber(value, { prefix: '$', decimals: 2 });
    }
    if (selectedFilter === 'gas' && selectedCurrency === 'USDC') {
      return formatLargeNumber(value, { prefix: '$', decimals: 2 });
    }
    return formatNumber(value, format);
  };

  const getTooltipSuffix = () => {
    switch (selectedFilter) {
      case "bridge":
        return "";
      case "strict":
        return " Fees";
      case "gas":
        return "";
      default:
        return ` ${selectedCurrency}`;
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      let value = payload[0].value;
      let formattedValue;
      if (selectedFilter === 'bridge') {
        formattedValue = formatLargeNumber(value, { prefix: '$', decimals: 2 });
      } else if (selectedFilter === 'gas' && selectedCurrency === 'USDC') {
        formattedValue = formatLargeNumber(value, { prefix: '$', decimals: 2 });
      } else if (selectedFilter === 'gas') {
        formattedValue = formatNumber(value, format);
      } else {
        formattedValue = formatValue(value, formatOptions);
      }
      return (
        <div className="bg-[#051728] border border-[#83E9FF4D] p-2 rounded-md">
          <p className="text-white text-xs">
            {new Date(Number(label)).toLocaleDateString()}
          </p>
          <p className="text-[#83E9FF] font-medium">
            {formattedValue + getTooltipSuffix()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full bg-[#051728E5] border-2 border-[#83E9FF4D] hover:border-[#83E9FF80] transition-colors shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden rounded-lg" style={{ height: adaptedHeight }}>
      <div className="absolute top-2 left-3 sm:left-6 right-3 sm:right-6 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-sm text-white font-medium">
              {getTitle()}
            </h2>
            {selectedFilter !== "bridge" && onCurrencyChange && (
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
            )}
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