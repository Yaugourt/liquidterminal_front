"use client";

import React from "react";
import { TabNavigationProps } from "@/components/types/explorer.types";

export function TabNavigation({ activeTab, onChange, tabs }: TabNavigationProps) {
  return (
    <div className="flex justify-start items-center mb-4">
      <div className="flex items-center bg-[#FFFFFF0A] rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-[#83E9FF] text-[#051728] shadow-sm"
                : "text-white hover:text-white hover:bg-[#FFFFFF0A]"
            }`}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Export default tabs configuration for address page
export const ADDRESS_TABS = [
  { id: "transactions", label: "Transactions" },
  { id: "holdings", label: "Holdings" },
  { id: "orders", label: "Orders" },
  { id: "twap", label: "TWAP" },
  { id: "vaults", label: "Vaults" },
  { id: "staking", label: "Staking" },
];