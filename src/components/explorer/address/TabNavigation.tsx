"use client";

import React from "react";

type Tab = {
  id: string;
  label: string;
};

interface TabNavigationProps {
  activeTab: string;
  onChange: (tabId: string) => void;
  tabs: Tab[];
}

export function TabNavigation({ activeTab, onChange, tabs }: TabNavigationProps) {
  return (
    <div className="flex gap-1.5 mb-5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-transparent">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`px-3.5 py-1.5 rounded-md whitespace-nowrap text-sm font-medium transition-all ${
            activeTab === tab.id
              ? "bg-[#051728] text-[#83E9FF] border border-[#83E9FF33] shadow-sm"
              : "bg-[#1B9AAA] text-white hover:bg-[#138696] border border-transparent hover:shadow-sm"
          }`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// Export default tabs configuration for address page
export const ADDRESS_TABS = [
  { id: "transactions", label: "Transactions" },
  { id: "holdings", label: "Holdings" },
  { id: "orders", label: "Orders" },
  { id: "vaults", label: "Vaults" },
  { id: "staking", label: "Staking" },
];