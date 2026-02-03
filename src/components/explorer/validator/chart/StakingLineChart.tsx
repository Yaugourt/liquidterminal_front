import { memo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useUnstakingStatsForChartWithPeriod } from "@/services/explorer/validator/hooks/staking/useUnstakingStats";
import { useNumberFormat } from "@/store/number-format.store";
import { useDateFormat } from "@/store/date-format.store";
import { formatNumber, formatLargeNumber } from "@/lib/formatters/numberFormatting";
import { formatDate } from "@/lib/formatters/dateFormatting";
import { ChartPeriod } from "@/components/common/charts/types/chart";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";

// Types pour le tooltip
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


export const StakingLineChart = memo(function StakingLineChart({ 
  period = '7d'
}: StakingLineChartProps) {
  const { format } = useNumberFormat();
  const { format: dateFormat } = useDateFormat();
  
  // Récupérer les stats d'unstaking avec données formatées pour la chart selon la période
  const { chartData: filteredData, isLoading, error } = useUnstakingStatsForChartWithPeriod(period);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const date = new Date(data.date);
      
      return (
        <div className="bg-brand-secondary/95 backdrop-blur-md border border-border-subtle rounded-lg p-3 shadow-xl shadow-black/40">
          <p className="text-brand-accent font-medium mb-1">
            {formatDate(date, dateFormat)}
          </p>
          <p className="text-white text-sm">{`Tokens: ${formatNumber(data.totalTokens, format)} HYPE`}</p>
          <p className="text-brand-gold text-sm">{`${Math.round(data.transactionCount)} transaction${data.transactionCount > 1 ? 's' : ''}`}</p>
          <p className="text-white text-xs">{`${Math.round(data.uniqueUsers)} user${data.uniqueUsers > 1 ? 's' : ''}`}</p>
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
          <LineChart
            data={filteredData}
            margin={{
              top: 8,
              right: 8,
              left: 8,
              bottom: period === '1y' ? 18 : 35,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-brand-accent/10" />
            <XAxis 
              dataKey="day" 
              className="stroke-brand-gold"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#FFFFFF' }}
              angle={-45}
              textAnchor="end"
              height={40}
              interval={period === '1y' ? Math.ceil(filteredData.length / 8) : "preserveStartEnd"}
              minTickGap={period === '1y' ? 30 : 20}
            />
            <YAxis 
              className="stroke-brand-gold"
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
            <Line 
              type="monotone"
              dataKey="totalTokens" 
              className="stroke-brand-accent"
              strokeWidth={2}
              dot={{ className: 'fill-brand-accent', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, className: 'fill-brand-accent' }}
            />
          </LineChart>
        </ResponsiveContainer>
    </div>
  );
}); 