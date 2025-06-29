"use client";

import { FilterButtonsProps } from "@/components/types/dashboard.types";

export const FilterButtons = ({ selectedFilter, onFilterChange }: FilterButtonsProps) => {
  const tabs: { key: "bridge" | "gas"; label: string }[] = [
    { key: 'bridge', label: 'Bridge TVL' },
    { key: 'gas', label: 'Auction' }
  ];

  return (
    <div className="flex justify-start items-center">
      <div className="flex items-center bg-[#FFFFFF0A] rounded-lg p-1">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => onFilterChange(tab.key)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              selectedFilter === tab.key
                ? 'bg-[#83E9FF] text-[#051728] shadow-sm'
                : 'text-[#FFFFFF99] hover:text-white hover:bg-[#FFFFFF0A]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}; 