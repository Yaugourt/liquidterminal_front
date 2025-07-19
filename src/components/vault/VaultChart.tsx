"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useVaultDetails } from "@/services/vault/hooks/useVaultDetails";
import { VaultChartTimeframe } from "@/services/vault/types";
import { useChartPeriod, useChartData } from '@/components/common/charts';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatLargeNumber } from '@/lib/formatting';
import { useNumberFormat } from '@/store/number-format.store';
import { useDateFormat } from '@/store/date-format.store';
import { formatDate } from '@/lib/date-formatting';

interface VaultChartProps {
  vaultAddress: string;
  className?: string;
}

type ChartType = 'accountValue' | 'pnl';

/**
 * Composant de chart pour afficher l'historique d'un vault avec tabs
 */
export const VaultChart = ({ vaultAddress, className = "" }: VaultChartProps) => {
  const { format } = useNumberFormat();
  const { format: dateFormat } = useDateFormat();
  const [selectedChart, setSelectedChart] = useState<ChartType>('accountValue');
  const [selectedTimeframe, setSelectedTimeframe] = useState<VaultChartTimeframe>('day');
  
  const { 
    chartData, 
    isLoading, 
    error 
  } = useVaultDetails(vaultAddress);

  // Transformer les données selon le chart sélectionné
  const transformedData = chartData.map(item => ({
    timestamp: item.timestamp,
    value: selectedChart === 'accountValue' ? item.accountValue : item.pnl,
    date: item.date,
    accountValue: item.accountValue,
    pnl: item.pnl
  }));

  // Filtrer les données selon le timeframe (simulation basée sur les données disponibles)
  const filteredData = transformedData; // Pour l'instant on utilise toutes les données

  // Tabs pour sélectionner le type de chart
  const chartTabs: { key: ChartType; label: string }[] = [
    { key: 'accountValue', label: 'Account Value' },
    { key: 'pnl', label: 'PnL' }
  ];

  // Options de timeframe
  const timeframeOptions: { value: VaultChartTimeframe; label: string }[] = [
    { value: 'day', label: '1D' },
    { value: 'week', label: '1W' },
    { value: 'month', label: '1M' },
    { value: 'allTime', label: 'All' }
  ];

  const getTitle = () => {
    return selectedChart === 'accountValue' ? 'Account Value Evolution' : 'PnL Evolution';
  };

  const getColor = () => {
    return selectedChart === 'accountValue' ? '#83E9FF' : '#f9e370';
  };

  const formatYAxisValue = (value: number) => {
    return formatLargeNumber(value, { prefix: '$', decimals: 2 });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const value = payload[0].value;
      
      return (
        <div className="bg-[#051728] border border-[#83E9FF4D] rounded-lg p-3 shadow-lg">
          <p className="text-[#83E9FF] font-medium mb-1">
            {formatDate(new Date(data.timestamp), dateFormat)}
          </p>
          <p className="text-white text-sm">
            {selectedChart === 'accountValue' 
              ? `Account Value: ${formatLargeNumber(value, { prefix: '$', decimals: 2 })}`
              : `PnL: ${value >= 0 ? '+' : ''}${formatLargeNumber(value, { prefix: '$', decimals: 2 })}`
            }
          </p>
        </div>
      );
    }
    return null;
  };

  if (error) {
    return (
      <Card className={`p-4 bg-[#051728E5] border border-red-500/50 shadow-sm backdrop-blur-sm rounded-md ${className}`}>
        <div className="flex items-center gap-2 text-red-400">
          <span className="text-sm">Failed to load vault chart</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`w-full bg-[#051728E5] border-2 border-[#83E9FF4D] hover:border-[#83E9FF80] transition-colors shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden rounded-lg ${className}`}>
      {/* Header avec tabs et contrôles */}
      <div className="absolute top-2 left-3 sm:left-6 right-3 sm:right-6 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-sm text-white font-medium">
              {getTitle()}
            </h2>
          </div>
          
          {/* Sélecteur de timeframe */}
          <div className="flex items-center bg-[#051728] rounded-md p-0.5 border border-[#83E9FF4D]">
            {timeframeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedTimeframe(option.value)}
                className={`px-2 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                  selectedTimeframe === option.value
                    ? 'bg-[#83E9FF] text-[#051728]'
                    : 'text-white hover:text-[#83E9FF]'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs pour le type de chart */}
        <div className="flex items-center bg-[#FFFFFF0A] rounded-lg p-1 mt-3">
          {chartTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setSelectedChart(tab.key)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                selectedChart === tab.key
                  ? 'bg-[#83E9FF] text-[#051728] shadow-sm'
                  : 'text-white hover:text-white hover:bg-[#FFFFFF0A]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="absolute inset-0 p-4 pt-20">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-[#83E9FF]" />
          </div>
        ) : filteredData.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-[#FFFFFF80]">No data available for this timeframe</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#83E9FF1A" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(time) => {
                  const date = new Date(time);
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
                stroke={getColor()}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: getColor() }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}; 