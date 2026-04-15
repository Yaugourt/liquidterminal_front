"use client";

import { useState } from "react";
import { AuctionChart } from "./AuctionChart";
import { useChartPeriod } from '@/components/common/charts';
import { useAuctionChart } from "@/services/market/auction/hooks/useAuctionChart";
import { usePerpAuctionChart } from "@/services/market/auction/hooks/usePerpAuctionChart";

interface AuctionChartSectionProps {
  chartHeight: number;
  marketType: "spot" | "perp";
}

export const AuctionChartSection = ({ chartHeight, marketType }: AuctionChartSectionProps) => {
  // Currency state - only used for spot (perp is always HYPE)
  const [selectedCurrency, setSelectedCurrency] = useState<"HYPE" | "USDC">("USDC");
  const { selectedPeriod, handlePeriodChange, availablePeriods } = useChartPeriod({
    defaultPeriod: "7d",
    availablePeriods: ["7d", "30d", "90d", "1y"]
  });

  const { data: spotData, isLoading: spotLoading, error: spotError, refetch: spotRefetch } = useAuctionChart(selectedPeriod, selectedCurrency);
  const { data: perpData, isLoading: perpLoading, error: perpError, refetch: perpRefetch } = usePerpAuctionChart(selectedPeriod);

  const data = marketType === "spot" ? spotData : perpData;
  const isLoading = marketType === "spot" ? spotLoading : perpLoading;
  const error = marketType === "spot" ? spotError : perpError;
  const refetch = marketType === "spot" ? spotRefetch : perpRefetch;
  const displayCurrency = marketType === "perp" ? "HYPE" : selectedCurrency;

  return (
    <AuctionChart
      data={data}
      isLoading={isLoading}
      error={error}
      onRetry={refetch}
      selectedCurrency={displayCurrency}
      onCurrencyChange={setSelectedCurrency}
      selectedPeriod={selectedPeriod}
      onPeriodChange={handlePeriodChange}
      availablePeriods={availablePeriods}
      chartHeight={chartHeight}
      marketType={marketType}
    />
  );
};
