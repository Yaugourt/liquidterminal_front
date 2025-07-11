"use client";

import { useState } from "react";
import { AuctionChart } from "./AuctionChart";
import { useChartPeriod } from '@/components/common/charts';
import { useAuctionChart } from "@/services/market/auction/hooks/useAuctionChart";

interface AuctionChartSectionProps {
  chartHeight: number;
}

export const AuctionChartSection = ({ chartHeight }: AuctionChartSectionProps) => {
  const [selectedCurrency, setSelectedCurrency] = useState<"HYPE" | "USDC">("USDC");
  const { selectedPeriod, handlePeriodChange, availablePeriods } = useChartPeriod({
    defaultPeriod: "7d",
    availablePeriods: ["7d", "30d", "90d", "1y"]
  });

  const { data, isLoading } = useAuctionChart(selectedPeriod, selectedCurrency);

  return (
    <AuctionChart
      data={data}
      isLoading={isLoading}
      selectedCurrency={selectedCurrency}
      onCurrencyChange={setSelectedCurrency}
      selectedPeriod={selectedPeriod}
      onPeriodChange={handlePeriodChange}
      availablePeriods={availablePeriods}
      chartHeight={chartHeight}
    />
  );
}; 