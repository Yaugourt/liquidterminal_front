"use client";

import { Button } from "@/components/ui/button";
import { ChartPeriod } from "../types/chart";

export interface PeriodProps {
  selectedPeriod: ChartPeriod;
  onPeriodChange: (period: ChartPeriod) => void;
  availablePeriods?: ChartPeriod[];
  className?: string;
}

export function Period({
  selectedPeriod,
  onPeriodChange,
  availablePeriods = ["24h", "7d", "30d", "90d", "1y"],
  className = ""
}: PeriodProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {availablePeriods.map((period) => (
        <Button
          key={period}
          variant="ghost"
          size="sm"
          onClick={() => onPeriodChange(period)}
          className={`text-white px-3 sm:px-4 py-1 text-xs whitespace-nowrap ${
            selectedPeriod === period
              ? "bg-[#1692AD] hover:bg-[#1692AD] border-transparent"
              : "bg-[#051728] hover:bg-[#051728] border border-[#83E9FF4D]"
          }`}
        >
          {period}
        </Button>
      ))}
    </div>
  );
} 