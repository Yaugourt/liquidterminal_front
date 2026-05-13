"use client";

import { memo, useId, useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { chartColors, rechartsAxisDefaults, rechartsGridDefaults } from "@/components/common";
import { useHoldersStats } from "@/services/explorer/validator/hooks/useHoldersStats";
import { HoldersDistributionRange } from "@/services/explorer/validator/types/holders";
import { useNumberFormat } from "@/store/number-format.store";
import { formatLargeNumber, formatNumber } from "@/lib/formatters/numberFormatting";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      holders: number;
      staked: number;
      percentage: number;
    };
  }>;
  label?: string;
}

interface HoldersDistributionChartProps {
  height?: number;
}

/**
 * Aurora-styled distribution histogram of holders by stake range.
 */
export const HoldersDistributionChart = memo(function HoldersDistributionChart({
  height = 180
}: HoldersDistributionChartProps) {
  const { format } = useNumberFormat();
  const { stats, isLoading, error } = useHoldersStats();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const uid = useId().replace(/:/g, "");
  const gradientId = `holders-dist-${uid}`;

  const chartData = useMemo(() => {
    if (!stats?.distributionByRange) return [];
    return stats.distributionByRange.map((range: HoldersDistributionRange) => ({
      range: range.range,
      holders: range.holdersCount,
      staked: range.totalStaked,
      percentage: range.percentage
    }));
  }, [stats]);

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length && hoveredIndex !== null) {
      const data = payload[0].payload;
      return (
        <div className="rounded-xl border border-border-hover bg-brand-main/95 backdrop-blur-md px-3 py-2.5 shadow-2xl shadow-black/40 min-w-[180px]">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
            {`Range: ${label} HYPE`}
          </div>
          <div className="mt-2 space-y-1 text-xs">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-text-secondary">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: chartColors.cyan, boxShadow: `0 0 8px ${chartColors.cyanArea}` }}
                />
                <span>Holders</span>
              </div>
              <span className="font-semibold text-white tabular-nums">
                {formatNumber(data.holders, format)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-text-secondary">Staked</span>
              <span className="font-semibold text-white tabular-nums">
                {formatNumber(data.staked, format)} HYPE
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-text-secondary">Share</span>
              <span className="font-semibold text-brand-gold tabular-nums">
                {formatNumber(data.percentage, format)}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return <LoadingState message="Loading distribution data..." size="md" withCard={false} />;
  }

  if (error) {
    return <ErrorState title="Error loading data" message={error.message} withCard={false} />;
  }

  if (!chartData.length) {
    return <EmptyState title="No distribution data" description="Check back later" withCard={false} />;
  }

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={chartColors.cyan} stopOpacity={0.95} />
              <stop offset="100%" stopColor={chartColors.cyan} stopOpacity={0.25} />
            </linearGradient>
          </defs>
          <CartesianGrid {...rechartsGridDefaults} />
          <XAxis dataKey="range" {...rechartsAxisDefaults} />
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
            dataKey="holders"
            radius={[4, 4, 0, 0]}
            fill={`url(#${gradientId})`}
            stroke={chartColors.cyan}
            strokeOpacity={0.4}
            strokeWidth={1}
          >
            {chartData.map((_entry, index) => (
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
