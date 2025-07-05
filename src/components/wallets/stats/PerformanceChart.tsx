"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChartIcon, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePortfolio } from "@/services/explorer/address";
import { useWallets } from "@/store/use-wallets";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useChartFormat, useChartData, Chart, ChartPeriod } from "@/components/common/charts";

type ApiPeriod = 'day' | 'week' | 'month';

const chartPeriodToApiPeriod: Record<ChartPeriod, ApiPeriod> = {
  '24h': 'day',
  '7d': 'week',
  '30d': 'month',
  '90d': 'month',
  '1y': 'month'
};

export function PerformanceChart() {
  const { wallets, activeWalletId } = useWallets();
  const activeWallet = wallets.find(w => w.id === activeWalletId);
  const { data: portfolioData, isLoading, error } = usePortfolio(activeWallet?.address || '');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<ChartPeriod>('24h');
  const { formatValue } = useChartFormat();

  const chartData = useChartData({
    data: portfolioData?.find(([period]) => period === chartPeriodToApiPeriod[selectedPeriod])?.[1]?.accountValueHistory?.map(([timestamp, value]) => ({
      time: new Date(timestamp).getTime(),
      value: parseFloat(value)
    })) || [],
    period: selectedPeriod,
    getValue: (item) => item.value,
    getTimestamp: (item) => item.time
  });

  const totalValue = chartData.latestValue;

  const formatOptions = {
    currency: 'USD',
    showCurrency: true,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Erreur lors du rafraîchissement:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Card className="bg-[#051728] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] relative">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-4">
          <CardTitle className="text-[15px] text-white font-medium flex items-center gap-2">
            <LineChartIcon size={16} className="text-[#83E9FF]" />
            Performance
          </CardTitle>
          <Select value={selectedPeriod} onValueChange={(value: ChartPeriod) => setSelectedPeriod(value)}>
            <SelectTrigger className="w-[80px] bg-[#051728] border-[#83E9FF4D] text-white hover:bg-[#1692ADB2] hover:text-white text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#051728] border-[#83E9FF4D] text-white">
              <SelectItem value="24h" className="hover:bg-[#1692ADB2] hover:text-white focus:bg-[#1692ADB2] focus:text-white text-xs">24h</SelectItem>
              <SelectItem value="7d" className="hover:bg-[#1692ADB2] hover:text-white focus:bg-[#1692ADB2] focus:text-white text-xs">7d</SelectItem>
              <SelectItem value="30d" className="hover:bg-[#1692ADB2] hover:text-white focus:bg-[#1692ADB2] focus:text-white text-xs">30d</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[#FFFFFF80] text-xs mb-1">Total value</p>
            <p className="text-white text-sm font-medium">{formatValue(totalValue, formatOptions)}</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="text-[#83E9FF] hover:text-white hover:bg-[#1692ADB2]"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="sr-only">Actualiser</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[240px] w-full">
          <Chart
            data={chartData.data}
            isLoading={isLoading}
            error={error}
            height="100%"
            formatValue={(value) => formatValue(value, formatOptions)}
            formatTime={(time) => {
              const date = new Date(time);
              if (selectedPeriod === "24h") {
                return date.toLocaleTimeString([], { 
                  hour: '2-digit',
                  minute: '2-digit',
                });
              }
              return date.toLocaleDateString([], {
                month: 'numeric',
                day: 'numeric'
              });
            }}
            xAxisProps={{
              stroke: "#FFFFFF99",
              tick: { fill: '#FFFFFF99', fontSize: 11 },
              interval: "preserveEnd",
              minTickGap: 50,
              angle: -25,
              textAnchor: "end",
              height: 50
            }}
            yAxisProps={{
              stroke: "#FFFFFF99",
              tick: { fill: '#FFFFFF99', fontSize: 11 },
              scale: "log",
              domain: ['auto', 'auto'],
              width: 65
            }}
            gridProps={{
              stroke: "#FFFFFF1A"
            }}
            lineProps={{
              stroke: "#83E9FF",
              dot: false,
              strokeWidth: 2
            }}
          >
            {{
              loading: (
                <div className="absolute inset-0 flex items-center justify-center bg-[#051728CC] z-10">
                  <Loader2 className="w-8 h-8 text-[#83E9FF4D] animate-spin" />
                </div>
              ),
              empty: (
                <div className="h-[240px] w-full bg-[#041220] rounded-md flex items-center justify-center text-[#FFFFFF99]">
                  Aucune donnée disponible
                </div>
              ),
              error: (
                <div className="h-[240px] w-full bg-[#041220] rounded-md flex items-center justify-center text-red-500">
                  Une erreur est survenue lors du chargement des données
                </div>
              ),
              tooltip: ({ active, payload, label }) => {
                if (active && payload && payload.length && label) {
                  return (
                    <div className="bg-[#051728] border border-[#83E9FF4D] p-2 rounded">
                      <p className="text-[#FFFFFF99] text-xs">
                        {new Date(label).toLocaleString()}
                      </p>
                      <p className="text-white text-sm">
                        {formatValue(payload[0].value, formatOptions)}
                      </p>
                    </div>
                  );
                }
                return null;
              }
            }}
          </Chart>
        </div>
      </CardContent>
    </Card>
  );
}
