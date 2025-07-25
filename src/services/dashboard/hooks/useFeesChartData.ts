import { useMemo } from "react";
import { useFeesHistory } from "../../market/fees/hooks/useFeesHistory";
import { ChartPeriod } from '@/components/common/charts';
import { DashboardData } from "@/components/types/dashboard.types";

export function useFeesChartData(
  selectedPeriod: ChartPeriod,
  feeType: "all" | "spot"
): { data: DashboardData[], isLoading: boolean } {
  const { feesHistory, isLoading } = useFeesHistory();

  const data = useMemo(() => {
    if (!feesHistory || feesHistory.length === 0) return [];

    // Calculer la limite de date basée sur la période
    const latestTime = Math.max(...feesHistory.map(entry => new Date(entry.time).getTime()));
    const DAY = 24 * 60 * 60 * 1000;
    
    let dateLimit: number;
    switch (selectedPeriod) {
      case "24h":
        dateLimit = latestTime - DAY;
        break;
      case "7d":
        dateLimit = latestTime - 7 * DAY;
        break;
      case "30d":
        dateLimit = latestTime - 30 * DAY;
        break;
      case "90d":
        dateLimit = latestTime - 90 * DAY;
        break;
      case "1y":
        dateLimit = latestTime - 365 * DAY;
        break;
      default:
        dateLimit = 0;
    }

    // Filtrer les données selon la période
    const filteredData = feesHistory
      .filter(entry => new Date(entry.time).getTime() >= dateLimit)
      .map(entry => ({
        ...entry,
        timestamp: new Date(entry.time).getTime()
      }))
      .sort((a, b) => a.timestamp - b.timestamp);

    // Grouper par jour et prendre le dernier snapshot de chaque jour
    const dailyData = new Map<string, typeof filteredData[0]>();
    
    filteredData.forEach(entry => {
      const dateKey = new Date(entry.timestamp).toISOString().split('T')[0]; // YYYY-MM-DD
      
      // Si on a déjà une entrée pour ce jour, on garde celle qui est la plus proche de minuit
      if (!dailyData.has(dateKey) || 
          Math.abs(entry.timestamp - new Date(dateKey + 'T23:59:59').getTime()) < 
          Math.abs(dailyData.get(dateKey)!.timestamp - new Date(dateKey + 'T23:59:59').getTime())) {
        dailyData.set(dateKey, entry);
      }
    });

    // Convertir en tableau et transformer selon le type de fees
    return Array.from(dailyData.values())
      .map(entry => ({
        time: entry.timestamp,
        value: feeType === "all" ? entry.total_fees : entry.total_spot_fees
      }))
      .sort((a, b) => a.time - b.time);
  }, [feesHistory, selectedPeriod, feeType]);

  return {
    data,
    isLoading
  };
} 