import { useState } from "react";
import { Loader2 } from "lucide-react";
import { usePortfolio } from "@/services/explorer/address";
import { useWallets } from "@/store/use-wallets";
import { useChartFormat, useChartData, ChartPeriod } from "@/components/common/charts";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

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

const AnimatedPeriodSelector = ({ 
  selectedPeriod, 
  onPeriodChange, 
  availablePeriods 
}: { 
  selectedPeriod: ChartPeriod; 
  onPeriodChange: (period: ChartPeriod) => void; 
  availablePeriods: ChartPeriod[]; 
}) => {
  return (
    <div className="relative flex items-center bg-brand-tertiary rounded-md p-0.5 border border-[#83E9FF4D]">
      {availablePeriods.map((period) => (
        <button
          key={period}
          onClick={() => onPeriodChange(period)}
          className={`relative z-10 px-2 py-1 text-xs font-medium transition-colors duration-200 whitespace-nowrap rounded-sm ${
            selectedPeriod === period 
              ? 'bg-brand-accent text-brand-tertiary' 
              : 'text-white hover:text-brand-accent'
          }`}
        >
          {period}
        </button>
      ))}
    </div>
  );
};

export function PerformanceSection() {
  const { wallets, activeWalletId } = useWallets();
  const activeWallet = wallets.find(w => w.id === activeWalletId);
  const { data: portfolioData, isLoading } = usePortfolio(activeWallet?.address || '');
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
        <div className="bg-brand-tertiary border border-[#83E9FF4D] p-2 rounded-md">
          <p className="text-white text-xs">
            {new Date(Number(label)).toLocaleDateString()}
          </p>
          <p className="text-brand-accent font-medium">
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
            <p className={`text-sm font-medium ${pnlPercentage >= 0 ? 'text-[#4ADE80]' : 'text-[#FF5757]'}`}>
              {pnlPercentage >= 0 ? '+' : ''}{pnlPercentage.toFixed(2)}%
            </p>
          </div>
          <AnimatedPeriodSelector
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
            availablePeriods={availablePeriods}
          />
        </div>
      </div>

      <div className="absolute inset-0 p-4 pt-12">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-brand-accent" />
          </div>
        ) : chartData.data.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-[#FFFFFF80]">No data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#83E9FF1A" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(time) => {
                  const date = new Date(time);
                  if (selectedPeriod === "24h") {
                    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  }
                  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
                }}
                stroke="#FFFFFF99"
                fontSize={12}
              />
              <YAxis
                stroke="#FFFFFF99"
                fontSize={12}
                tickFormatter={(value) => formatValue(value, formatOptions)}
                domain={['dataMin', 'dataMax']}
                padding={{ top: 20, bottom: 20 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#83E9FF"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#83E9FF" }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </>
  );
} 