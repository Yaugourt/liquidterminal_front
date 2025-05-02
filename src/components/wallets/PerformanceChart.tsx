"use client";

import { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart as LineChartIcon, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePortfolio } from "@/services/explorer/hooks/usePortfolio";
import { useWallets } from "@/store/use-wallets";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ChartData {
  timestamp: Date;
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
  }>;
  label?: string;
}

type TimePeriod = 'day' | 'week' | 'month';

export function PerformanceChart() {
  const { wallets, activeWalletId } = useWallets();
  const activeWallet = wallets.find(w => w.id === activeWalletId);
  const { data: portfolioData, isLoading, error } = usePortfolio(activeWallet?.address || '');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('day');

  // Transformer les données pour le graphique
  const chartData = useMemo(() => {
    if (!portfolioData) return [];

    // Trouver les données de la période sélectionnée
    const periodData = portfolioData.find(([period]) => period === selectedPeriod);
    if (!periodData || !periodData[1].accountValueHistory) return [];

    return periodData[1].accountValueHistory.map(([timestamp, value]) => ({
      timestamp: new Date(timestamp),
      value: parseFloat(value)
    }));
  }, [portfolioData, selectedPeriod]);

  // Obtenir la dernière valeur pour l'affichage
  const totalValue = useMemo(() => {
    if (chartData.length === 0) return 0;
    return chartData[chartData.length - 1].value;
  }, [chartData]);

  // Fonction pour formater les valeurs monétaires
  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }, []);

  // Fonction pour formater les dates sur l'axe X
  const formatXAxis = useCallback((timestamp: number) => {
    const date = new Date(timestamp);
    
    if (selectedPeriod === 'day') {
      return date.toLocaleTimeString([], { 
        hour: '2-digit',
        minute: '2-digit',
      });
    } else {
      return date.toLocaleDateString([], {
        month: 'numeric',
        day: 'numeric'
      });
    }
  }, [selectedPeriod]);

  // Fonction pour formater les valeurs monétaires de l'axe Y
  const formatYAxis = useCallback((value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(1)}`;
  }, []);

  // Fonction pour rafraîchir manuellement les données
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Pour le moment, on simule juste un rafraîchissement
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Erreur lors du rafraîchissement:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Personnalisation du tooltip
  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length > 0 && label) {
      return (
        <div className="bg-[#051728] border border-[#83E9FF4D] p-2 rounded">
          <p className="text-[#FFFFFF99] text-xs">
            {new Date(label).toLocaleString()}
          </p>
          <p className="text-white text-sm">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-[#051728] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] relative">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-4">
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <LineChartIcon size={18} className="text-[#83E9FF]" />
            Performance
          </CardTitle>
          <Select value={selectedPeriod} onValueChange={(value: TimePeriod) => setSelectedPeriod(value)}>
            <SelectTrigger className="w-[80px] bg-[#051728] border-[#83E9FF4D] text-white hover:bg-[#1692ADB2] hover:text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#051728] border-[#83E9FF4D] text-white">
              <SelectItem value="day" className="hover:bg-[#1692ADB2] hover:text-white focus:bg-[#1692ADB2] focus:text-white">24h</SelectItem>
              <SelectItem value="week" className="hover:bg-[#1692ADB2] hover:text-white focus:bg-[#1692ADB2] focus:text-white">7d</SelectItem>
              <SelectItem value="month" className="hover:bg-[#1692ADB2] hover:text-white focus:bg-[#1692ADB2] focus:text-white">30d</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[#FFFFFF99] text-sm mb-1">Total value</p>
            <p className="text-white text-xl">{formatCurrency(totalValue)}</p>
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
        {error ? (
          <div className="h-[240px] w-full bg-[#041220] rounded-md flex items-center justify-center text-red-500">
            Une erreur est survenue lors du chargement des données
          </div>
        ) : chartData.length > 0 ? (
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#FFFFFF1A" />
                <XAxis 
                  dataKey="timestamp"
                  tickFormatter={formatXAxis}
                  stroke="#FFFFFF99"
                  tick={{ fill: '#FFFFFF99' }}
                  interval="preserveEnd"
                  minTickGap={50}
                  angle={-25}
                  textAnchor="end"
                  height={50}
                />
                <YAxis 
                  stroke="#FFFFFF99"
                  tick={{ fill: '#FFFFFF99' }}
                  tickFormatter={formatYAxis}
                  scale="log"
                  domain={['auto', 'auto']}
                  width={65}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#83E9FF" 
                  dot={false}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[240px] w-full bg-[#041220] rounded-md flex items-center justify-center text-[#FFFFFF99]">
            Aucune donnée disponible
          </div>
        )}
      </CardContent>
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#051728CC] z-10">
          <Loader2 className="w-8 h-8 text-[#83E9FF4D] animate-spin" />
        </div>
      )}
    </Card>
  );
}
