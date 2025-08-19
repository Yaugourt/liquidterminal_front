"use client";

import { useState } from "react";
import { AuctionChart } from "./AuctionChart";
import { useChartPeriod } from '@/components/common/charts';
import { useAuctionChart } from "@/services/market/auction/hooks/useAuctionChart";

interface AuctionChartSectionProps {
  chartHeight: number;
  marketType: "spot" | "perp";
}

export const AuctionChartSection = ({ chartHeight, marketType }: AuctionChartSectionProps) => {
  // Toujours appeler tous les hooks de manière inconditionnelle
  const [selectedCurrency, setSelectedCurrency] = useState<"HYPE" | "USDC">("USDC");
  const { selectedPeriod, handlePeriodChange, availablePeriods } = useChartPeriod({
    defaultPeriod: "7d",
    availablePeriods: ["7d", "30d", "90d", "1y"]
  });

  // Toujours appeler useAuctionChart, même pour perp
  const { data: fetchedData, isLoading: fetchedLoading } = useAuctionChart(selectedPeriod, selectedCurrency);

  // Déterminer les données à utiliser après avoir appelé tous les hooks
  const data = marketType === "spot" ? fetchedData : [];
  const isLoading = marketType === "spot" ? fetchedLoading : false;

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
      marketType={marketType}
    />
  );
};
