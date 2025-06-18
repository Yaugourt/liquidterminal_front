import { useCallback, useMemo } from "react";
import { useLatestAuctions } from "./useLatestAuctions";
import { useHLBridge } from "./useHLBridge";
import { FilterType } from "@/components/types/dashboard.types";
import { ChartPeriod } from '@/components/common/charts';

export function useChartTimeSeriesData(selectedFilter: FilterType, selectedPeriod: ChartPeriod) {
  const { auctions, isLoading: auctionsLoading } = useLatestAuctions(200);
  const { bridgeData, isLoading: bridgeLoading } = useHLBridge();

  const getDateLimit = useCallback(() => {
    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;
    
    switch (selectedPeriod) {
      case "24h":
        return now - DAY;
      case "7d":
        return now - 7 * DAY;
      case "30d":
        return now - 30 * DAY;
      case "90d":
        return now - 90 * DAY;
      case "1y":
        return now - 365 * DAY;
      default:
        return 0;
    }
  }, [selectedPeriod]);

  const data = useMemo(() => {
    const dateLimit = getDateLimit();
    
    if (selectedFilter === "bridge" && bridgeData?.chainTvls?.Arbitrum?.tvl) {
      return bridgeData.chainTvls.Arbitrum.tvl
        .filter(item => item.date * 1000 >= dateLimit)
        .map(item => ({
          time: item.date * 1000,
          value: item.totalLiquidityUSD
        }))
        .sort((a, b) => a.time - b.time);
    }

    if (selectedFilter === "strict") {
      return auctions
        .filter(auction => auction?.time >= dateLimit)
        .map(auction => ({
          time: auction.time,
          value: parseFloat(auction.strictGas || "0")
        }))
        .sort((a, b) => a.time - b.time);
    }

    return auctions
      .filter(auction => auction?.time >= dateLimit)
      .map(auction => ({
        time: auction.time,
        value: parseFloat(auction.deployGas || "0")
      }))
      .sort((a, b) => a.time - b.time);
  }, [selectedFilter, bridgeData, auctions, getDateLimit]);

  const isLoading = useMemo(() => 
    selectedFilter === "bridge" 
      ? bridgeLoading 
      : auctionsLoading
  , [selectedFilter, bridgeLoading, auctionsLoading]);

  return {
    data,
    isLoading
  };
} 