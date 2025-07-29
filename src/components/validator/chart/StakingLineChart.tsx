import { memo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useUnstakingStatsForChartWithPeriod } from "@/services/validator/hooks/staking/useUnstakingStats";
import { useNumberFormat } from "@/store/number-format.store";
import { useDateFormat } from "@/store/date-format.store";
import { formatNumber, formatLargeNumber } from "@/lib/numberFormatting";
import { formatDate } from "@/lib/dateFormatting";
import { ChartPeriod } from "@/components/common/charts/types/chart";

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
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const date = new Date(data.date);
      
      return (
        <div className="bg-[#051728] border border-[#83E9FF4D] rounded-lg p-3 shadow-lg">
          <p className="text-[#83E9FF] font-medium mb-1">
            {formatDate(date, dateFormat)}
          </p>
          <p className="text-white text-sm">{`Tokens: ${formatNumber(data.totalTokens, format)} HYPE`}</p>
          <p className="text-[#f9e370] text-sm">{`${Math.round(data.transactionCount)} transaction${data.transactionCount > 1 ? 's' : ''}`}</p>
          <p className="text-white text-xs">{`${Math.round(data.uniqueUsers)} user${data.uniqueUsers > 1 ? 's' : ''}`}</p>
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
          <p className="text-white/60 text-sm">Loading unstaking data...</p>
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

  if (!filteredData.length) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60 text-sm">No unstaking data for the selected period</p>
        </div>
      </div>
    );
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
            <CartesianGrid strokeDasharray="3 3" stroke="#83E9FF20" />
            <XAxis 
              dataKey="day" 
              stroke="#f9e370"
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
              stroke="#f9e370"
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
              stroke="#83E9FF"
              strokeWidth={2}
              dot={{ fill: '#83E9FF', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, fill: '#83E9FF' }}
            />
          </LineChart>
        </ResponsiveContainer>
    </div>
  );
}); 