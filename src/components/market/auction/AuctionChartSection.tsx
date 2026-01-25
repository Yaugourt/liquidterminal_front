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

  // Fetch data from both hooks unconditionally (hooks must be called consistently)
  const { data: spotData, isLoading: spotLoading } = useAuctionChart(selectedPeriod, selectedCurrency);
  const { data: perpData, isLoading: perpLoading } = usePerpAuctionChart(selectedPeriod);

  // Select the appropriate data based on market type
  const data = marketType === "spot" ? spotData : perpData;
  const isLoading = marketType === "spot" ? spotLoading : perpLoading;
  // For perp, currency is always HYPE
  const displayCurrency = marketType === "perp" ? "HYPE" : selectedCurrency;

  return (
    <AuctionChart
      data={data}
      isLoading={isLoading}
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
