"use client";

import { FilterButtonsProps } from "@/components/types/dashboard.types";

export const FilterButtons = ({ selectedFilter, onFilterChange }: FilterButtonsProps) => {
  const tabs: { key: "bridge" | "gas" | "fees"; label: string }[] = [
    { key: 'bridge', label: 'Bridge TVL' },
    { key: 'gas', label: 'Auction' },
    { key: 'fees', label: 'Total Fees' }
  ];

  return (
    <div className="flex bg-brand-dark rounded-lg p-1 border border-white/5">
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onFilterChange(tab.key)}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
            selectedFilter === tab.key
              ? 'bg-brand-accent text-brand-tertiary shadow-sm font-bold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
