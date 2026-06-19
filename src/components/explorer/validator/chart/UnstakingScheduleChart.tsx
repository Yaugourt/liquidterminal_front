"use client";

import { memo, useId, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { chartColors, rechartsAxisDefaults, rechartsGridDefaults } from "@/components/common";
import { useUnstakingStatsForChartWithDays } from "@/services/explorer/validator/hooks/staking/useUnstakingStats";
import { useNumberFormat } from "@/store/number-format.store";
import { useDateFormat } from "@/store/date-format.store";
import { formatNumber, formatLargeNumber } from "@/lib/formatters/numberFormatting";
import { formatDate } from "@/lib/formatters/dateFormatting";
import { LoadingState } from "@/components/ui/loading-state";

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      date: string;
      totalTokens: number;
      transactionCount: number;
      uniqueUsers: number;
    };
  }>;
}

interface ChartDataPoint {
  day: string;
  date: string;
  totalTokens: number;
  transactionCount: number;
  uniqueUsers: number;
}

interface UnstakingScheduleChartProps {
  height?: number;
  barCount?: number;
}

/**
 * Aurora-styled bar chart for upcoming unstaking events over N days.
 */
export const UnstakingScheduleChart = memo(function UnstakingScheduleChart({
  height = 200,
  barCount = 10
}: UnstakingScheduleChartProps) {
  const { format } = useNumberFormat();
  const { format: dateFormat } = useDateFormat();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const uid = useId().replace(/:/g, "");
  const gradientId = `unstake-${uid}`;

  const { chartData, isLoading, error } = useUnstakingStatsForChartWithDays(barCount);

  const getBarSize = (count: number) => {
    if (count <= 7) return 60;
    if (count <= 15) return 40;
    if (count <= 30) return 25;
    if (count <= 60) return 15;
    return 10;
  };

  const maxBarSize = getBarSize(barCount);

  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length && hoveredIndex !== null) {
      const data = payload[0].payload;
      const date = new Date(data.date);

      return (
        <div className="rounded-lg border border-border-default bg-base/95 backdrop-blur-md px-3 py-2.5 shadow-2xl shadow-black/40 min-w-[170px]">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
            {formatDate(date, dateFormat)}
          </div>
          <div className="mt-2 space-y-1 text-xs">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-text-secondary">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: chartColors.cyan, boxShadow: `0 0 8px ${chartColors.cyanArea}` }}
                />
                <span>Tokens</span>
              </div>
              <span className="font-semibold text-text-primary tabular-nums">
                {formatNumber(data.totalTokens, format)} HYPE
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-text-secondary">Transactions</span>
              <span className="font-semibold text-gold tabular-nums">
                {Math.round(data.transactionCount)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-text-secondary">Users</span>
              <span className="font-semibold text-text-primary tabular-nums">
                {Math.round(data.uniqueUsers)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingState withCard={false} message="Loading unstaking schedule..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-danger text-sm mb-1">Error loading data</p>
          <p className="text-text-tertiary text-xs">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!chartData.length) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-secondary text-sm">No unstaking scheduled for the next {barCount} days</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 8, right: 8, left: 8, bottom: 20 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={chartColors.cyan} stopOpacity={0.95} />
              <stop offset="100%" stopColor={chartColors.cyan} stopOpacity={0.25} />
            </linearGradient>
          </defs>
          <CartesianGrid {...rechartsGridDefaults} />
          <XAxis
            dataKey="day"
            {...rechartsAxisDefaults}
            fontSize={barCount > 30 ? 10 : 11}
            angle={barCount > 15 ? -45 : 0}
            textAnchor={barCount > 15 ? "end" : "middle"}
            height={barCount > 15 ? 40 : 25}
            interval={barCount <= 7 ? 0 : barCount <= 15 ? "preserveStartEnd" : Math.ceil(barCount / 8)}
            minTickGap={barCount > 30 ? 30 : 20}
          />
          <YAxis
            {...rechartsAxisDefaults}
            tickFormatter={(value) => formatLargeNumber(value)}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            allowEscapeViewBox={{ x: false, y: false }}
          />
          <Bar
            dataKey="totalTokens"
            radius={[3, 3, 0, 0]}
            fill={`url(#${gradientId})`}
            stroke={chartColors.cyan}
            strokeOpacity={0.4}
            strokeWidth={1}
            maxBarSize={maxBarSize}
          >
            {chartData.map((_entry: ChartDataPoint, index: number) => (
              <Cell
                key={`cell-${index}`}
                fillOpacity={hoveredIndex === index ? 0.6 : 1}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});
