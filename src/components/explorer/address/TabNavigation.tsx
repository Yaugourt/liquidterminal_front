"use client";

import React from "react";
import { TabNavigationProps } from "@/components/types/explorer.types";

export function TabNavigation({ activeTab, onChange, tabs }: TabNavigationProps) {
  return (
    <div className="flex justify-start items-center">
      <div className="flex bg-brand-dark rounded-lg p-1 border border-white/5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-brand-accent text-brand-tertiary shadow-sm font-bold"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
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