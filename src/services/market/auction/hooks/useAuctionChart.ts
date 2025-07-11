import { useState, useEffect } from 'react';
import { ChartPeriod } from '@/components/common/charts';

interface AuctionChartData {
  time: number;
  value: number;
}

export const useAuctionChart = (period: ChartPeriod, currency: "HYPE" | "USDC") => {
  const [data, setData] = useState<AuctionChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAuctionChartData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Simuler des données d'auction pour le moment
        // Tu peux remplacer par un vrai appel API plus tard
        const mockData: AuctionChartData[] = [];
        const now = Date.now();
        const periodHours = period === "7d" ? 7 * 24 : period === "30d" ? 30 * 24 : period === "90d" ? 90 * 24 : 365 * 24;
        const intervalMs = (periodHours * 60 * 60 * 1000) / 50; // 50 points de données

        for (let i = 0; i < 50; i++) {
          const time = now - (49 - i) * intervalMs;
          const baseValue = currency === "USDC" ? 1000 : 500;
          const variation = Math.sin(i * 0.3) * 100 + Math.random() * 50;
          const value = Math.max(baseValue + variation, 0);
          
          mockData.push({
            time,
            value: Math.round(value * 100) / 100
          });
        }

        setData(mockData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement des données');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuctionChartData();
  }, [period, currency]);

  return { data, isLoading, error };
}; 