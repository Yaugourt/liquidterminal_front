"use client";

import { Button } from "@/components/ui/button";
import { FilterButtonsProps } from "@/components/types/dashboard.types";

export const FilterButtons = ({ selectedFilter, onFilterChange }: FilterButtonsProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onFilterChange("bridge")}
        className={`px-3 sm:px-4 py-1 text-xs whitespace-nowrap transition-colors uppercase font-bold
          ${selectedFilter === "bridge"
            ? "bg-[#051728] text-white border border-[#83E9FF4D]"
            : "bg-[#1692AD] text-white border-transparent"}
        `}
      >
        BRIDGE TVL
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onFilterChange("gas")}
        className={`px-3 sm:px-4 py-1 text-xs whitespace-nowrap transition-colors uppercase font-bold
          ${selectedFilter === "gas"
            ? "bg-[#051728] text-white border border-[#83E9FF4D]"
            : "bg-[#1692AD] text-white border-transparent"}
        `}
      >
        AUCTION
      </Button>
    </div>
  );
}; 