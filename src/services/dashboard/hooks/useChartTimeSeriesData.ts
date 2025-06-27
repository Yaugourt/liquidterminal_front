import { useCallback, useMemo } from "react";
import { useHLBridge } from "./useHLBridge";
import { FilterType, DashboardData } from "@/components/types/dashboard.types";
import { ChartPeriod } from '@/components/common/charts';
import { useAuctions } from "../../market/auction";
import { AuctionInfo } from "../../market/auction/types";

export function useChartTimeSeriesData(
  selectedFilter: FilterType, 
  selectedPeriod: ChartPeriod,
  selectedCurrency: "HYPE" | "USDC"
): { data: DashboardData[], isLoading: boolean } {
  // Utiliser le nouveau hook auctions avec une limite élevée pour récupérer toutes les données
  const { auctions: allAuctions, isLoading: auctionsLoading } = useAuctions({
    limit: 10000, // Limite élevée pour récupérer toutes les données
    currency: "ALL" // Récupérer HYPE et USDC
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
  // Séparation et validation des auctions par currency
  // ----------------------------------------------
  const {
    validUsdcAuctions,
    validHypeAuctions,
    latestUsdcTime,
    latestHypeTime
  } = useMemo(() => {
    if (!allAuctions || allAuctions.length === 0) {
      const now = Date.now();
      return {
        validUsdcAuctions: [] as AuctionInfo[],
        validHypeAuctions: [] as AuctionInfo[],
        latestUsdcTime: now,
        latestHypeTime: now
      };
    }

    // Séparer les auctions par currency et filtrer les valides
    const usdc = allAuctions.filter((a) => 
      a.currency === "USDC" && 
      !!a && !!a.time && !!a.deployGas && 
      !isNaN(parseFloat(a.deployGas))
    );
    
    const hype = allAuctions.filter((a) => 
      a.currency === "HYPE" && 
      !!a && !!a.time && !!a.deployGas && 
      !isNaN(parseFloat(a.deployGas))
    );

    return {
      validUsdcAuctions: usdc,
      validHypeAuctions: hype,
      latestUsdcTime: usdc.length ? Math.max(...usdc.map((a) => a.time)) : Date.now(),
      latestHypeTime: hype.length ? Math.max(...hype.map((a) => a.time)) : Date.now()
    };
  }, [allAuctions]);

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

    if (!allAuctions || allAuctions.length === 0) return [];

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
  }, [selectedFilter, bridgeData, allAuctions, selectedCurrency, getDateLimit, validUsdcAuctions, validHypeAuctions, latestUsdcTime, latestHypeTime]);

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