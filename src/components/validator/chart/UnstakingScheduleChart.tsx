import { memo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useUnstakingStatsForChartWithDays } from "@/services/validator/hooks/staking/useUnstakingStats";
import { useNumberFormat } from "@/store/number-format.store";
import { useDateFormat } from "@/store/date-format.store";
import { formatNumber, formatLargeNumber } from "@/lib/formatting";
import { formatDate } from "@/lib/date-formatting";

interface UnstakingScheduleChartProps {
  height?: number;
  barCount?: number;
}
/**
 * Chart en barres pour afficher les tokens qui vont être débloqués par heure sur 10 jours
 */
export const UnstakingScheduleChart = memo(function UnstakingScheduleChart({ 
  height = 200,
  barCount = 10
}: UnstakingScheduleChartProps) {
  const { format } = useNumberFormat();
  const { format: dateFormat } = useDateFormat();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  // Récupérer les stats d'unstaking avec données formatées pour la chart selon le nombre de barres
  const { chartData, isLoading, error } = useUnstakingStatsForChartWithDays(barCount);
  
  // Calculer la largeur des barres selon le nombre
  const getBarSize = (count: number) => {
    if (count <= 7) return 60;
    if (count <= 15) return 40;
    if (count <= 30) return 25;
    if (count <= 60) return 15;
    return 10;
  };
  
  const maxBarSize = getBarSize(barCount);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length && hoveredIndex !== null) {
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
          <p className="text-white/60 text-sm">Loading unstaking schedule...</p>
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
          <p className="text-white/60 text-sm">No unstaking scheduled for the next {barCount} days</p>
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
              bottom: 20,
            }}
          >
          <CartesianGrid strokeDasharray="3 3" stroke="#83E9FF20" />
          <XAxis 
            dataKey="day" 
            stroke="#f9e370"
            fontSize={barCount > 30 ? 10 : 11}
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#FFFFFF' }}
            angle={barCount > 15 ? -45 : 0}
            textAnchor={barCount > 15 ? "end" : "middle"}
            height={barCount > 15 ? 40 : 25}
            interval={barCount <= 7 ? 0 : barCount <= 15 ? "preserveStartEnd" : Math.ceil(barCount / 8)}
            minTickGap={barCount > 30 ? 30 : 20}
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
          <Bar 
            dataKey="totalTokens" 
            radius={[2, 2, 0, 0]}
            opacity={0.8}
            maxBarSize={maxBarSize}
          >
            {chartData.map((entry: any, index: number) => (
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