import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ActivitySquare, TrendingUp, Clock } from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

// Type pour les données d'activité
interface ActivityData {
  date: string;
  transactions: number;
  uniqueAddresses: number;
  volume: number;
}

type TimeRange = "24h" | "7d" | "30d" | "all";
type ChartMetric = "transactions" | "uniqueAddresses" | "volume";

// Custom tooltip component
const CustomTooltip = ({ active, payload, label, metric }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#051728] border border-[#83E9FF4D] p-2 rounded-md">
        <p className="text-[#FFFFFF99] text-xs">{label}</p>
        <p className="text-[#83E9FF] font-medium">
          {metric === "volume" 
            ? `$${payload[0].value.toLocaleString()}` 
            : payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export function HoldersActivityChart() {
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [metric, setMetric] = useState<ChartMetric>("transactions");
  const [activityData, setActivityData] = useState<ActivityData[]>([]);

  // Générer des données fictives
  const generateMockData = () => {
    const now = new Date();
    const data: ActivityData[] = [];
    
    // Générer des données pour les derniers 30 jours
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Formater la date selon le format souhaité
      const dateString = date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit'
      });
      
      // Générer des valeurs aléatoires avec une tendance à la hausse
      const baseTx = 5000 + Math.random() * 1000;
      const baseAddresses = 2000 + Math.random() * 500;
      const baseVolume = 1000000 + Math.random() * 200000;
      
      // Ajouter une tendance de croissance
      const growthFactor = 1 + (i / 30) * 0.5;
      
      data.push({
        date: dateString,
        transactions: Math.round(baseTx * growthFactor),
        uniqueAddresses: Math.round(baseAddresses * growthFactor),
        volume: Math.round(baseVolume * growthFactor)
      });
    }
    
    return data;
  };

  // Filtrer les données selon la plage de temps sélectionnée
  const getFilteredData = () => {
    switch(timeRange) {
      case "24h":
        return activityData.slice(-2);
      case "7d":
        return activityData.slice(-8);
      case "30d":
        return activityData;
      case "all":
        return activityData;
      default:
        return activityData;
    }
  };

  // Simuler le chargement des données
  useEffect(() => {
    const timer = setTimeout(() => {
      const mockData = generateMockData();
      setActivityData(mockData);
      setIsLoading(false);
    }, 1200);
    
    return () => clearTimeout(timer);
  }, []);

  // Libellé pour la métrique sélectionnée
  const metricLabel = {
    transactions: "Transactions",
    uniqueAddresses: "Unique Addresses",
    volume: "Volume ($)"
  };

  // Données filtrées selon la plage de temps
  const filteredData = getFilteredData();

  return (
    <Card className="bg-[#051728E5] rounded-xl border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#83E9FF33]">
        <div className="flex items-center">
          <ActivitySquare className="w-5 h-5 mr-2 text-[#83E9FF]" />
          <h3 className="text-white text-lg font-medium">Holders Activity</h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-[#83E9FF1A] text-[#83E9FF] border-[#83E9FF33]">
            <div className="flex items-center">
              <span className="mr-1 text-xs">●</span>
              Connected
            </div>
          </Badge>
        </div>
      </div>

      <div className="p-4">
        <div className="flex flex-wrap justify-between items-center mb-4">
          <div className="flex gap-2 mb-2 sm:mb-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMetric("transactions")}
              className={`text-white px-3 py-1 text-xs ${
                metric === "transactions"
                  ? "bg-[#1692AD] hover:bg-[#1692AD] border-transparent"
                  : "bg-[#051728] hover:bg-[#051728] border border-[#83E9FF4D]"
              }`}
            >
              <TrendingUp className="w-3 h-3 mr-1" />
              Transactions
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMetric("uniqueAddresses")}
              className={`text-white px-3 py-1 text-xs ${
                metric === "uniqueAddresses"
                  ? "bg-[#1692AD] hover:bg-[#1692AD] border-transparent"
                  : "bg-[#051728] hover:bg-[#051728] border border-[#83E9FF4D]"
              }`}
            >
              <ActivitySquare className="w-3 h-3 mr-1" />
              Addresses
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMetric("volume")}
              className={`text-white px-3 py-1 text-xs ${
                metric === "volume"
                  ? "bg-[#1692AD] hover:bg-[#1692AD] border-transparent"
                  : "bg-[#051728] hover:bg-[#051728] border border-[#83E9FF4D]"
              }`}
            >
              <TrendingUp className="w-3 h-3 mr-1" />
              Volume
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTimeRange("24h")}
              className={`text-white px-3 py-1 text-xs ${
                timeRange === "24h"
                  ? "bg-[#1692AD] hover:bg-[#1692AD] border-transparent"
                  : "bg-[#051728] hover:bg-[#051728] border border-[#83E9FF4D]"
              }`}
            >
              <Clock className="w-3 h-3 mr-1" />
              24H
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTimeRange("7d")}
              className={`text-white px-3 py-1 text-xs ${
                timeRange === "7d"
                  ? "bg-[#1692AD] hover:bg-[#1692AD] border-transparent"
                  : "bg-[#051728] hover:bg-[#051728] border border-[#83E9FF4D]"
              }`}
            >
              7D
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTimeRange("30d")}
              className={`text-white px-3 py-1 text-xs ${
                timeRange === "30d"
                  ? "bg-[#1692AD] hover:bg-[#1692AD] border-transparent"
                  : "bg-[#051728] hover:bg-[#051728] border border-[#83E9FF4D]"
              }`}
            >
              30D
            </Button>
          </div>
        </div>

        <div className="h-[230px]">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1692AD]"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={filteredData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#83E9FF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#83E9FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#83E9FF1A" />
                <XAxis 
                  dataKey="date" 
                  stroke="#FFFFFF99"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#FFFFFF99"
                  fontSize={12}
                  tickFormatter={(value) => 
                    metric === "volume"
                      ? `$${(value / 1000)}k`
                      : value >= 1000 
                        ? `${Math.round(value / 1000)}k` 
                        : value
                  }
                />
                <Tooltip content={<CustomTooltip metric={metric} />} />
                <Area 
                  type="monotone" 
                  dataKey={metric} 
                  stroke="#83E9FF" 
                  fillOpacity={1}
                  fill="url(#colorMetric)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </Card>
  );
} 