import { useMemo } from 'react';
import { ChartPeriod } from '@/components/common/charts';
import { useAuctions } from '../hooks/useAuctions';

interface AuctionChartData {
  time: number;
  value: number;
}

export const useAuctionChart = (period: ChartPeriod, currency: "HYPE" | "USDC") => {
  // Utiliser le même hook que le dashboard
  const { auctions: allAuctions, isLoading } = useAuctions({
    limit: 10000,
    currency: "ALL"
  });

  const data = useMemo(() => {
    if (!allAuctions || allAuctions.length === 0) return [];

    // Séparer les auctions par currency et filtrer les valides
    const validAuctions = allAuctions.filter((a) => 
      a.currency === currency && 
      !!a && !!a.time && !!a.deployGas && 
      !isNaN(parseFloat(a.deployGas))
    );

    if (validAuctions.length === 0) return [];

    // Calculer la limite de date basée sur la période
    const latestTime = Math.max(...validAuctions.map((a) => a.time));
    const DAY = 24 * 60 * 60 * 1000;
    
    let dateLimit: number;
    switch (period) {
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

    // Transformer les données exactement comme le dashboard
    return validAuctions
      .filter((auction) => auction.time >= dateLimit)
      .map((auction) => ({
        time: auction.time,
        value: parseFloat(auction.deployGas)
      }))
      .sort((a, b) => a.time - b.time);
  }, [allAuctions, currency, period]);

  return { 
    data, 
    isLoading, 
    error: null 
  };
}; 