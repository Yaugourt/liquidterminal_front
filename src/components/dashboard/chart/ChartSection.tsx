"use client";

import { useState } from "react";
import { FilterType } from "@/components/types/dashboard.types";
import { ChartDisplay } from "./ChartDisplay";
import { FilterButtons } from "./TabsButton";
import { Period, useChartPeriod } from '@/components/common/charts';
import { useChartTimeSeriesData } from "@/services/dashboard";

interface ChartSectionProps {
  chartHeight: number;
}

export const ChartSection = ({ chartHeight }: ChartSectionProps) => {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("bridge");
  const [selectedCurrency, setSelectedCurrency] = useState<"HYPE" | "USDC">("USDC");
  const { selectedPeriod, handlePeriodChange, availablePeriods } = useChartPeriod({
    defaultPeriod: "7d",
    availablePeriods: ["7d", "30d", "90d", "1y"]
  });

  const { data, isLoading } = useChartTimeSeriesData(selectedFilter, selectedPeriod, selectedCurrency);

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-row mb-4 justify-between items-start">
        <FilterButtons
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
        />
        <Period
          selectedPeriod={selectedPeriod}
          onPeriodChange={handlePeriodChange}
          availablePeriods={availablePeriods}
          className="w-auto"
        />
      </div>

      <ChartDisplay
        data={data}
        isLoading={isLoading}
        selectedFilter={selectedFilter}
        selectedPeriod={selectedPeriod}
        selectedCurrency={selectedCurrency}
        onCurrencyChange={setSelectedCurrency}
        chartHeight={chartHeight}
      />
    </div>
  );
}; 