"use client";

import { useState } from "react";
import { FilterType } from "@/components/types/dashboard.types";
import { ChartDisplay } from "./ChartDisplay";
import { FilterButtons } from "./TabsButton";
import { useChartPeriod } from '@/components/common/charts';
import { useChartTimeSeriesData, useFeesChartData } from "@/services/dashboard";

interface ChartSectionProps {
  chartHeight: number;
}

interface ChartSectionProps {
  chartHeight: number;
  isAuctionTabActive?: boolean;
  isPastAuctionTabActive?: boolean;
}

export const ChartSection = ({ chartHeight, isAuctionTabActive = false, isPastAuctionTabActive = false }: ChartSectionProps) => {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("bridge");
  const [selectedCurrency, setSelectedCurrency] = useState<"HYPE" | "USDC">("USDC");
  const [selectedFeeType, setSelectedFeeType] = useState<"all" | "spot">("all");
  const { selectedPeriod, handlePeriodChange, availablePeriods } = useChartPeriod({
    defaultPeriod: "7d",
    availablePeriods: ["7d", "30d", "90d", "1y"]
  });

  // Si on est sur les fees, utiliser le hook fees avec le type sélectionné, sinon utiliser le hook normal
  const feesData = useFeesChartData(selectedPeriod, selectedFeeType);
  const normalData = useChartTimeSeriesData(selectedFilter, selectedPeriod, selectedCurrency);
  
  const { data, isLoading } = selectedFilter === "fees" ? feesData : normalData;

  return (
    <div className={isAuctionTabActive || isPastAuctionTabActive ? "flex flex-col h-full" : "flex flex-col"}>
      <div className="flex flex-row mb-4 justify-start items-start">
        <FilterButtons
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
        />
      </div>



      <div className={isAuctionTabActive || isPastAuctionTabActive ? "flex-1 flex flex-col" : ""}>
        <ChartDisplay
          data={data}
          isLoading={isLoading}
          selectedFilter={selectedFilter}
          selectedPeriod={selectedPeriod}
          selectedCurrency={selectedCurrency}
          onCurrencyChange={setSelectedCurrency}
          onPeriodChange={handlePeriodChange}
          availablePeriods={availablePeriods}
          chartHeight={chartHeight}
          isAuctionTabActive={isAuctionTabActive}
          isPastAuctionTabActive={isPastAuctionTabActive}
          selectedFeeType={selectedFeeType}
          onFeeTypeChange={setSelectedFeeType}
        />
      </div>
    </div>
  );
}; 