import { useCallback, useMemo } from "react";
import { useHLBridge } from "./useHLBridge";
import { FilterType, DashboardData } from "@/components/types/dashboard.types";
import { ChartPeriod } from '@/components/common/charts';
import { useDataFetching } from "@/hooks/useDataFetching";
import { AuctionsResponse, AuctionInfo } from "../types";
import { fetchLatestAuctions } from "../api";

export function useChartTimeSeriesData(
  selectedFilter: FilterType, 
  selectedPeriod: ChartPeriod,
  selectedCurrency: "HYPE" | "USDC"
): { data: DashboardData[], isLoading: boolean } {
  const { data: auctionsData, isLoading: auctionsLoading } = useDataFetching<AuctionsResponse>({
    fetchFn: () => fetchLatestAuctions(1000),
    refreshInterval: 30000
  });

  const { bridgeData, isLoading: bridgeLoading } = useHLBridge();

  const getDateLimit = useCallback((latestTime: number) => {
    const DAY = 24 * 60 * 60 * 1000;
    
    switch (selectedPeriod) {
      case "24h":
        return latestTime - DAY;
      case "7d":
        return latestTime - 7 * DAY;
      case "30d":
        return latestTime - 30 * DAY;
      case "90d":
        return latestTime - 90 * DAY;
      case "1y":
        return latestTime - 365 * DAY;
      default:
        return 0;
    }
  }, [selectedPeriod]);

  // ----------------------------------------------
  // Memoised parsing of raw auctions response
  // ----------------------------------------------
  const {
    validUsdcAuctions,
    validHypeAuctions,
    latestUsdcTime,
    latestHypeTime
  } = useMemo(() => {
    if (!auctionsData?.success) {
      const now = Date.now();
      return {
        validUsdcAuctions: [] as AuctionInfo[],
        validHypeAuctions: [] as AuctionInfo[],
        latestUsdcTime: now,
        latestHypeTime: now
      };
    }

    const filterValid = (arr: AuctionInfo[]): AuctionInfo[] =>
      arr.filter((a) => !!a && !!a.time && !!a.deployGas && !isNaN(parseFloat(a.deployGas)));

    const usdc = filterValid(auctionsData.data.usdcAuctions);
    const hype = filterValid(auctionsData.data.hypeAuctions);

    return {
      validUsdcAuctions: usdc,
      validHypeAuctions: hype,
      latestUsdcTime: usdc.length ? Math.max(...usdc.map((a) => a.time)) : Date.now(),
      latestHypeTime: hype.length ? Math.max(...hype.map((a) => a.time)) : Date.now()
    };
  }, [auctionsData]);

  const data = useMemo(() => {
    // Handle Bridge TVL ---------------------------------------------
    if (selectedFilter === "bridge" && bridgeData?.chainTvls?.Arbitrum?.tvl) {
      // This branch is already very light – no optimisation needed
      const tvlData = bridgeData.chainTvls.Arbitrum.tvl;
      const latestTime = Math.max(...tvlData.map(item => item.date * 1000));
      const dateLimit = getDateLimit(latestTime);
      
      // Map the TVL response to the generic DashboardData structure so the
      // hook always returns a consistent shape.
      return tvlData
        .filter(item => item.date * 1000 >= dateLimit)
        .map(item => ({
          time: item.date * 1000,
          value: item.totalLiquidityUSD
        }));
    }

    if (!auctionsData?.success) return [];

    // Use the latest timestamp of the *selected currency* to compute the date limit.
    // Using the max of both currencies could incorrectly exclude all data for the
    // currently displayed currency if the other currency happens to be more recent.
    const latestTime = selectedCurrency === "USDC" ? latestUsdcTime : latestHypeTime;

    const dateLimit = getDateLimit(latestTime);

    // Transformer les données
    const usdcAuctions = validUsdcAuctions
      .filter((auction: AuctionInfo) => auction.time >= dateLimit)
      .map((auction: AuctionInfo) => ({
        time: auction.time,
        value: parseFloat(auction.deployGas)
      }))
      .sort((a: DashboardData, b: DashboardData) => a.time - b.time);

    const hypeAuctions = validHypeAuctions
      .filter((auction: AuctionInfo) => auction.time >= dateLimit)
      .map((auction: AuctionInfo) => ({
        time: auction.time,
        value: parseFloat(auction.deployGas)
      }))
      .sort((a: DashboardData, b: DashboardData) => a.time - b.time);

    return selectedCurrency === "USDC" ? usdcAuctions : hypeAuctions;
  }, [selectedFilter, bridgeData, auctionsData, selectedCurrency, getDateLimit, validUsdcAuctions, validHypeAuctions, latestUsdcTime, latestHypeTime]);

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