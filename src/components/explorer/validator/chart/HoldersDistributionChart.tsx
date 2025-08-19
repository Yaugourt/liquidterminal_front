import { memo, useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useHoldersStats } from "@/services/explorer/validator/hooks/useHoldersStats";
import { HoldersDistributionRange } from "@/services/explorer/validator/types/holders";
import { useNumberFormat } from "@/store/number-format.store";
import { formatLargeNumber, formatNumber } from "@/lib/formatters/numberFormatting";

// Types pour le tooltip
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
 * Chart en barres pour afficher la distribution des holders par range
 */
export const HoldersDistributionChart = memo(function HoldersDistributionChart({ 
  height = 180 
}: HoldersDistributionChartProps) {
  const { format } = useNumberFormat();
  const { stats, isLoading, error } = useHoldersStats();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Formater les données pour le chart
  const chartData = useMemo(() => {
    if (!stats?.distributionByRange) return [];

    return stats.distributionByRange.map((range: HoldersDistributionRange) => ({
      range: range.range,
      holders: range.holdersCount,
      staked: range.totalStaked,
      percentage: range.percentage
    }));
  }, [stats]);

  // Custom tooltip - only show when hovering over a bar
  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length && hoveredIndex !== null) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#051728] border border-[#83E9FF4D] rounded-lg p-3 shadow-lg">
          <p className="text-[#83E9FF] font-medium mb-1">{`Range: ${label} HYPE`}</p>
          <p className="text-white text-sm">{`Holders: ${formatNumber(data.holders, format)}`}</p>
          <p className="text-white text-sm">{`Staked: ${formatNumber(data.staked, format)} HYPE`}</p>
          <p className="text-[#f9e370] text-sm">{`${formatNumber(data.percentage, format)}% of total`}</p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#83E9FF] mx-auto mb-2"></div>
          <p className="text-white/60 text-sm">Loading distribution data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-sm mb-1">Error loading data</p>
          <p className="text-white/40 text-xs">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!chartData.length) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60 text-sm">No distribution data available</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height }} className="w-full">
              <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 8,
              right: 8,
              left: 8,
              bottom: 8,
            }}
          >
          <CartesianGrid strokeDasharray="3 3" stroke="#83E9FF20" />
          <XAxis 
            dataKey="range" 
            stroke="#FFFFFF"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#FFFFFF' }}
          />
          <YAxis 
            stroke="#FFFFFF"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#FFFFFF' }}
            tickFormatter={(value) => formatLargeNumber(value)}
          />
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={false}
            allowEscapeViewBox={{ x: false, y: false }}
          />
          <Bar 
            dataKey="holders" 
            radius={[4, 4, 0, 0]}
            opacity={0.8}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={hoveredIndex === index ? "#a3f3ff" : "#83E9FF"}
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