"use client";

import { useState } from "react";
import { ChartDisplay } from "./ChartDisplay";
import { FeesTabsButton } from "./FeesTabsButton";
import { useChartPeriod } from '@/components/common/charts';
import { useFeesChartData } from "@/services/dashboard";

interface FeesChartSectionProps {
  chartHeight: number;
}

export const FeesChartSection = ({ chartHeight }: FeesChartSectionProps) => {
  const [selectedFeeType, setSelectedFeeType] = useState<"all" | "spot">("all");
  const { selectedPeriod, handlePeriodChange, availablePeriods } = useChartPeriod({
    defaultPeriod: "7d",
    availablePeriods: ["7d", "30d", "90d", "1y"]
  });

  const { data, isLoading } = useFeesChartData(selectedPeriod, selectedFeeType);

  return (
    <div className="flex flex-col">
      <div className="flex flex-row mb-4 justify-start items-start">
        <FeesTabsButton
          selectedFeeType={selectedFeeType}
          onFeeTypeChange={setSelectedFeeType}
        />
      </div>

      <div className="flex-1 flex flex-col">
        <ChartDisplay
          data={data}
          isLoading={isLoading}
          selectedFilter="fees"
          selectedPeriod={selectedPeriod}
          onPeriodChange={handlePeriodChange}
          availablePeriods={availablePeriods}
          chartHeight={chartHeight}
        />
      </div>
    </div>
  );
}; 