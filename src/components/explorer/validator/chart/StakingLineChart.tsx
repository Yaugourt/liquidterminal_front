"use client";

import { memo, useId } from "react";
import { Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { chartColors, rechartsAxisDefaults, rechartsGridDefaults } from "@/components/common";
import { useUnstakingStatsForChartWithPeriod } from "@/services/explorer/validator/hooks/staking/useUnstakingStats";
import { useNumberFormat } from "@/store/number-format.store";
import { useDateFormat } from "@/store/date-format.store";
import { formatNumber, formatLargeNumber } from "@/lib/formatters/numberFormatting";
import { formatDate } from "@/lib/formatters/dateFormatting";
import { ChartPeriod } from "@/components/common";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";

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

interface StakingLineChartProps {
  height?: number;
  period?: ChartPeriod;
}

/**
 * Aurora-styled area chart for historical unstaking/staking activity.
 */
export const StakingLineChart = memo(function StakingLineChart({
  period = '7d'
}: StakingLineChartProps) {
  const { format } = useNumberFormat();
  const { format: dateFormat } = useDateFormat();
  const uid = useId().replace(/:/g, "");
  const gradientId = `staking-area-${uid}`;

  const { chartData: filteredData, isLoading, error } = useUnstakingStatsForChartWithPeriod(period);

  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const date = new Date(data.date);

      return (
        <div className="rounded-xl border border-border-hover bg-brand-main/95 backdrop-blur-md px-3 py-2.5 shadow-2xl shadow-black/40 min-w-[170px]">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
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
              <span className="font-semibold text-brand-gold tabular-nums">
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
    return <LoadingState message="Loading unstaking data..." size="md" withCard={false} />;
  }

  if (error) {
    return <ErrorState title="Error loading data" message={error.message} withCard={false} />;
  }

  if (!filteredData.length) {
    return <EmptyState title="No unstaking data" description="No data for the selected period" withCard={false} />;
  }

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={filteredData}
          margin={{
            top: 8,
            right: 8,
            left: 8,
            bottom: period === '1y' ? 18 : 35,
          }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={chartColors.cyan} stopOpacity={0.45} />
              <stop offset="100%" stopColor={chartColors.cyan} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid {...rechartsGridDefaults} />
          <XAxis
            dataKey="day"
            {...rechartsAxisDefaults}
            angle={-45}
            textAnchor="end"
            height={40}
            interval={period === '1y' ? Math.ceil(filteredData.length / 8) : "preserveStartEnd"}
            minTickGap={period === '1y' ? 30 : 20}
          />
          <YAxis
            {...rechartsAxisDefaults}
            tickFormatter={(value) => formatLargeNumber(value)}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: "rgba(131,233,255,0.35)", strokeDasharray: "3 3" }}
            allowEscapeViewBox={{ x: false, y: false }}
          />
          <Area
            type="monotone"
            dataKey="totalTokens"
            stroke={chartColors.cyan}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
            activeDot={{
              r: 4,
              fill: chartColors.cyan,
              stroke: chartColors.labelBg,
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
});
