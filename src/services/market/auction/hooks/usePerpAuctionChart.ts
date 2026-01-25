'use client';

import { useMemo } from 'react';
import { ChartPeriod } from '@/components/common/charts';
import { usePastAuctionsPerp } from '@/services/market/perpDex/hooks';

/**
 * Hook for fetching perp auction chart data (gas price evolution)
 */
export const usePerpAuctionChart = (period: ChartPeriod) => {
  const { auctions, isLoading } = usePastAuctionsPerp();

  const data = useMemo(() => {
    if (!auctions || auctions.length === 0) return [];

    // Filter auctions with valid gas values
    const validAuctions = auctions.filter((a) =>
      a.maxGas !== null && a.maxGas !== undefined && !isNaN(a.maxGas)
    );

    if (validAuctions.length === 0) return [];

    // Calculate the date limit based on period
    const latestTime = Math.max(...validAuctions.map((a) => a.time.getTime()));
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

    // Transform data for the chart
    return validAuctions
      .filter((auction) => auction.time.getTime() >= dateLimit)
      .map((auction) => ({
        time: auction.time.getTime(),
        value: auction.maxGas as number
      }))
      .sort((a, b) => a.time - b.time);
  }, [auctions, period]);

  return {
    data,
    isLoading,
    error: null
  };
};
