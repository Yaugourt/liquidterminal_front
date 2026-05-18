"use client";

import { useMemo, useState } from "react";
import {
  useChartFormat,
  useChartData,
  ChartPeriod,
  PeriodSelector,
  ChartLoading,
  ChartEmpty,
  AuroraAreaChart,
  chartColors,
} from "@/components/common";
import { PortfolioApiResponse } from "@/services/explorer/address/types";

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

  const rawData = useMemo(
    () =>
      portfolioData
        ?.find(([period]) => period === chartPeriodToApiPeriod[selectedPeriod])?.[1]
        ?.accountValueHistory?.map(([timestamp, value]) => ({
          timestamp: new Date(timestamp).getTime(),
          value: parseFloat(value),
        })) || [],
    [portfolioData, selectedPeriod]
  );

  const chartData = useChartData({
    data: rawData,
    getValue: (item) => item.value,
    getTimestamp: (item) => item.timestamp
  });

  // PnL % over the selected period (drives the line color + header badge)
  const pnlPercentage = useMemo(() => {
    if (rawData.length === 0) return 0;
    const firstValue = rawData[0]?.value ?? 0;
    const lastValue = rawData[rawData.length - 1]?.value ?? 0;
    if (firstValue === 0) return 0;
    return ((lastValue - firstValue) / firstValue) * 100;
  }, [rawData]);

  const isPositive = pnlPercentage >= 0;
  const lineColor = isPositive ? chartColors.emerald : chartColors.rose;

  const formatOptions = useMemo(
    () => ({
      currency: 'USD' as const,
      showCurrency: true,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
    []
  );

  // AuroraAreaChart expects `{ time, value }`. Remap once here so downstream
  // re-renders stay cheap.
  const auroraData = useMemo(
    () => chartData.data.map((d) => ({ time: d.timestamp as number, value: d.value as number })),
    [chartData.data]
  );

  const formatTime = (ms: number) => {
    const date = new Date(ms);
    if (selectedPeriod === "24h") {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <>
      {/* Ambient glow tied to the sign of PnL — subtle emerald up / rose down */}
      <div
        className={`pointer-events-none absolute -top-24 -right-16 h-56 w-56 rounded-full blur-3xl transition-colors duration-500 ${
          isPositive ? "bg-emerald-500/[0.08]" : "bg-rose-500/[0.08]"
        }`}
      />
      <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-brand/[0.06] blur-3xl" />

      {/* Header — PnL + aurora period selector */}
      <div className="absolute top-2 right-3 sm:right-6 z-20">
        <div className="flex items-center gap-3 flex-wrap justify-end">
          <div
            className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold tabular-nums ${
              isPositive
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border-rose-500/30 bg-rose-500/10 text-rose-300"
            }`}
          >
            <span
              className={`h-1 w-1 rounded-full ${
                isPositive ? "bg-emerald-400" : "bg-rose-400"
              }`}
            />
            {isPositive ? '+' : ''}
            {pnlPercentage.toFixed(2)}%
          </div>
          <PeriodSelector
            selected={selectedPeriod}
            onChange={setSelectedPeriod}
            options={availablePeriods}
            variant="aurora"
          />
        </div>
      </div>

      <div className="absolute inset-0 p-4 pt-12 z-10">
        {isLoading ? (
          <ChartLoading />
        ) : auroraData.length === 0 ? (
          <ChartEmpty />
        ) : (
          <AuroraAreaChart
            data={auroraData}
            lineColor={lineColor}
            formatValue={(v) => formatValue(v, formatOptions)}
            formatTime={formatTime}
          />
        )}
      </div>
    </>
  );
}
