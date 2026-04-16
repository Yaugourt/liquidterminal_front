import { useState } from "react";
import { useChartFormat, useChartData, ChartPeriod, PeriodSelector, ChartLoading, ChartEmpty, chartColors, rechartsAxisDefaults, rechartsGridDefaults, rechartsTooltipContainer } from "@/components/common/charts";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { PortfolioApiResponse } from "@/services/explorer/address/types";

// Types pour le tooltip
interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
  }>;
  label?: string | number;
}

type ApiPeriod = 'day' | 'week' | 'month' | 'allTime';

const chartPeriodToApiPeriod: Record<ChartPeriod, ApiPeriod> = {
  '24h': 'day',
  '7d': 'week',
  '30d': 'month',
  '90d': 'month',
  '1y': 'allTime',
  'allTime': 'allTime'
};

interface PerformanceSectionProps {
  portfolioData?: PortfolioApiResponse | null;
  isLoading?: boolean;
}

export function PerformanceSection({ portfolioData, isLoading = false }: PerformanceSectionProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<ChartPeriod>('24h');
  const { formatValue } = useChartFormat();

  const availablePeriods: ChartPeriod[] = ['24h', '7d', '30d', 'allTime'];

  const rawData = portfolioData?.find(([period]) => period === chartPeriodToApiPeriod[selectedPeriod])?.[1]?.accountValueHistory?.map(([timestamp, value]) => ({
    timestamp: new Date(timestamp).getTime(),
    value: parseFloat(value)
  })) || [];

  const chartData = useChartData({
    data: rawData,
    getValue: (item) => item.value,
    getTimestamp: (item) => item.timestamp
  });

  // Calculer le pourcentage de changement pour la période sélectionnée
  const pnlData = portfolioData?.find(([period]) => period === chartPeriodToApiPeriod[selectedPeriod])?.[1]?.pnlHistory || [];
  const pnlPercentage = (() => {
    if (pnlData.length === 0 || rawData.length === 0) return 0;

    const firstValue = parseFloat(rawData[0]?.value.toString() || '0');
    const lastValue = parseFloat(rawData[rawData.length - 1]?.value.toString() || '0');

    if (firstValue === 0) return 0;

    return ((lastValue - firstValue) / firstValue) * 100;
  })();

  const formatOptions = {
    currency: 'USD',
    showCurrency: true,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  };

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const formattedValue = formatValue(value, formatOptions);
      return (
        <div className={rechartsTooltipContainer}>
          <p className="text-text-muted text-[10px] tabular-nums">
            {new Date(Number(label)).toLocaleDateString()}
          </p>
          <p className="text-brand-accent text-xs font-medium tabular-nums mt-0.5">
            {formattedValue}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <div className="absolute top-2 right-3 sm:right-6 z-10">
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className={`text-sm font-medium ${pnlPercentage >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              <span className="tabular-nums">{pnlPercentage >= 0 ? '+' : ''}{pnlPercentage.toFixed(2)}%</span>
            </p>
          </div>
          <PeriodSelector
            selected={selectedPeriod}
            onChange={setSelectedPeriod}
            options={availablePeriods}
          />
        </div>
      </div>

      <div className="absolute inset-0 p-4 pt-12">
        {isLoading ? (
          <ChartLoading />
        ) : chartData.data.length === 0 ? (
          <ChartEmpty />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData.data}>
              <CartesianGrid {...rechartsGridDefaults} />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(time) => {
                  const date = new Date(time);
                  if (selectedPeriod === "24h") {
                    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  }
                  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
                }}
                {...rechartsAxisDefaults}
              />
              <YAxis
                {...rechartsAxisDefaults}
                tickFormatter={(value) => formatValue(value, formatOptions)}
                domain={['dataMin', 'dataMax']}
                padding={{ top: 20, bottom: 20 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke={chartColors.cyan}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: chartColors.cyan }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </>
  );
} 